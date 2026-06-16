import { Type } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import pkg from "#package.json" with { type: "json" };
const { version } = pkg;

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    method: "GET",
    url: "/status",
    schema: {
      description: "Returns status and version",
      response: {
        200: Type.Object({ status: Type.String(), version: Type.String() }),
      },
    },
    handler: onStatus,
  });

  async function onStatus() {
    return { status: "ok", version: version };
  }
};

export default plugin;
