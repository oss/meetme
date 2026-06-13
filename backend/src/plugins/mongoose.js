import fp from "fastify-plugin";
import mongoose from "mongoose";

async function db(fastify, _opts) {
  const { config } = fastify;
  const url = config.MONGODB_URL;

  await mongoose.connect(url);
  await mongoose.set("transactionAsyncLocalStorage", true);

  fastify.log.info(`Connected to mongoose via ${url}`);

  fastify.addHook("onClose", async () => {
    await mongoose.disconnect();
    fastify.log.info("Disconnected from mongoose, cause: shutdown");
  });
}

// We need env, which holds our config data, to load first
export default fp(db, { name: "db", dependencies: ["env"] });
