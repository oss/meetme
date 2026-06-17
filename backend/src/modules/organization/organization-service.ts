import { organizations, usersOrganizations } from "../../db/schema.js";

import { type LoggerInstance, type DatabaseInstance } from "#common/types.js";
import { type Policy, Role, CompareType, canAccess } from "#common/rbac.js";
import AppError from "#common/errors.js";

import { eq, and } from "drizzle-orm";

export default function createOrganizationService(
  logger: LoggerInstance,
  database: DatabaseInstance,
) {
  const db = database;

  return {
    /// Creates an organization with the given `name` and `userid` as the owner.
    async createOrganization(name: string, userid: number) {
      const [org] = await db
        .insert(organizations)
        .values({
          name: name || "unnamed organization",
        })
        .returning();
      if (!org) {
        throw AppError.serverError("Unable to create organization");
      }

      await db.insert(usersOrganizations).values({
        userId: userid,
        organizationId: org.id,
        role: "OWNER",
      });
      return org;
    },

    /// Gets the organization with the given `id` where the user `userid` has the
    /// given `role` or higher in. See `src/db/schema.ts` for role ranking.
    async getOrganization(id: number, userid: number, policy: Policy) {
      logger.info(
        `Checking user ${userid} permissions in org ${id} with policy = ${JSON.stringify(policy)}`,
      );
      const [org] = await db
        .select()
        .from(organizations)
        .leftJoin(
          usersOrganizations,
          and(
            eq(usersOrganizations.organizationId, organizations.id),
            eq(usersOrganizations.userId, userid),
          ),
        )
        .where(eq(organizations.id, id));
      if (org === undefined) {
        logger.info(`User ${userid} accessed non-existant organization ${id}`);
        throw AppError.forbidden();
      } else if (org.users_organizations === null) {
        logger.info(`User ${userid} accessed organization ${id} as a non-member`);
        throw AppError.forbidden();
      } else if (!canAccess(org.users_organizations.role, policy)) {
        if (policy.compareType === CompareType.Not && policy.role === Role.OWNER) {
          throw AppError.badRequest(
            "You cannot perform this action as the owner, please transfer ownership first",
          );
        }
        throw AppError.forbidden();
      }

      return org.organizations;
    },

    /// Deletes the organization with the given `id`. The user `userid` must be
    /// the owner of the organization for this to be successful.
    async deleteOrganization(id: number, userid: number) {
      logger.info(`User ${userid} deleting organization ${id}`);
      await this.getOrganization(id, userid, { role: Role.OWNER });
      const [org] = await db.delete(organizations).where(eq(organizations.id, id)).returning();
      if (!org) {
        throw AppError.serverError("Could not delete organization");
      }
    },

    async shareOrganization(id: number, users: number[], userid: number) {
      logger.info(`User ${userid} is sharing organization ${id} with users ${users.toString()}`);
      await this.getOrganization(id, userid, { role: Role.ADMIN });
      const sharedWith = await db
        .insert(usersOrganizations)
        .values(
          users.map((i) => ({
            userId: i,
            organizationId: id,
            role: "INVITED" as const, // Required because of the map
          })),
        )
        .onConflictDoNothing({ target: [usersOrganizations.userId, usersOrganizations.organizationId ]})
        .returning();
      return sharedWith;
    },

    /// Joins the organization. The user `userid` must be invited to join.
    /// Throws bad request if user is already a member.
    async joinOrganization(id: number, userid: number) {
      logger.info(`User ${id} accepted invite to organization ${id}`);
      await this.getOrganization(id, userid, {role: Role.INVITED, compareType: CompareType.Exact});
      const [user] = await db
        .update(usersOrganizations)
        .set({ role: "MEMBER" })
        .where(
          and(eq(usersOrganizations.organizationId, id), eq(usersOrganizations.userId, userid)),
        )
        .returning();
      if (!user) {
        throw AppError.serverError("Unable to join the organization");
      }
    },

    /// Leaves the organization as the user `userid`. The user cannot leave if
    /// they are the owner of the organization.
    async leaveOrganization(id: number, userid: number) {
      logger.info(`User ${userid} is leaving the organization ${id}`);
      await this.getOrganization(id, userid, { role: Role.OWNER, compareType: CompareType.Not});
      const [user] = await db.delete(usersOrganizations)
        .where(and(eq(usersOrganizations.userId, userid), eq(usersOrganizations.organizationId, id)))
        .returning();
      if (!user) {
        throw AppError.serverError("Unable to leave organization");
      }
    },
  };
}
