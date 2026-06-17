import createOrganizationService from "../modules/organization/organization-service.js";
import createCalendarService from "../modules/calendar/calendar-service.js";
import createUserService from "../modules/user/user-service.js";

import { drizzle as pg } from "drizzle-orm/node-postgres";
import { drizzle as pglite } from "drizzle-orm/pglite";
import type { FastifyBaseLogger } from "fastify";

/// Re-exports common types so things don't go wrong when the underlying library
/// changes. Our business code should be agnostic of the underlying libraries.
export type DatabaseInstance = ReturnType<typeof pg> | ReturnType<typeof pglite>;
export type LoggerInstance = FastifyBaseLogger;

/// Exports our services
export type OrganizationService = ReturnType<typeof createOrganizationService>;
export type CalendarService = ReturnType<typeof createCalendarService>;
export type UserService = ReturnType<typeof createUserService>;
