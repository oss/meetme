import { type FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { createInsertSchema, createUpdateSchema } from "drizzle-orm/typebox";

import { calendars, timeblocks } from "../../../db/schema.js";
// import AppError from "common/errors.js";

const calendarSchema = createInsertSchema(calendars, {
  links: Type.Optional(Type.Array(Type.Object({ sharelink: Type.Boolean(), url: Type.String() }))),
});
const timeblocksSchema = createInsertSchema(timeblocks);
const settingsSchema = createUpdateSchema(calendars, {
  organizationId: Type.Never(),
  created: Type.Never(),
  links: Type.Optional(Type.Array(Type.Object({ sharelink: Type.Boolean(), url: Type.String() }))),
});

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
    handler: async (request) => {
      const { userid } = request.session.user;
      const calendar = await service.createCalendar(request.body, userid);
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
      const { calendarId } = request.params;
      const { userid } = request.session.user;
      const calendar = await service.patchSettings(calendarId, request.body, userid);
      return { calendar: calendar };
    },
  });

  fastify.route({
    method: "PUT",
    url: "/:calendarId/transferOwner",
    schema: {
      description: "Transfers ownership to the given owner",
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
    method: "PATCH",
    url: "/:calendarId/timeblocks",
    schema: {
      description: "Modifies timeblocks for the calendar",
      params: Type.Object({ calendarId: Type.Integer() }),
      body: Type.Object({ operation: Type.Enum(["ADD", "SET", "SUB"]), block: timeblocksSchema }),
      response: { 200: Type.Object({ calendar: calendarSchema }) },
    },
    handler: async (request) => {
      const { calendarId } = request.params;
      const { userid } = request.session.user;
      const { operation, block } = request.body;
      const calendar = await service.patchTimeblocks(calendarId, operation, block, userid);
      return { calendar: calendar };
    },
  });

  // TODO: implement
  fastify.route({
    method: "GET",
    url: "/:calendarId/timeblocks",
    schema: {
      description: "Modifies timeblocks for the calendar",
      params: Type.Object({ calendarId: Type.Integer() }),
      body: Type.Object({ operation: Type.Enum(["ADD", "SET", "SUB"]), block: timeblocksSchema }),
      response: { 200: Type.Object({ calendar: calendarSchema }) },
    },
    handler: async (request) => {
      const { calendarId } = request.params;
      const { userid } = request.session.user;
      const { operation, block } = request.body;
      const calendar = await service.patchTimeblocks(calendarId, operation, block, userid);
      return { calendar: calendar };
    },
  });

  fastify.route({
    method: "PUT",
    url: "/:calendarId/share",
    schema: {
      description: "Share the calendar with the given users",
      params: Type.Object({ calendarId: Type.Number() }),
      body: Type.Object({ users: Type.Array(Type.Number(), { minItems: 1 }) }),
      response: { 200: Type.Object({ calendar: calendarSchema }) },
    },
    handler: async (request) => {
      const { calendarId } = request.params;
      const { users } = request.body;
      const { userid } = request.session.user;
      const calendar = await service.shareCalendar(calendarId, users, userid);
      return { calendar: calendar };
    },
  });

  fastify.route({
    method: "PUT",
    url: "/:calendarId/unshare",
    schema: {
      description: "Unshare the calendar with the given users",
      params: Type.Object({ calendarId: Type.Number() }),
      body: Type.Object({ users: Type.Array(Type.Number(), { minItems: 1 }) }),
      response: { 200: Type.Object({ calendar: calendarSchema }) },
    },
    handler: async (request) => {
      const { calendarId } = request.params;
      const { users } = request.body;
      const { userid } = request.session.user;
      const calendar = await service.unshareCalendar(calendarId, users, userid);
      return { calendar: calendar };
    },
  });

  fastify.route({
    method: "PUT",
    url: "/:calendarId/join",
    schema: {
      description: "Join the calendar as the logged-in user",
      params: Type.Object({ calendarId: Type.Number() }),
      response: { 200: Type.Object({ calendar: calendarSchema }) },
    },
    handler: async (request) => {
      const { calendarId } = request.params;
      const { userid } = request.session.user;
      const calendar = await service.joinCalendar(calendarId, false, userid);
      return { calendar: calendar };
    },
  });

  fastify.route({
    method: "PUT",
    url: "/:calendarId/joinSharelink",
    schema: {
      description: "Join the calendar as the logged-in user via a sharelink",
      params: Type.Object({ calendarId: Type.Number() }),
      response: { 200: Type.Object({ calendar: calendarSchema }) },
    },
    handler: async (request) => {
      const { calendarId } = request.params;
      const { userid } = request.session.user;
      const calendar = await service.joinCalendar(calendarId, true, userid);
      return { calendar: calendar };
    },
  });

  fastify.route({
    method: "PUT",
    url: "/:calendarId/leave",
    schema: {
      description: "Leave the calendar as the logged-in user",
      params: Type.Object({ calendarId: Type.Number() }),
      response: { 200: Type.Object({ calendar: calendarSchema }) },
    },
    handler: async (request) => {
      const { calendarId } = request.params;
      const { userid } = request.session.user;
      const calendar = await service.leaveCalendar(calendarId, userid);
      return { calendar: calendar };
    },
  });
};

export default plugin;
