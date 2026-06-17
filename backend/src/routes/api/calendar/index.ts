import { type FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { createInsertSchema, createUpdateSchema } from "drizzle-orm/typebox";

import { calendars, timeblocks } from "../../../db/schema.js";
import { Role } from "#common/rbac.js"
import AppError from "#common/errors.js";

const calendarSchema = createInsertSchema(calendars, {
  links: Type.Optional(Type.Array(Type.Object({ sharelink: Type.Boolean(), url: Type.String() }))),
});
const timeblocksSchema = createInsertSchema(timeblocks);
const settingsSchema = Type.Omit(createUpdateSchema(calendars, {
  links: Type.Optional(Type.Array(Type.Object({ sharelink: Type.Boolean(), url: Type.String() }))),
}), Type.Union([Type.Literal("organizationId"), Type.Literal("created")]));

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
        throw AppError.badRequest("Please use PUT /api/calendar/:id/owner to transfer to an organization");
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
      description: "Adds a timeblock to the calendar, if the timeblock exsists alreay, it is modified instead",
      params: Type.Object({ calendarId: Type.Integer() }),
      body: Type.Object({ block: timeblocksSchema }),
      response: { 200: Type.Object({ timeblock: timeblocksSchema }) },
    },
    handler: async (request) => {
      const { calendarId } = request.params;
      const { userid } = request.session.user;
      const { block } = request.body;
      const b = await service.addTimeblock(calendarId, block, userid);
      return { timeblock: b };
    },
  });

  fastify.route({
    method: "DELETE",
    url: "/:calendarId/timeblocks",
    schema: {
      description: "Adds a timeblock to the calendar, if the timeblock exsists alreay, it is modified instead",
      params: Type.Object({ calendarId: Type.Integer() }),
      body: Type.Object({ timeblockId: Type.Number() }),
      response: { 204: Type.Object({ message: Type.String() }) },
    },
    handler: async (request, reply) => {
      const { calendarId } = request.params;
      const { userid } = request.session.user;
      const { timeblockId } = request.body;
      await service.deleteTimeblock(calendarId, timeblockId, userid);
      reply.code(204);
    },
  });

  fastify.route({
    method: "GET",
    url: "/:calendarId/timeblocks",
    schema: {
      description: "Gets all timeblocks for the given calendar",
      params: Type.Object({ calendarId: Type.Integer() }),
      response: { 200: Type.Object({ timeblocks: Type.Array(timeblocksSchema) }) },
    },
    handler: async (request) => {
      const { calendarId } = request.params;
      const { userid } = request.session.user;
      const blocks = await service.getTimeblocks(calendarId, userid);
      return { timeblocks: blocks };
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
