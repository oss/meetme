import {
  pgTable,
  varchar,
  integer,
  boolean,
  jsonb,
  time,
  timestamp,
  pgEnum,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

/// The database will be structured to apply RBAC (Role-based access control) to
/// determine wheter a user has access to a resource. This will be a heavily
/// simplified RBAC because our application isn't that complex. Our one and only
/// resource is the `Calendar` which can be owned by either a `User` or `Organization`.
///
/// Organizations are groupings of `Users` who inherit access to all calendars
/// owned by the `Organization`. Members in an Organization can be assigned
/// roles to grant more granular permissions,
///
///   owner: full access
///   admin: can manage members
///   editor: can manage calendars
///   member: can add timeblocks to organization calendars
///   viewer: can view calendars and organization
///   invited: same as viewer but can accept to be promoted to member
///
/// Of course the permissions are hiearchal, an admin has editor and member and
/// viewer permissions. For a `Calendar` owned by a User, there are only three roles
///
///   owner: full access
///   member: can add timeblocks to calendar
///   viewer: can view calendar
///   invited: same as viewer but can accept to be promoted to member
///
/// Note that there can only be one `Owner` at any time. Here is what the schema
/// design and data lookup looks like.
///
///  users <-1-> calendars
///  users <-2-> organizations <-3-> calendars
///
///  Where <-1-> is junction table 1 and <-2-> is junction table 2. We define
///  organization-level RBAC with <-2-> and indvidual level RBAC with <-1->
///  <-3-> just assigns calendars to organizations

/// A user is the most basic unit in this system. Users can be in an
/// organization, in which case they inherit all calendars owned by the
/// organiztaion, and they can also have individual calendars of their own.
///
/// Users can edit calendars only if they are the only, but they can contribute
/// timeblocks if they are users of a calendar or if they are in an organization
/// with a role of 'member' or above.
export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  // We could use netid for the key but that creates a reliance on an outside
  // system outside of our control, so just store it here but not use it.
  netid: varchar("netid").unique().notNull(),
  name: varchar("name"),
  alias: varchar("alias"),
  lastLogin: timestamp("last_sign_in").notNull().defaultNow(),
  created: timestamp("created").notNull().defaultNow(),
});

/// A grouping of users. The admin and owner can invite, kick, and promote any
/// member of the organization. Calendars owned by the organization are also
/// accessible by any member of the organization.
export const organizations = pgTable("organizations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name"),
  created: timestamp("created").notNull().defaultNow(),
});

/// A calendar contains metadata in addition to timeblocks. Each user can add
/// their own timeblocks to the calendar. If the calendar is owned by an
/// organization, then its members can also add timeblocks to the calendars, IN
/// ADDITION to the users in the schema.
///
/// To be clear, there are two groups of users, individuals and organization
/// members, adding their times to the timeblocks. Admins, editors, and owners
/// of the calendar can edit the settings of the calendar, including removing
/// the timeblocks of other users.
export const calendars = pgTable("calendars", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull().default("untitled calendar"),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }),
  description: varchar("description"),
  location: varchar("location"),
  timezone: varchar("timezone"),
  public: boolean("public").default(false),
  shareLink: boolean("share_link").default(false),
  meetingStart: time(),
  meetingEnd: time(),
  links: jsonb("links").$type<{ sharelink: boolean; url: string }[]>().notNull().default([]),
  modified: timestamp("modified").notNull().defaultNow(),
  created: timestamp("created").notNull().defaultNow(),
});

// Note that indvidiual users of a calendars cannot be assigned ADMIN or EDITOR.
// The roles are kept the same for both for consistency and simplicity.
export const roleEnum = pgEnum("role", ["OWNER", "ADMIN", "EDITOR", "MEMBER", "VIEWER", "INVITED"]);
export const usersCalendars = pgTable(
  "users_calendars",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    calendarId: integer("calendar_id")
      .notNull()
      .references(() => calendars.id, { onDelete: 'cascade' }),
    role: roleEnum().notNull().default("VIEWER"),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.calendarId] }),
    index("users_to_calendars_user_id_idx").on(t.userId),
    index("users_to_calendars_calendar_id_idx").on(t.calendarId),
    index("users_to_calendars_composite_idx").on(t.userId, t.calendarId),
  ],
);

// To avoid locking up tables while users edit, and also provide flexibility
// in case we decided to change the timeblock format.
export const timeblocks = pgTable("timeblocks", {
  id: integer().primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  calendarId: integer("calendar_id")
    .notNull()
    .references(() => calendars.id, { onDelete: 'cascade' }),
  description: varchar(),
  start: timestamp({ withTimezone: true }).notNull(),
  end: timestamp({ withTimezone: true }).notNull(),
});

// Not used for now, might be used later to track visits and viwers.
export const viewers = pgTable("viewers", {
  calendarId: integer("calendar_id").references(() => calendars.id, { onDelete: 'cascade' }),
  viewer: varchar(),
});

export const usersOrganizations = pgTable(
  "users_organizations",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    organizationId: integer("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    role: roleEnum().notNull().default("VIEWER"),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.organizationId] }),
    index("users_organizations_user_id_idx").on(t.userId),
    index("users_organizations_organization_id_idx").on(t.organizationId),
    index("users_organizations_composite_idx").on(t.userId, t.organizationId),
  ],
);
