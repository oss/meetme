import { calendars, usersCalendars, usersOrganizations, timeblocks } from "../../db/schema.js";

import type { OrganizationService, LoggerInstance, DatabaseInstance } from "#common/types.js";
import { type Policy, Role, CompareType, canAccess } from "#common/rbac.js";
import AppError from "#common/errors.js";

import { eq, and } from "drizzle-orm";

type InsertCalendar = typeof calendars.$inferInsert;
type InsertTimeblock = typeof timeblocks.$inferInsert;

export default function createCalendarService(
  logger: LoggerInstance,
  database: DatabaseInstance,
  organizationService: OrganizationService,
) {
  const db = database;

  return {
    /// Retrieves a calendar with the given `id` for a user based on the
    /// `access`. This can be used to get the calendar as well as run checks for
    /// writing. The returned calendar DOES NOT contain timeblocks of users for
    /// performance reasons. Use getTimeblocks(id, userid) for that.
    async getCalendar(id: number, userid: number, policy: Policy) {
      // It is possible to replace this with two queries and a unionAll. I need
      // to investigate if that has better performance, but right now it doesn't
      // matter too much. I doubt we will hit a case where it will matter.
      const [data] = await db
        .select()
        .from(calendars)
        .leftJoin(
          usersOrganizations,
          and(
            eq(usersOrganizations.organizationId, calendars.organizationId),
            eq(usersOrganizations.userId, userid),
          ),
        )
        .leftJoin(
          usersCalendars,
          and(eq(usersCalendars.calendarId, calendars.id), eq(usersCalendars.userId, userid)),
        )
        .where(eq(calendars.id, id));

      if (!data) {
        logger.info(`User ${userid} accessed nonexistant calendar ${id}`);
        throw AppError.forbidden();
      } else if (data.users_organizations && !canAccess(data.users_organizations.role, policy)) {
        logger.info(`User ${userid} accessed organization ${id} with insufficient permissions`);
        throw AppError.forbidden();
      } else if (data.users_calendars && !canAccess(data.users_calendars.role, policy)) {
        if (policy.compareType === CompareType.Not && policy.role === Role.OWNER) {
          throw AppError.badRequest(
            "You cannot perform this action as the owner, please transfer ownership first",
          );
        }
        logger.info(`User ${userid} accessed calendar ${id} with insufficient permissions`);
        throw AppError.forbidden();
      } else if (!data.users_calendars && !data.users_organizations) {
        logger.warn(`Calendar ${id} has no users or organization owners, this shouldn't happen`);
        throw AppError.forbidden();
      }

      return data.calendars;
    },

    /// Creates a calendar with the parameters in the given body.  When an User
    /// creating the calendar, they becomes its owner. When a User creates the
    /// calendar on behalf of an Organization, the Organization becomes the
    /// owner of the calendar. The user must have sufficient privileges "owner",
    /// "admin", or "editor" in order to be able to create a calendar.
    async createCalendar(body: InsertCalendar, netid: number) {
      const orgId = body.organizationId;
      if (orgId && orgId !== null) {
        logger.info(`User ${netid} created a calendar for ${orgId}`);
        await organizationService.getOrganization(orgId, netid, { role: Role.EDITOR });
      }

      const [calendar] = await db.insert(calendars).values(body).returning();
      if (!calendar) {
        throw AppError.serverError("Unable to create calendar");
      }
      if (!orgId || orgId === null) {
        logger.info(`User ${netid} created a calendar`);
        await db.insert(usersCalendars).values({
          userId: netid,
          calendarId: calendar.id,
          role: "OWNER",
        });
      }
      return calendar;
    },

    /// Deletes a calendar. The User must either be the owner or an admin,
    /// editor, or owner of an Organization in order to delete the calendar.
    async deleteCalendar(id: number, userid: number) {
      logger.info(`User ${userid} deleting calendar ${id}`);
      await this.getCalendar(id, userid, { role: Role.EDITOR });
      await db.delete(calendars).where(eq(calendars.id, id));
    },

    /// Modifies simple settings of a calendar. The User must either be the
    /// owner of the calendar or an admin, editor, or owner of an Organization
    /// in order to modify the settings.
    async patchSettings(id: number, settings: InsertCalendar, userid: number) {
      logger.info(`User ${userid} applying ${JSON.stringify(settings)} to calendar ${id}`);
      await this.getCalendar(id, userid, { role: Role.EDITOR });
      const [cal] = await db
        .update(calendars)
        .set(settings)
        .where(eq(calendars.id, id))
        .returning();
      if (!cal) {
        throw AppError.serverError("Unable to edit calendar");
      }
      return cal;
    },

    async addTimeblock(id: number, block: InsertTimeblock, userid: number) {
      logger.info(`User ${userid} is adding timeblock ${JSON.stringify(block)} calendar ${id}`);
      await this.getCalendar(id, userid, { role: Role.MEMBER });
      const [timeblock] = await db
        .insert(timeblocks)
        .values(block)
        .onConflictDoUpdate({
          target: timeblocks.id,
          set: {
            start: block.start,
            end: block.end,
            description: block.description,
          },
        })
        .returning();
      if (!timeblock) {
        throw AppError.serverError("Unable to add the timeblock");
      }
      return timeblock;
    },

    async deleteTimeblock(id: number, timeblockid: number, userid: number) {
      logger.info(`User ${userid} is deleting timeblock ${timeblockid} calendar ${id}`);
      await this.getCalendar(id, userid, { role: Role.MEMBER });
      const [timeblock] = await db
        .delete(timeblocks)
        .where(eq(timeblocks.id, timeblockid))
        .returning();
      if (!timeblock) {
        throw AppError.serverError("Unable to delete the timeblock");
      }
      return timeblock;
    },

    async getTimeblocks(id: number, userid: number) {
      logger.info(`User ${userid} is fetching timeblocks of calendar ${id}`);
      await this.getCalendar(id, userid, { role: Role.VIEWER });
      const blocks = db.select().from(timeblocks).where(eq(timeblocks.calendarId, id));
      return blocks;
    },

    async shareCalendar(id: number, users: number[], userid: number) {
      logger.info(`User ${userid} is sharing calendar ${id} with users ${users.toString()}`);
      await this.getCalendar(id, userid, { role: Role.EDITOR });
      const sharedWith = await db
        .insert(usersCalendars)
        .values(
          users.map((uid) => ({
            userId: uid,
            calendarId: id,
            role: "INVITED" as const,
          })),
        )
        .onConflictDoNothing({ target: [usersCalendars.userId, usersCalendars.calendarId] })
        .returning();
      return sharedWith;
    },

    async unshareCalendar(id: number, user: number, userid: number) {
      logger.info(`User ${userid} is unsharing calendar ${id} with user ${user}`);
      await this.getCalendar(id, userid, { role: Role.EDITOR });
      if (user === userid) {
        throw AppError.badRequest(
          "You cannot remove yourself, please use /api/calendar/:id/leave instead",
        );
      }
      const deleted = await db.delete(usersCalendars).where(and(eq(usersCalendars.userId, user)));
      if (!deleted) {
        throw AppError.serverError("Unable to remove user, maybe the user isn't in the calendar?");
      }
    },

    async joinCalendar(id: number, isSharelink: boolean, userid: number) {
      logger.info(`User ${userid} accepting invite to calendar ${id}`);
      const cal = await this.getCalendar(id, userid, {
        role: Role.INVITED,
        compareType: CompareType.Exact,
      });
      if (isSharelink && cal.shareLink === false) {
        throw AppError.badRequest("ShareLink disabled, request is invalid");
      }

      const [user] = await db
        .update(usersCalendars)
        .set({ role: "MEMBER" })
        .where(and(eq(usersCalendars.userId, userid), eq(usersCalendars.calendarId, id)))
        .returning();
      if (!user) {
        throw AppError.serverError("Unable to join the calendar");
      }
    },

    async leaveCalendar(id: number, userid: number) {
      logger.info(`User ${userid} is leaving calendar ${id}`);
      await this.getCalendar(id, userid, { role: Role.OWNER, compareType: CompareType.Not });
      const [user] = await db
        .delete(usersCalendars)
        .where(and(eq(usersCalendars.userId, userid), eq(usersCalendars.calendarId, id)))
        .returning();
      if (!user) {
        throw AppError.serverError("Unable to leave the calendar");
      }
    },

    async setOwner(id: number, owner: number, isOrg: boolean, userid: number) {
      logger.info(
        `User ${userid} transferring ownership of calendar ${id} to User ${JSON.stringify(owner)}`,
      );
      const cal = await this.getCalendar(id, userid, { role: Role.EDITOR });
      db.transaction(async (tx) => {
        if (isOrg) {
          tx.update(calendars).set({ organizationId: owner }).where(eq(calendars.id, id));
        } else {
          tx.delete(usersCalendars).where(
            and(eq(usersCalendars.calendarId, id), eq(usersCalendars.userId, owner)),
          );
          tx.insert(usersCalendars).values({
            userId: owner,
            calendarId: id,
            role: "OWNER",
          });

          tx.delete(usersCalendars).where(
            and(eq(usersCalendars.calendarId, id), eq(usersCalendars.userId, userid)),
          );
        }
      });
      return cal;
    },
  };
}
