import S from "fluent-json-schema";
import fp from "fastify-plugin";
import Env from "@fastify/env";

// Configuration, access using fastify.config
async function env(fastify, _opts) {
  await fastify.register(Env, {
    schema: S.object()
      .prop("BACKEND_HOST", S.string().required())
      .prop("PROD", S.boolean().required())
      .prop("COOKIE_SECRET", S.string().required())
      .prop("CLIENT_SECRET", S.string().required())
      .prop("CLIENT_ID", S.string().required())
      .prop("OIDC_ISSUER", S.string().required())
      .prop("MONGO_URL", S.string().required())
      .valueOf(),
  });
}

export default fp(env, { name: "env" });
