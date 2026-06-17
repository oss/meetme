import fp from "fastify-plugin";
import Cookie from "@fastify/cookie";
import OAuth from "@fastify/oauth2";

import type { OAuth2Namespace } from "@fastify/oauth2";

declare module "fastify" {
  interface FastifyInstance {
    cas: OAuth2Namespace;
  }
}

/// Provides OIDC and OAuth helpers.
export default fp(async function (fastify) {
  const { config } = fastify;
  fastify.register(Cookie);
  if (process.env.NODE_ENV !== "testing") {
    fastify.register(OAuth, {
      name: "cas",
      credentials: {
        client: {
          id: config.CLIENT_ID,
          secret: config.CLIENT_SECRET,
        },
      },
      scope: ["profile", "email", "eduPerson"],
      startRedirectPath: "/api/auth/login/",
      // TODO: change this in prod
      callbackUri: "http://localhost:3000/api/auth/login/callback",
      discovery: { issuer: config.OIDC_ISSUER },
    });
  }
});
