CREATE TYPE "role" AS ENUM('OWNER', 'ADMIN', 'EDITOR', 'MEMBER', 'VIEWER', 'INVITED');
CREATE TABLE "calendars" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "calendars_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar DEFAULT 'untitled calendar' NOT NULL,
	"organization_id" integer,
	"description" varchar,
	"location" varchar,
	"timezone" varchar,
	"public" boolean DEFAULT false,
	"share_link" boolean DEFAULT false,
	"meetingStart" time,
	"meetingEnd" time,
	"links" jsonb DEFAULT '[]' NOT NULL,
	"modified" timestamp DEFAULT now() NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "organizations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "organizations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar,
	"created" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "timeblocks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "timeblocks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"calendar_id" integer NOT NULL,
	"description" varchar,
	"start" timestamp with time zone NOT NULL,
	"end" timestamp with time zone NOT NULL
);

CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"netid" varchar NOT NULL UNIQUE,
	"name" varchar,
	"alias" varchar,
	"last_sign_in" timestamp DEFAULT now() NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "users_calendars" (
	"user_id" integer,
	"calendar_id" integer,
	"role" "role" DEFAULT 'VIEWER'::"role" NOT NULL,
	CONSTRAINT "users_calendars_pkey" PRIMARY KEY("user_id","calendar_id")
);

CREATE TABLE "users_organizations" (
	"user_id" integer,
	"organization_id" integer,
	"role" "role" DEFAULT 'VIEWER'::"role" NOT NULL,
	CONSTRAINT "users_organizations_pkey" PRIMARY KEY("user_id","organization_id")
);

CREATE TABLE "viewers" (
	"calendar_id" integer,
	"viewer" varchar
);

CREATE INDEX "users_to_calendars_user_id_idx" ON "users_calendars" ("user_id");
CREATE INDEX "users_to_calendars_calendar_id_idx" ON "users_calendars" ("calendar_id");
CREATE INDEX "users_to_calendars_composite_idx" ON "users_calendars" ("user_id","calendar_id");
CREATE INDEX "users_organizations_user_id_idx" ON "users_organizations" ("user_id");
CREATE INDEX "users_organizations_organization_id_idx" ON "users_organizations" ("organization_id");
CREATE INDEX "users_organizations_composite_idx" ON "users_organizations" ("user_id","organization_id");
ALTER TABLE "calendars" ADD CONSTRAINT "calendars_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;
ALTER TABLE "timeblocks" ADD CONSTRAINT "timeblocks_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "timeblocks" ADD CONSTRAINT "timeblocks_calendar_id_calendars_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "calendars"("id") ON DELETE CASCADE;
ALTER TABLE "users_calendars" ADD CONSTRAINT "users_calendars_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "users_calendars" ADD CONSTRAINT "users_calendars_calendar_id_calendars_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "calendars"("id") ON DELETE CASCADE;
ALTER TABLE "users_organizations" ADD CONSTRAINT "users_organizations_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "users_organizations" ADD CONSTRAINT "users_organizations_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;
ALTER TABLE "viewers" ADD CONSTRAINT "viewers_calendar_id_calendars_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "calendars"("id") ON DELETE CASCADE;
