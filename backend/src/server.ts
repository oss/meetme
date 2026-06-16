import Fastify from "fastify";
import fp from "fastify-plugin";
import app from "./app.js";

async function start() {
  const port = 3000;
  const fastify = Fastify({
    logger: true,
    trustProxy: true,
  });

  await fastify.register(fp(app));
  await fastify.ready();
  await fastify.listen({ port: port });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
