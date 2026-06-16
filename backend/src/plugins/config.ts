import { Type } from "typebox";
import env from "@fastify/env";

declare module "fastify" {
  export interface FastifyInstance {
    config: {
      BACKEND_HOST: string;
      DATABASE_URL: string;
      DATABASE_PASSWORD: string;
      COOKIE_SECRET: string;
      COOKIE_NAME: string;
      COOKIE_SECURED: boolean;
      CLIENT_SECRET: string;
      CLIENT_ID: string;
      OIDC_ISSUER: string;
      PROD: boolean;
    };
  }
}

const schema = Type.Object({
  BACKEND_HOST: Type.String(),
  DATABASE_URL: Type.String(),
  DATABASE_PASSWORD: Type.String(),
  COOKIE_SECRET: Type.String(),
  COOKIE_NAME: Type.String(),
  CLIENT_SECRET: Type.String(),
  COOKIE_SECURED: Type.Boolean(),
  CLIENT_ID: Type.String(),
  OIDC_ISSUER: Type.String(),
  PROD: Type.Boolean(),
});

export const autoConfig = { schema };
export default env;
