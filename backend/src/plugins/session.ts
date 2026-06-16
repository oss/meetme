import fp from "fastify-plugin";
import Session from "@fastify/session";
// import Csrf from '@fastify/csrf-protection'

interface User {
  netid: string;
  userid: number;
}

declare module "fastify" {
  interface Session {
    user: User;
  }
}

export default fp(async (fastify) => {
  const { config } = fastify;
  // await fastify.register(Csrf, {
  // 	sessionPlugin: '@fastify/cookie',
  // 	cookieOpts: { signed: true }
  fastify.register(Session, {
    secret: config.COOKIE_SECRET,
    cookieName: config.COOKIE_NAME,
    cookie: {
      secure: fastify.config.COOKIE_SECURED,
      httpOnly: true,
      // maxAge: 1800000
      maxAge: 604800,
    },
  });
});
