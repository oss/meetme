import Fastify from "fastify";
import App from "./app.js";

const logger = ".util/logger.js";

async function start() {
  const fastify = Fastify({
    loggerInstance: logger,
    trustProxy: true,
  });
  await fastify.register(App);
  const port = 8000;
  await fastify.listen(port);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
