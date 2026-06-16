import { users } from "../../db/schema.js";
import { type LoggerInstance, type DatabaseInstance } from "#common/types.js";
import AppError from "#common/errors.js";

import { eq, sql, getColumns } from "drizzle-orm";

type InsertUser = typeof users.$inferInsert;

export default function createUserService(logger: LoggerInstance, database: DatabaseInstance) {
  const db = database;

  return {
    async createOrLoginUser(user: InsertUser) {
      logger.info(`Creating user account for ${JSON.stringify(user)}`);
      if (!user.netid || user.netid === null) {
        logger.info(`User has no netid`);
        throw AppError.forbidden();
      }
      const [newUser] = await db
        .insert(users)
        .values(user)
        .onConflictDoUpdate({
          target: users.netid,
          set: { lastLogin: sql`now()` },
        })
        .returning();
      return newUser;
    },

    async getUser(userid: number, isSelf: boolean) {
      logger.info(`Fetching user data for ${userid} with isSelf = ${isSelf}`);
      const [user] = await db
        .select({
          ...(isSelf ? { ...getColumns(users) } : {}),
          alias: users.alias,
          name: users.name,
        })
        .from(users)
        .where(eq(users.id, userid));

      if (!user) {
        throw AppError.notFound();
      }

      return user;
    },

    /// Sets the alias of the given `userid`.
    /// Returns the User after modification
    async setAlias(userid: number, alias: string) {
      logger.info(`Seting user ${userid} alias to ${alias}`);
      const [user] = await db
        .update(users)
        .set({ alias: alias })
        .where(eq(users.id, userid))
        .returning();
      if (!user) {
        throw AppError.serverError("Unable to set alias of user");
      }
      return user;
    },
  };
}
