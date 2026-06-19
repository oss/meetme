import Fastify from "fastify";
import fp from "fastify-plugin";
import app from "./app.js";

import { drizzle } from "drizzle-orm/node-postgres";

async function start() {
  const port = 3000;
  const fastify = Fastify({
    logger: true,
    trustProxy: true,
  });

  await fastify.register(fp(app), {
    modules: { database: () => drizzle(fastify.config.DATABASE_URL) },
  });
  await fastify.ready();
  await fastify.listen({ port: port, host: '0.0.0.0' });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
