import { build } from "../../helper.js";

import { test } from "node:test";
import assert from "node:assert";

test("GET /api/user/me", async (t) => {
  const app = await build(t);
  const res = await app.injectWithLogin({
    url: "/api/user/me",
  });
  assert.partialDeepStrictEqual(JSON.parse(res.payload), {
    user: {
      alias: null,
      name: "Airy Apple",
      netid: "aa123",
    },
  });
});

test("PATCH /api/user/alias", async (t) => {
  const app = await build(t);
  const res = await app.injectWithLogin({
    url: "/api/user/alias",
    body: {
      alias: "Airless Apple",
    },
    method: "PATCH",
  });
  assert.partialDeepStrictEqual(JSON.parse(res.payload), {
    user: {
      alias: "Airless Apple",
      name: "Airy Apple",
      netid: "aa123",
    },
  });

  test("GET /api/user/:userid", async (t) => {
    const app = await build(t);
    const user = await app.seedUser("Brown Bear", "bb123");
    assert.ok(user);
    const res = await app.injectWithLogin({
      url: `/api/user/${user.id}`,
    });
    /// Should only return name and alias
    assert.partialDeepStrictEqual(JSON.parse(res.payload), {
      user: {
        alias: null,
        name: user.name,
      },
    });
  });
});
