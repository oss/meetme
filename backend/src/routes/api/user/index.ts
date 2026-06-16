import { users } from "../../../db/schema.js";

import { type FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { createUpdateSchema } from "drizzle-orm/typebox";

const userSchema = createUpdateSchema(users);

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const service = fastify.userService;

  // TODO: validate alias
  fastify.route({
    method: "PATCH",
    url: "/alias",
    schema: {
      description: "Modifies the alias of the logged in user",
      body: Type.Object({ alias: Type.String() }),
      response: { 200: Type.Object({ user: userSchema }) },
    },
    handler: async (request) => {
      const { alias } = request.body;
      const { userid } = request.session.user;
      const user = await service.setAlias(userid, alias);
      return { user: user };
    },
  });

  fastify.route({
    method: "GET",
    url: "/me",
    schema: {
      description: "Gets user data of logged in user",
      response: { 200: Type.Object({ user: userSchema }) },
    },
    handler: async (request) => {
      const { userid } = request.session.user;
      const user = await service.getUser(userid, true);
      return { user: user };
    },
  });

  fastify.route({
    method: "GET",
    url: "/:netid",
    schema: {
      description: "Gets user data of the user with the given netid",
      params: Type.Object({ userid: Type.Number() }),
      response: { 200: Type.Object({ user: userSchema }) },
    },
    handler: async (request) => {
      const { userid } = request.params;
      const user = await service.getUser(userid, false);
      return { user: user };
    },
  });
};

export default plugin;
