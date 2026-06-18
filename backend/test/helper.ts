import serviceApp from "../src/app.js";
import {usersOrganizations, usersCalendars} from "../src/db/schema.js";
import AppError from "#common/errors.js";

import Fastify, { type FastifyInstance, type InjectOptions } from 'fastify'
import type { SessionStore } from "@fastify/session";
import fp from 'fastify-plugin'

import { PGlite } from '@electric-sql/pglite';
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from 'drizzle-orm/pglite/migrator';
import { and, eq } from "drizzle-orm";

import { type TestContext } from "node:test";
import assert from "node:assert";
import path from "node:path";

process.env.NODE_ENV = "testing";
process.env.BACKEND_HOST = "http://test.backend.com";
process.env.DATABASE_URL = "test";
process.env.DATABASE_PASSWORD = "test";
/// Must be length 32 or larger
process.env.COOKIE_SECRET = "cNaoPYAwF60HZJzkcNaoPYAwF60HZJzk";
process.env.COOKIE_NAME = "test_session";
process.env.COOKIE_SECURED = "false";
process.env.CLIENT_SECRET = "random";
process.env.CLIENT_ID = "random";
process.env.OIDC_ISSUER = "http://cas:8080/cas/oidc";
process.env.PROD = "false";

interface User {
  netid: string;
  userid: number;
}

declare module 'fastify' {
  interface FastifyInstance {
    injectWithLogin: typeof injectWithLogin;
    sessionStore: SessionStore;
    /// We could use drizzle-seed, but I fear that would be relying on it too
    /// much. We also don't exactly need a large number of entites to test on
    /// since we are primarly concerned with permission checks.
    seedUser: typeof seedUser;
    seedOrganization: typeof seedOrganization;
    seedCalendar: typeof seedCalendar;
  }
  interface Session {
    user: User;
  }
}

async function injectWithLogin (
  this: FastifyInstance,
  opts: InjectOptions
) {
  const res = await this.inject({
    method: "POST",
    url: "/test/login",
  })

  return this.inject({
    ...opts,
    cookies: {
      [this.config.COOKIE_NAME]: res?.cookies[0]?.value || ""
    }
  })
}

async function seedUser(this: FastifyInstance, name: string, netid: string) {
  const user = await this.userService.createOrLoginUser({
    netid: netid,
    name: name,
  });
  return user;
}

type Role = "OWNER" | "ADMIN" | "EDITOR" | "MEMBER" | "VIEWER" | "INVITED" | null;
type Member = { id: number, role: Role};
async function seedOrganization(this: FastifyInstance, role: Role, member?: Member) {
  const user = await this.userService.createOrLoginUser({
    netid: "aa123",
    name: "Airy Apple",
  });
  assert.ok(user);
  const organization = await this.organizationService.createOrganization("Apple Orchard", user.id);
  if (role !== null) {
    await this.database.update(usersOrganizations).set({
      role: role
    }).where(and(eq(usersOrganizations.userId, user.id), eq(usersOrganizations.organizationId, organization.id)));
  } else {
    await this.database.delete(usersOrganizations)
      .where(and(eq(usersOrganizations.userId, user.id), eq(usersOrganizations.organizationId, organization.id)));
  }
  if (member) {
    assert.ok(member.role);
    await this.database.insert(usersOrganizations).values({
      userId: member.id,
      organizationId: organization.id,
      role: member.role
    })
  }
  return organization;
}

async function seedCalendar(this: FastifyInstance, role: Role | null, member?: Member) {
  const user = await this.userService.createOrLoginUser({
    netid: "aa123",
    name: "Airy Apple",
  });
  assert.ok(user);
  const calendar = await this.calendarService.createCalendar({
    name: "calendar",
    description: "short description",
    links: [{ sharelink: true, url: "https://my.calendar.stuff" }]
  }, user.id);
  if (role) {
    await this.database.update(usersCalendars).set({
      role: role
    }).where(and(eq(usersCalendars.userId, user.id), eq(usersCalendars.calendarId, calendar.id)));
  } else if (role == null) {
    await this.database.delete(usersCalendars)
      .where(and(eq(usersCalendars.userId, user.id), eq(usersCalendars.calendarId, calendar.id)));
  }
  if (member) {
    assert.ok(member.role);
    await this.database.insert(usersCalendars).values({
      userId: member.id,
      calendarId: calendar.id,
      role: "MEMBER"
    })
  }
  return calendar;
}

export async function build (t?: TestContext) {
  const app = Fastify();
  const client = new PGlite();
  const db = drizzle({ client });
  await migrate(db, {
    migrationsFolder: path.join(import.meta.dirname, "../drizzle")
  });

  app.register(fp(serviceApp), {
    modules: { database: (_url: string) => db}
  });
  // Stimulate a login
  app.register(fp(async(fastify) => {
    fastify.post("/test/login", async (request) => {
      const user = await app.userService.createOrLoginUser({
	netid: "aa123",
	name: "Airy Apple",
      });
      if (!user) {
	throw AppError.notFound();
      }
      request.session.user = { netid: user.netid, userid: user.id };
      await request.session.save();
      return request.session.user;
    });
  }));

  await app.ready();
  app.injectWithLogin = injectWithLogin;
  app.seedUser = seedUser;
  app.seedOrganization = seedOrganization;
  app.seedCalendar = seedCalendar;

  if (t) {
    t.after(() => app.close())
  }
  return app
}
