import S from "fluent-json-schema";
import { readFileSync } from "fs";
import path from "node:path";

import pkg from '#package.json' with { type: 'json' };
const { version } = pkg;

export default async function status(fastify, _opts) {
  fastify.route({
    method: "GET",
    path: "/status",
    schema: {
      description: "Returns status and version",
      response: {
        200: S.object().prop("status", S.string()).prop("version", S.string()),
      },
    },
    handler: onStatus,
  });

  async function onStatus(_request, _reply) {
    return { status: "ok", version: version };
  }
}
