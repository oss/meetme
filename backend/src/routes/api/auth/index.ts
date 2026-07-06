import AppError from "#common/errors.js";

import { type FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import Schema from "typebox/schema";

// Response from CAS. In our setup, CAS returns the netid for sub, along with
// some other optional attributes we might need later.
const userinfoSchema = Schema.Compile(
  Type.Object({
    sub: Type.String(),
    attributes: Type.Optional(Type.Record(Type.String(), Type.Any())),
    auth_time: Type.Number()
  }),
);

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { userService, cas } = fastify;
  fastify.route({
    method: "GET",
    url: "/login/callback",
    schema: { tags: ["auth"] },
    handler: async (request, reply) => {
      const token = await cas.getAccessTokenFromAuthorizationCodeFlow(request);
      const res = await cas.userinfo(token.token);
      const info = userinfoSchema.Parse(res);
      const user = await userService.createOrLoginUser({
        netid: info.sub,
        name: info.attributes?.name ?? info.attributes?.given_name ?? "No Name",
      });
      if (!user) {
        request.log.info(`Could not get create account for ${info}`);
        throw AppError.serverError("Unable to create user account");
      }

      request.log.info(`User with subject of ${user.netid} has logged in at ${info.auth_time}`);
      request.session.user = { netid: user.netid, userid: user.id };
      await request.session.save();
      return reply.redirect(fastify.config.WEBSITE_HOST + "/dashboard");
    },
  });

  fastify.route({
    method: "DELETE",
    url: "/logout",
    schema: {
      description: "Log out of the current user session",
      tags: ["auth"]
    },
    handler: async (request, reply) => {
      request.session.destroy();
      reply.code(204);
    },
  });

  fastify.route({
    method: "GET",
    url: "/whoami",
    schema: {
      description: "Gets the current user session",
      tags: ["auth"]
    },
    handler: async (request) => {
      return { user: request.session.user };
    },
  });
};

export default plugin;
