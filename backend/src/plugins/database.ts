import fp from "fastify-plugin";
import { drizzle } from "drizzle-orm/node-postgres";

import type { DatabaseInstance } from "#common/types.js";

declare module "fastify" {
  export interface FastifyInstance {
    database: DatabaseInstance;
  }
}

export default fp(async (fastify) => {
  fastify.decorate("database", drizzle(fastify.config.DATABASE_URL));

  fastify.addHook("onClose", async (instance) => {
    await instance.database.$client.end();
  });
});
