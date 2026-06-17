import { build } from "../../helper.js";

import { it, describe } from 'node:test'
import assert from 'node:assert'

describe("POST /api/calendar", () =>{
  it("should work for individual", async (t) => {
    const app = await build(t)
    const res = await app.injectWithLogin({
      url: "/api/calendar",
      method: "POST",
      body: {
	name: "calendar",
	description: "short description",
	links: [{ sharelink: true, url: "https://my.calendar.stuff" }]
      }});
    assert.partialDeepStrictEqual(JSON.parse(res.payload), {
      calendar: {
	name: "calendar",
	description: "short description",
	organizationId: null,
	links: [{ sharelink: true, url: "https://my.calendar.stuff" }],
	location: null,
	timezone: null,
	public: false,
	shareLink: false,
	meetingStart: null,
	meetingEnd: null
      }
    });
  });

  it("should work for an organization", async (t) => {
    const app = await build(t)
    const org = await app.seedOrganization("EDITOR");
    const res = await app.injectWithLogin({
      url: "/api/calendar",
      method: "POST",
      body: {
	name: "calendar",
	description: "short description",
	organizationId: org.id,
	links: [{ sharelink: true, url: "https://my.calendar.stuff" }]
      }});
    assert.partialDeepStrictEqual(JSON.parse(res.payload), {
      calendar: {
	name: "calendar",
	description: "short description",
	organizationId: org.id,
	links: [{ sharelink: true, url: "https://my.calendar.stuff" }],
	location: null,
	timezone: null,
	public: false,
	shareLink: false,
	meetingStart: null,
	meetingEnd: null
      }
    })
  });

  it("should fail for nonexisting organization", async (t) => {
    const app = await build(t)
    const res = await app.injectWithLogin({
      url: "/api/calendar",
      method: "POST",
      body: {
	name: "calendar",
	description: "short description",
	organizationId: 1,
	links: [{ sharelink: true, url: "https://my.calendar.stuff" }]
      }});
    assert.deepStrictEqual(JSON.parse(res.payload), {
      error: "Forbidden",
      message: "Access Denied",
      statusCode: 403
    })
  })

  it("should fail for invalid permissions in organization", async (t) => {
    const app = await build(t)
    const org = await app.seedOrganization("MEMBER");
    const res = await app.injectWithLogin({
      url: "/api/calendar",
      method: "POST",
      body: {
	name: "calendar",
	description: "short description",
	organizationId: org.id,
	links: [{ sharelink: true, url: "https://my.calendar.stuff" }]
      }});
    assert.deepStrictEqual(JSON.parse(res.payload), {
      error: "Forbidden",
      message: "Access Denied",
      statusCode: 403
    });
  });
});

describe("DELETE /api/calendar/:calendarId", () => {
  it("should successfully delete calendar as owner", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar("OWNER");
    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}`,
      method: "DELETE",
    });
    assert.strictEqual(res.statusCode, 204);
  });

  it("should fail for invalid permissions", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar("VIEWER");

    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}`,
      method: "DELETE",
    });

    assert.deepStrictEqual(JSON.parse(res.payload), {
      error: 'Forbidden',
      message: 'Access Denied',
      statusCode: 403
    });
  });

})

describe("PATCH /api/calendar/:calendarId/settings", () => {
  it("should successfully update description", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar();

    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/settings`,
      method: "PATCH",
      body: {
	description: "Updated description",
      },
    });

    assert.partialDeepStrictEqual(JSON.parse(res.payload), {
      calendar: {
	description: "Updated description",
      }
    })
  });

  it("should fail to change organization owner", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar();

    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/settings`,
      method: "PATCH",
      body: {
	organizationId: 123,
	description: "time to update",
      },
    });

    assert.deepStrictEqual(JSON.parse(res.payload), {
      error: "Forbidden",
      message: "Access Denied",
      statusCode: 403
    })
  });
});

describe("PATCH /api/calendar/:calendarId/timeblocks", () => {
  it("should successfully ADD a timeblock", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar("MEMBER");
    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/timeblocks`,
      method: "PATCH",
      body: {
	operation: "ADD",
	block: {
          id: 101,
          userId: 1,
          calendarId: calendar.id,
          description: "Focus Time",
          start: "09:00:00",
          end: "10:00:00",
	},
      },
    });
    assert.strictEqual(res.statusCode, 200);
  });

  it("should fail for invalid operations", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar("MEMBER");

    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/timeblocks`,
      method: "PATCH",
      body: {
	operation: "INVALID_OP",
	block: {
	  id: 102,
	  userId: 1,
	  calendarId: calendar.id,
	  start: "13:00:00",
	  end: "14:00:00",
	},
      },
    });

    assert.strictEqual(res.statusCode, 400);
  });
});

describe("PUT /api/calendar/:calendarId/share", () => {
  it("should share with specific users", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar();
    const userA = await app.seedUser("userA", "aa");
    const userB = await app.seedUser("userB", "bb");
    assert.ok(userA);
    assert.ok(userB);

    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/share`,
      method: "PUT",
      body: {
	users: [userA.id, userB.id],
      },
    });

    assert.partialDeepStrictEqual(JSON.parse(res.payload), {
      calendar: {
	description: 'short description',
	name: 'calendar',
	organizationId: null,
	public: false,
	shareLink: false,
      }
    });
  });

  it("should fail for empty users array", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar("OWNER");

    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/share`,
      method: "PUT",
      body: {
	users: [],
      },
    });

    assert.strictEqual(res.statusCode, 400);
  });
});

describe("PUT /api/calendar/:calendarId/join", () => {
  it("should join calendar directly when user is invited", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar("INVITED");

    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/join`,
      method: "PUT",
    });

    assert.strictEqual(res.statusCode, 200);
  });

  it("should fail user is not invited", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar("VIEWER");

    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/join`,
      method: "PUT",
    });

    assert.deepStrictEqual(JSON.parse(res.payload), {
      error: "Forbidden",
      message: "Access Denied",
      statusCode: 403
    });
  });
});

describe("PUT /api/calendar/:calendarId/leave", () => {
  it("should leave the calendar when user is a member", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar("MEMBER");
    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/leave`,
      method: "PUT",
    });
    assert.strictEqual(res.statusCode, 200);
  });

  it("should leave the calendar when user is invited too", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar("INVITED");
    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/leave`,
      method: "PUT",
    });
    assert.strictEqual(res.statusCode, 200);
  });

  it("should error if the user is a owner", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar("OWNER");
    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/leave`,
      method: "PUT",
    });

    assert.deepStrictEqual(JSON.parse(res.payload), {
      error: 'Bad Request',
      message: 'You cannot perform this action as the owner, please transfer ownership first',
      statusCode: 400
    });
  });
});
