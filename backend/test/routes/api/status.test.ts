import { build } from "../../helper.js";

import { test } from "node:test";
import assert from "node:assert";

import pkg from "../../../package.json" with { type: "json" };
const { version } = pkg;

test("GET /api/status with login", async (t) => {
  const app = await build(t);
  const res = await app.injectWithLogin({
    url: "/api/status",
  });
  assert.deepStrictEqual(JSON.parse(res.payload), {
    status: "ok",
    version: version,
  });
});

test("GET /api/status with no login", async (t) => {
  const app = await build(t);
  const res = await app.inject({
    url: "/api/status",
  });
  assert.deepStrictEqual(JSON.parse(res.payload), {
    statusCode: 401,
    error: "Unauthorized",
    message: "Unauthorized",
  });
});
