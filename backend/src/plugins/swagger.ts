import fp from "fastify-plugin";
import Swagger from "@fastify/swagger";
import SwaggerUI from "@fastify/swagger-ui";

import pkg from "#package.json" with { type: "json" };
const { version } = pkg;

export default fp(async function (fastify) {
  fastify.register(Swagger, {
    openapi: {
      info: {
        title: "MeetMe Calendar Scheduling",
        description: "MeetMe Calendar Scheduling documentation",
        version,
      },
      components: {
        securitySchemes: {
          Bearer: {
            type: "apiKey",
            name: "Bearer",
            in: "header",
          },
        },
      },
    },
  });

  fastify.register(SwaggerUI, {
    routePrefix: "/api/docs",
  });
});
