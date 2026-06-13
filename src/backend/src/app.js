import AutoLoad from "@fastify/autoload";
import path from "node:path";

export default async function app(fastify, opts) {
  // Load all plugins
  await fastify.register(AutoLoad, {
    dir: path.join(import.meta.dirname, "plugins"),
    options: { ...opts },
  });

  // Load all routes
  await fastify.register(AutoLoad, {
    dir: path.join(import.meta.dirname, "routes"),
    options: { ...opts },
  });

  // Log request.body
  fastify.addHook("preHandler", function (req, reply, done) {
    if (req.body) {
      req.log.info({ body: req.body }, "parsed body");
    }
    done();
  });

  // Log errors and return message
  fastify.setErrorHandler((err, request, reply) => {
    fastify.log.error(
      {
        err,
        request: {
          method: request.method,
          url: request.url,
          query: request.query,
          params: request.params,
        },
      },
      "Unhandled error occurred",
    );

    reply.code(err.statusCode ?? 500);
    let message = "Internal Server Error";
    if (err.statusCode && err.statusCode < 500) {
      message = err.message;
    }

    return { message };
  });
}
