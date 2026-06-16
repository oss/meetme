import AppError from "#common/errors.js";

import type { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.addHook("onRequest", async (request) => {
    if (request.url.startsWith("/api/auth/login")) {
      return;
    }

    if (!request.session.user) {
      throw AppError.unauthorized();
    }
  });
}
