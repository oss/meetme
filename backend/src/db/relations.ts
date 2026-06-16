import { defineRelations } from "drizzle-orm";
import * as schema from "./schema.js";

export const relations = defineRelations(schema, (r) => ({
  users: {
    timeblocks: r.many.timeblocks(),
    organizations: r.many.organizations({
      from: r.users.id.through(r.usersOrganizations.userId),
      to: r.organizations.id.through(r.usersOrganizations.organizationId),
    }),
    calendars: r.many.calendars({
      from: r.users.id.through(r.usersCalendars.userId),
      to: r.calendars.id.through(r.usersCalendars.calendarId),
    }),
  },
  organizations: {
    users: r.many.users(),
    calendars: r.many.calendars(),
  },
  calendars: {
    timeblocks: r.many.timeblocks(),
    users: r.many.users(),
    organization: r.one.organizations({
      from: r.calendars.organizationId,
      to: r.organizations.id,
    }),
  },
}));
