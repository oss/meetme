import { organizations, usersOrganizations } from "../../../db/schema.js";
import { Role } from "#common/rbac.js";

import { type FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { createInsertSchema } from "drizzle-orm/typebox";

const organizationSchema = createInsertSchema(organizations);
const usersOrganizationSchema = createInsertSchema(usersOrganizations);

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const service = fastify.organizationService;
  fastify.route({
    method: "POST",
    url: "/",
    schema: {
      description: "Creates an organization with the given name",
      tags: ["organization"],
      body: Type.Object({ name: Type.String() }),
      response: { 201: Type.Object({ organization: organizationSchema }) },
    },
    handler: async (request, reply) => {
      const { name } = request.body;
      const { userid } = request.session.user;
      reply.code(201);
      const org = await service.createOrganization(name, userid);
      return { organization: org };
    },
  });

  fastify.route({
    method: "GET",
    url: "/:organizationId",
    schema: {
      description: "Gets an organization with the given id",
      tags: ["organization"],
      params: Type.Object({ organizationId: Type.Number() }),
      response: { 200: Type.Object({ organization: organizationSchema }) },
    },
    handler: async (request) => {
      const { organizationId } = request.params;
      const { userid } = request.session.user;
      const org = await service.getOrganization(organizationId, userid, { role: Role.INVITED });
      return { organization: org };
    },
  });

  fastify.route({
    method: "DELETE",
    url: "/:organizationId",
    schema: {
      description: "Deletes an organization with the given id",
      tags: ["organization"],
      params: Type.Object({ organizationId: Type.Number() }),
      response: { 204: Type.Object({ message: Type.String() }) },
    },
    handler: async (request, reply) => {
      const { organizationId } = request.params;
      const { userid } = request.session.user;
      await service.deleteOrganization(organizationId, userid);
      reply.code(204);
    },
  });

  fastify.route({
    method: "DELETE",
    url: "/:organizationId/leave",
    schema: {
      description: "Leaves the organization as the logged in user",
      tags: ["organization", "user"],
      params: Type.Object({ organizationId: Type.Number() }),
      response: { 204: Type.Object({ message: Type.String() }) },
    },
    handler: async (request, reply) => {
      const { organizationId } = request.params;
      const { userid } = request.session.user;
      await service.leaveOrganization(organizationId, userid);
      reply.code(204);
    },
  });

  fastify.route({
    method: "POST",
    url: "/:organizationId/share",
    schema: {
      description: "Invites the given users to the given organization",
      tags: ["organization", "user"],
      params: Type.Object({ organizationId: Type.Number() }),
      body: Type.Object({ users: Type.Array(Type.Number(), { minItems: 1 }) }),
      response: { 201: Type.Object({ users: Type.Array(usersOrganizationSchema) }) },
    },
    handler: async (request) => {
      const { organizationId } = request.params;
      const { userid } = request.session.user;
      const users = await service.shareOrganization(organizationId, request.body.users, userid);
      return { users: users };
    },
  });

  fastify.route({
    method: "PUT",
    url: "/:organizationId/join",
    schema: {
      description: "Joins the organization as the logged in user, user must be invited",
      tags: ["organization", "user"],
      params: Type.Object({ organizationId: Type.Number() }),
      response: { 204: Type.Object({ message: Type.String() }) },
    },
    handler: async (request, reply) => {
      const { organizationId } = request.params;
      const { userid } = request.session.user;
      await service.joinOrganization(organizationId, userid);
      reply.code(204);
    },
  });
};

export default plugin;
