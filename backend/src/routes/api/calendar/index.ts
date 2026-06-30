import { type FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { createInsertSchema, createUpdateSchema, createSelectSchema } from "drizzle-orm/typebox";

import { calendars, timeblocks, usersCalendars } from "../../../db/schema.js";
import { Role } from "#common/rbac.js";
import AppError from "#common/errors.js";

const calendarSchema = createInsertSchema(calendars, {
  links: Type.Optional(Type.Array(Type.Object({ sharelink: Type.Boolean(), url: Type.String() }))),
});
const usersCalendarsSchema = createInsertSchema(usersCalendars);
const timeblocksSchema = Type.Omit(createInsertSchema(timeblocks), 
  Type.Union([Type.Literal("userId"), Type.Literal("calendarId")]),
);
const timeblocksUpdateSchema = Type.Omit(createSelectSchema(timeblocks), 
  Type.Union([Type.Literal("userId"), Type.Literal("calendarId")]),
);
const timeblocksReturnSchema = createSelectSchema(timeblocks);
const settingsSchema = Type.Omit(
  createUpdateSchema(calendars, {
    links: Type.Optional(
      Type.Array(Type.Object({ sharelink: Type.Boolean(), url: Type.String() })),
    ),
  }),
  Type.Union([Type.Literal("organizationId"), Type.Literal("created")]),
);
const calendarListingSchema = Type.Array(Type.Object({
  id: Type.Number(),
  organizationId: Type.Union([Type.Number(), Type.Null()]),
  name: Type.String(),
  // TODO: extract out to rbac.ts
  role: Type.Union([Type.Enum(["OWNER","ADMIN", "EDITOR", "MEMBER", "VIEWER", "INVITED"]), Type.Null()]),
}));

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const service = fastify.calendarService;
  fastify.route({
    method: "POST",
    url: "/",
    schema: {
      description:
        "Creates a calendar with the given settings as the logged in user, if organizationId is given, the calendar will be created for the organization instead",
      body: calendarSchema,
      response: { 201: Type.Object({ calendar: calendarSchema }) },
    },
    handler: async (request, reply) => {
      const { userid } = request.session.user;
      const calendar = await service.createCalendar(request.body, userid);
      reply.code(201);
      return { calendar: calendar };
    },
  });

  fastify.route({
    method: "GET",
    url: "/:calendarId",
    schema: {
      description: "Gets the information of the calendar given by the calendarId ",
      params: Type.Object({ calendarId: Type.Integer() }),
      response: { 200: Type.Object({ calendar: calendarSchema }) },
    },
    handler: async (request) => {
      const { calendarId } = request.params;
      const { userid } = request.session.user;
      const calendar = await service.getCalendar(calendarId, userid, { role: Role.INVITED });
      return { calendar: calendar };
    },
  });

  fastify.route({
    method: "DELETE",
    url: "/:calendarId",
    schema: {
      description: "Deletes the given calendar",
      params: Type.Object({ calendarId: Type.Integer() }),
      response: { 204: Type.Object({ message: Type.String() }) },
    },
    handler: async (request, reply) => {
      const { userid } = request.session.user;
      const { calendarId } = request.params;
      await service.deleteCalendar(calendarId, userid);
      reply.code(204);
    },
  });

  fastify.route({
    method: "PATCH",
    url: "/:calendarId/settings",
    schema: {
      description: "Modifes a calendar with the given settings",
      params: Type.Object({ calendarId: Type.Integer() }),
      body: settingsSchema,
      response: { 200: Type.Object({ calendar: calendarSchema }) },
    },
    handler: async (request) => {
      if ("organizationId" in request.body) {
        throw AppError.badRequest(
          "Please use PUT /api/calendar/:id/owner to transfer to an organization",
        );
      }
      const { calendarId } = request.params;
      const { userid } = request.session.user;
      const calendar = await service.patchSettings(calendarId, request.body, userid);
      return { calendar: calendar };
    },
  });

  fastify.route({
    method: "PUT",
    url: "/:calendarId/owner",
    schema: {
      description: "Transfers ownership of the calendar to the given owner",
      params: Type.Object({ calendarId: Type.Number() }),
      body: Type.Object({ owner: Type.Number(), isOrg: Type.Boolean() }),
      response: { 200: Type.Object({ calendar: calendarSchema }) },
    },
    handler: async (request) => {
      const { calendarId } = request.params;
      const { owner, isOrg } = request.body;
      const { userid } = request.session.user;
      const calendar = await service.setOwner(calendarId, owner, isOrg, userid);
      return { calendar: calendar };
    },
  });

  fastify.route({
    method: "POST",
    url: "/:calendarId/timeblocks",
    schema: {
      description: "Adds a timeblock to the calendar",
      params: Type.Object({ calendarId: Type.Integer() }),
      body: Type.Object({ block: timeblocksSchema }),
      response: { 201: Type.Object({ timeblock: timeblocksReturnSchema }) },
    },
    handler: async (request, reply) => {
      const { calendarId } = request.params;
      const { userid } = request.session.user;
      const { block } = request.body;
      const b = await service.addTimeblock(calendarId, {
        ...block,
        userId: userid,
        calendarId: calendarId,
      }, userid);
      reply.code(201);
      return { timeblock: b };
    },
  });

  fastify.route({
    method: "PATCH",
    url: "/:calendarId/timeblocks",
    schema: {
      description: "Updates the given timeblock",
      params: Type.Object({ calendarId: Type.Integer() }),
      body: Type.Object({ block: timeblocksUpdateSchema }),
      response: { 200: Type.Object({ timeblock: timeblocksReturnSchema }) },
    },
    handler: async (request) => {
      const { calendarId } = request.params;
      const { userid } = request.session.user;
      const { block } = request.body;
      const b = await service.patchTimeblock(calendarId, {
        ...block,
        userId: userid,
        calendarId: calendarId,
      }, userid);
      return { timeblock: b };
    },
  });

  fastify.route({
    method: "DELETE",
    url: "/:calendarId/timeblocks",
    schema: {
      description:
        "Adds a timeblock to the calendar, if the timeblock exsists alreay, it is modified instead",
      params: Type.Object({ calendarId: Type.Integer() }),
      body: Type.Object({ block: Type.Number() }),
      response: { 204: Type.Object({ message: Type.String() }) },
    },
    handler: async (request, reply) => {
      const { calendarId } = request.params;
      const { userid } = request.session.user;
      const { block } = request.body;
      await service.deleteTimeblock(calendarId, block, userid);
      reply.code(204);
    },
  });

  fastify.route({
    method: "GET",
    url: "/:calendarId/timeblocks",
    schema: {
      description: "Gets all timeblocks for the given calendar",
      params: Type.Object({ calendarId: Type.Integer() }),
      response: { 200: Type.Object({ timeblocks: Type.Array(timeblocksReturnSchema) }) },
    },
    handler: async (request) => {
      const { calendarId } = request.params;
      const { userid } = request.session.user;
      const blocks = await service.getTimeblocks(calendarId, userid);
      return { timeblocks: blocks };
    },
  });

  fastify.route({
    method: "GET",
    url: "/timeblocks/list",
    schema: {
      description: "Gets all timeblocks from the specified calendars, leave blank to get all timeblocks",
      querystring: Type.Object({ calendars: Type.Optional(Type.Array(Type.Integer())) }),
      response: { 200: Type.Object({ timeblocks: Type.Array(timeblocksReturnSchema) }) },
    },
    handler: async (request) => {
      const { calendars } = request.query;
      const { userid } = request.session.user;
      const blocks = await service.getAllTimeblocks(userid, calendars ?? []);
      return { timeblocks: blocks };
    },
  });

  fastify.route({
    method: "POST",
    url: "/:calendarId/share",
    schema: {
      description: "Share the calendar with the given users",
      params: Type.Object({ calendarId: Type.Number() }),
      body: Type.Object({ users: Type.Array(Type.Number(), { minItems: 1 }) }),
      response: { 201: Type.Object({ users: Type.Array(usersCalendarsSchema) }) },
    },
    handler: async (request, reply) => {
      const { calendarId } = request.params;
      const { users } = request.body;
      const { userid } = request.session.user;
      const res = await service.shareCalendar(calendarId, users, userid);
      reply.code(201);
      return { users: res };
    },
  });

  fastify.route({
    method: "DELETE",
    url: "/:calendarId/unshare",
    schema: {
      description: "Unshare the calendar with the given user",
      params: Type.Object({ calendarId: Type.Number() }),
      body: Type.Object({ user: Type.Number() }),
      response: { 204: Type.Object({ message: Type.String() }) },
    },
    handler: async (request, reply) => {
      const { calendarId } = request.params;
      const { user } = request.body;
      const { userid } = request.session.user;
      await service.unshareCalendar(calendarId, user, userid);
      reply.code(204);
    },
  });

  fastify.route({
    method: "PUT",
    url: "/:calendarId/join",
    schema: {
      description: "Join the calendar as the logged-in user",
      params: Type.Object({ calendarId: Type.Number() }),
      response: { 204: Type.Object({ message: Type.String() }) },
    },
    handler: async (request, reply) => {
      const { calendarId } = request.params;
      const { userid } = request.session.user;
      await service.joinCalendar(calendarId, false, userid);
      reply.code(204);
    },
  });

  fastify.route({
    method: "DELETE",
    url: "/:calendarId/leave",
    schema: {
      description: "Leave the calendar as the logged-in user",
      params: Type.Object({ calendarId: Type.Number() }),
      response: { 204: Type.Object({ message: Type.String() }) },
    },
    handler: async (request, reply) => {
      const { calendarId } = request.params;
      const { userid } = request.session.user;
      await service.leaveCalendar(calendarId, userid);
      reply.code(204);
    },
  });

  fastify.route({
    method: "GET",
    url: "/list",
    schema: {
      description: "Gets all calendars available to the user, the returned result will only have the id, name, organizationId, and user's role for the calendar",
      response: { 200: Type.Object({ calendars: calendarListingSchema }) },
    },
    handler: async (request) => {
      const { userid } = request.session.user;
      const list = await service.getCalendars(userid);
      return { calendars: list };
    },
  });
};

export default plugin;
