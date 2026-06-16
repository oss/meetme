import createOrganizationService from "./organization/organization-service.js";
import createCalendarService from "./calendar/calendar-service.js";
import createUserService from "./user/user-service.js";

import type { OrganizationService, CalendarService, UserService } from "#common/types.js";

import fp from "fastify-plugin";

declare module "fastify" {
  export interface FastifyInstance {
    organizationService: OrganizationService;
    calendarService: CalendarService;
    userService: UserService;
  }
}

export default fp(async function (fastify) {
  const { database, log } = fastify;
  const organizationService = createOrganizationService(log, database);

  fastify.decorate("userService", createUserService(log, database));
  fastify.decorate("organizationService", organizationService);
  fastify.decorate("calendarService", createCalendarService(log, database, organizationService));
});
