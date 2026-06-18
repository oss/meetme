import { build } from "../../helper.js";

import { it, describe } from 'node:test'
import assert from 'node:assert'

describe("POST /api/organization/", () => {
  it("should create a new organization", async (t) => {
    const app = await build(t)
    const res = await app.injectWithLogin({
      url: `/api/organization`,
      method: "POST",
      body: {
	name: "Cool organization"
      }
    });
    assert.partialDeepStrictEqual(JSON.parse(res.payload), {
      organization: {
	name: 'Cool organization',
      }
    });
  });
});

describe("GET /api/organization/:organizationId", () => {
  it("should get return an organization if user is a member", async (t) => {
    const app = await build(t)
    const organization = await app.seedOrganization("MEMBER");
    const res = await app.injectWithLogin({
      url: `/api/organization/${organization.id}`,
    });
    assert.partialDeepStrictEqual(JSON.parse(res.payload), {
      organization: {
	name: 'Apple Orchard',
      }
    });
  });

  it("should get return an organization if user is invited", async (t) => {
    const app = await build(t)
    const organization = await app.seedOrganization("INVITED");
    const res = await app.injectWithLogin({
      url: `/api/organization/${organization.id}`,
    });
    assert.partialDeepStrictEqual(JSON.parse(res.payload), {
      organization: {
	name: 'Apple Orchard',
      }
    });
  });

  it("should not return an organization if user not a member", async (t) => {
    const app = await build(t)
    const organization = await app.seedOrganization(null);
    const res = await app.injectWithLogin({
      url: `/api/organization/${organization.id}`,
    });
    assert.partialDeepStrictEqual(JSON.parse(res.payload), {
      error: "Forbidden",
      message: "Access Denied",
      statusCode: 403
    });
  });
});


describe("DELETE /api/organization/:organizationId", () => {
  it("should delete an organization if user is owner", async (t) => {
    const app = await build(t)
    const organization = await app.seedOrganization("OWNER");
    const res = await app.injectWithLogin({
      url: `/api/organization/${organization.id}`,
      method: "DELETE"
    });
    assert.strictEqual(res.statusCode, 204);
  });

  it("should error if user is not owner", async (t) => {
    const app = await build(t)
    const organization = await app.seedOrganization("ADMIN");
    const res = await app.injectWithLogin({
      url: `/api/organization/${organization.id}`,
      method: "DELETE"
    });
    assert.partialDeepStrictEqual(JSON.parse(res.payload), {
      error: "Forbidden",
      message: "Access Denied",
      statusCode: 403
    });
  });

  it("should error if user is not owner 2", async (t) => {
    const app = await build(t)
    const organization = await app.seedOrganization("INVITED");
    const res = await app.injectWithLogin({
      url: `/api/organization/${organization.id}`,
      method: "DELETE"
    });
    assert.partialDeepStrictEqual(JSON.parse(res.payload), {
      error: "Forbidden",
      message: "Access Denied",
      statusCode: 403
    });
  });

  it("should error if user is not in org", async (t) => {
    const app = await build(t)
    const organization = await app.seedOrganization(null);
    const res = await app.injectWithLogin({
      url: `/api/organization/${organization.id}`,
      method: "DELETE"
    });
    assert.partialDeepStrictEqual(JSON.parse(res.payload), {
      error: "Forbidden",
      message: "Access Denied",
      statusCode: 403
    });
  });
});

describe("POST /api/organization/:organizationId/share", () => {
  it("should invite users if user is ADMIN", async (t) => {
    const app = await build(t);
    const organization = await app.seedOrganization("ADMIN");
    const user1 = await app.seedUser("Brown Bear", "bb123");
    const user2 = await app.seedUser("Crazy Chicke", "cc123");
    assert.ok(user1);
    assert.ok(user2);
    const res = await app.injectWithLogin({
      url: `/api/organization/${organization.id}/share`,
      method: "POST",
      body: {
        users: [user1.id, user2.id],
      },
    });
    assert.partialDeepStrictEqual(JSON.parse(res.payload), {
      users: [
	{ userId: user1.id, role: "INVITED"},
	{ userId: user2.id, role: "INVITED"}
      ]
    });
  });

  it("should error if user does not permissions", async (t) => {
    const app = await build(t);
    const organization = await app.seedOrganization("MEMBER");
    const user1 = await app.seedUser("Brown Bear", "bb123");
    assert.ok(user1);
    const res = await app.injectWithLogin({
      url: `/api/organization/${organization.id}/share`,
      method: "POST",
      body: {
        users: [user1.id],
      },
    });
    assert.partialDeepStrictEqual(JSON.parse(res.payload), {
      error: "Forbidden",
      message: "Access Denied",
      statusCode: 403,
    });
  });

  it("should error if users array is empty", async (t) => {
    const app = await build(t);
    const organization = await app.seedOrganization("OWNER");

    const res = await app.injectWithLogin({
      url: `/api/organization/${organization.id}/share`,
      method: "POST",
      body: {
        users: [],
      },
    });
    assert.strictEqual(res.statusCode, 400);
  });
});

describe("PATCH /api/organization/:organizationId/join", () => {
  it("should join if user is invited", async (t) => {
    const app = await build(t);
    const organization = await app.seedOrganization("INVITED");
    const res = await app.injectWithLogin({
      url: `/api/organization/${organization.id}/join`,
      method: "PUT",
    });
    assert.strictEqual(res.statusCode, 204);
  });

  it("should error if user is not invited", async (t) => {
    const app = await build(t);
    const organization = await app.seedOrganization(null);
    const res = await app.injectWithLogin({
      url: `/api/organization/${organization.id}/join`,
      method: "PUT",
    });
    assert.partialDeepStrictEqual(JSON.parse(res.payload), {
      error: "Forbidden",
      message: "Access Denied",
      statusCode: 403,
    });
  });
});

describe("DELETE /api/organization/:organizationId/leave", () => {
  it("should leave organization if user is a member", async (t) => {
    const app = await build(t);
    const organization = await app.seedOrganization("MEMBER");
    const res = await app.injectWithLogin({
      url: `/api/organization/${organization.id}/leave`,
      method: "DELETE",
    });
    assert.strictEqual(res.statusCode, 204);
  });

  it("should error user is not in the organization", async (t) => {
    const app = await build(t);
    const organization = await app.seedOrganization(null);

    const res = await app.injectWithLogin({
      url: `/api/organization/${organization.id}/leave`,
      method: "DELETE",
    });
    assert.partialDeepStrictEqual(JSON.parse(res.payload), {
      error: "Forbidden",
      message: "Access Denied",
      statusCode: 403,
    });
  });

  it("should error user owner", async (t) => {
    const app = await build(t);
    const organization = await app.seedOrganization("OWNER");

    const res = await app.injectWithLogin({
      url: `/api/organization/${organization.id}/leave`,
      method: "DELETE",
    });
    assert.partialDeepStrictEqual(JSON.parse(res.payload), {
      error: 'Bad Request',
      message: 'You cannot perform this action as the owner, please transfer ownership first',
      statusCode: 400
    });
  });
});
