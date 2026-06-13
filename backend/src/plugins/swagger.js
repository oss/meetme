import fp from "fastify-plugin";
import Swagger from "@fastify/swagger";
import SwaggerUI from "@fastify/swagger-ui";

import pkg from "#package.json" with { type: "json" };
const { version } = pkg;

async function swagger(fastify, opts) {
  await fastify.register(Swagger, {
    swagger: {
      info: {
        title: "MeetMe Calendar Scheduling",
        description: "MeetMe Calendar Scheduling documentation",
        version,
      },
      host: "localhost",
      schemes: ["http", "https"],
      consumes: ["application/json"],
      produces: ["application/json", "text/html"],
      securityDefinitions: {
        Bearer: {
          type: "apiKey",
          name: "Bearer",
          in: "header",
        },
        // Csrf: {
        //   type: 'apiKey',
        //   name: 'x-csrf-token',
        //   in: 'header'
        // }
      },
    },
    exposeRoute: !fastify.config.PROD,
  });

  if (!fastify.config.PROD) {
    await fastify.register(SwaggerUI, {
      routePrefix: "/documentation",
    });
  }
}

export default fp(swagger, { name: "swagger", dependencies: ["env"] });
