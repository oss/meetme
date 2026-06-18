import createOrganizationService from "./organization/organization-service.js";
import createCalendarService from "./calendar/calendar-service.js";
import createUserService from "./user/user-service.js";

import type {
  OrganizationService,
  CalendarService,
  UserService,
  DatabaseInstance,
} from "#common/types.js";
import type { FastifyPluginOptions } from "fastify";

import fp from "fastify-plugin";

declare module "fastify" {
  export interface FastifyInstance {
    organizationService: OrganizationService;
    calendarService: CalendarService;
    userService: UserService;
    database: DatabaseInstance;
  }
}

export default fp(async function (fastify, opts: FastifyPluginOptions) {
  const { log } = fastify;
  const database = opts.modules.database(fastify.config.DATABASE_URL);
  const organizationService = createOrganizationService(log, database);

  fastify.decorate("database", database);
  fastify.decorate("userService", createUserService(log, database));
  fastify.decorate("organizationService", organizationService);
  fastify.decorate("calendarService", createCalendarService(log, database, organizationService));
});
