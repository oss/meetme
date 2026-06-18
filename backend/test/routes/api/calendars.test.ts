import { build } from "../../helper.js";

import { it, describe } from 'node:test'
import assert from 'node:assert'

describe("GET /api/calendar", () => {
  it("should return calendar data if user is a owner", async (t) => {
    const app = await build(t)
    const calendar = await app.seedCalendar("OWNER");
    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}`,
      method: "GET",
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

  it("should return calendar data if user is a viewer", async (t) => {
    const app = await build(t)
    const calendar = await app.seedCalendar("VIEWER");
    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}`,
      method: "GET",
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

  it("should fail if user is not a member", async (t) => {
    const app = await build(t)
    const calendar = await app.seedCalendar(null);
    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}`,
      method: "GET",
    });
    assert.deepStrictEqual(JSON.parse(res.payload), {
      error: "Forbidden",
      message: "Access Denied",
      statusCode: 403
    });
  });

  it("should fail if calendar does not exist", async (t) => {
    const app = await build(t)
    const res = await app.injectWithLogin({
      url: `/api/calendar/123`,
      method: "GET",
    });
    assert.deepStrictEqual(JSON.parse(res.payload), {
      error: "Forbidden",
      message: "Access Denied",
      statusCode: 403
    });
  });
});

describe("POST /api/calendar", () => {
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
    const calendar = await app.seedCalendar("OWNER");

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
    const calendar = await app.seedCalendar("OWNER");

    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/settings`,
      method: "PATCH",
      body: {
	organizationId: 123,
	description: "time to update",
      },
    });

    assert.deepStrictEqual(JSON.parse(res.payload), {
      error: "Bad Request",
      message: "Please use PUT /api/calendar/:id/owner to transfer to an organization",
      statusCode: 400
    })
  });
});

describe("POST /api/calendar/:calendarId/timeblocks", () => {
  it("should successfully ADD a timeblock", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar("MEMBER");
    const now = new Date();
    const later = new Date();
    later.setHours(now.getHours() + 4);
    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/timeblocks`,
      method: "POST",
      body: {
	block: {
          id: 101,
          userId: 1,
          calendarId: calendar.id,
          description: "Focus Time",
          start: now.toISOString(),
          end: later.toISOString(),
	},
      },
    });
    assert.partialDeepStrictEqual(JSON.parse(res.payload), {
      timeblock: {
	userId: 1,
	calendarId: calendar.id,
	description: "Focus Time",
	start: now.toISOString(),
	end: later.toISOString()
      }
    });
    const res2 = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/timeblocks`,
    });
    assert.partialDeepStrictEqual(JSON.parse(res2.payload), {
      timeblocks: [{
	userId: 1,
	calendarId: calendar.id,
	description: "Focus Time",
	start: now.toISOString(),
	end: later.toISOString()
      }]
    });
  });

  it("should successfully SET a timeblock", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar("MEMBER");
    const now = new Date();
    const later = new Date();
    later.setHours(now.getHours() + 4);
    await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/timeblocks`,
      method: "POST",
      body: {
	block: {
          id: 101,
          userId: 1,
          calendarId: calendar.id,
          description: "Focus Time",
          start: now.toISOString(),
          end: later.toISOString(),
	},
      },
    });
    const res2 = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/timeblocks`,
      method: "POST",
      body: {
	block: {
          id: 101,
          userId: 1,
          calendarId: calendar.id,
          description: "new description",
          start: now.toISOString(),
          end: later.toISOString(),
	},
      },
    });
    assert.partialDeepStrictEqual(JSON.parse(res2.payload), {
      timeblock: {
	userId: 1,
	calendarId: calendar.id,
	description: "new description",
	start: now.toISOString(),
	end: later.toISOString()
      }
    });
  });

  it("should error due to invalid permissions", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar("VIEWER");
    const now = new Date();
    const later = new Date();
    later.setHours(now.getHours() + 4);
    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/timeblocks`,
      method: "POST",
      body: {
	block: {
          id: 101,
          userId: 1,
          calendarId: calendar.id,
          description: "Focus Time",
          start: now.toISOString(),
          end: later.toISOString(),
	},
      },
    });
    assert.deepStrictEqual(JSON.parse(res.payload), {
      error: "Forbidden",
      message: "Access Denied",
      statusCode: 403
    });
  });
});

describe("DELETE /api/calendar/:calendarId/timeblocks", () => {
  it("should successfully DELETE a timeblock", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar("MEMBER");
    const now = new Date();
    const later = new Date();
    later.setHours(now.getHours() + 4);
    await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/timeblocks`,
      method: "POST",
      body: {
	block: {
          id: 101,
          userId: 1,
          calendarId: calendar.id,
          description: "Focus Time",
          start: now.toISOString(),
          end: later.toISOString(),
	},
      },
    });
    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/timeblocks`,
      method: "DELETE",
      body: {
	block: 101,
      }
    });
    assert.strictEqual(res.statusCode, 204);
  });

})

describe("POST /api/calendar/:calendarId/share", () => {
  it("should share with specific users", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar("OWNER");
    const userA = await app.seedUser("userA", "aa");
    const userB = await app.seedUser("userB", "bb");
    assert.ok(userA);
    assert.ok(userB);

    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/share`,
      method: "POST",
      body: {
	users: [userA.id, userB.id],
      },
    });

    assert.partialDeepStrictEqual(JSON.parse(res.payload), {
      users: [
	{ userId: userA.id, role: "INVITED" },
	{ userId: userB.id, role: "INVITED" }
      ]
    });
  });

  it("should fail for empty users array", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar("OWNER");

    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/share`,
      method: "POST",
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
    assert.strictEqual(res.statusCode, 204);
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

describe("DELETE /api/calendar/:calendarId/leave", () => {
  it("should leave the calendar when user is a member", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar("MEMBER");
    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/leave`,
      method: "DELETE",
    });
    assert.strictEqual(res.statusCode, 204);
  });

  it("should leave the calendar when user is invited too", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar("INVITED");
    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/leave`,
      method: "DELETE",
    });
    assert.strictEqual(res.statusCode, 204);
  });

  it("should error if the user is a owner", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar("OWNER");
    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/leave`,
      method: "DELETE",
    });

    assert.deepStrictEqual(JSON.parse(res.payload), {
      error: 'Bad Request',
      message: 'You cannot perform this action as the owner, please transfer ownership first',
      statusCode: 400
    });
  });
});

describe("DELETE /api/calendar/:calendarId/unshare", () => {
  it("should remove the user", async (t) => {
    const app = await build(t);
    const user = await app.seedUser("Brown Bear", "bb123");
    assert.ok(user);
    const calendar = await app.seedCalendar("OWNER", { id: user.id, role: "MEMBER" });
    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/unshare`,
      method: "DELETE",
      body: {
	user: user.id
      }
    });
    assert.strictEqual(res.statusCode, 204);
  });

  it("should error when trying to remove yourself", async (t) => {
    const app = await build(t);
    const calendar = await app.seedCalendar("OWNER");
    const res = await app.injectWithLogin({
      url: `/api/calendar/${calendar.id}/unshare`,
      method: "DELETE",
      body: {
	user: 1
      }
    });
    assert.deepStrictEqual(JSON.parse(res.payload), {
      error: 'Bad Request',
      message: 'You cannot remove yourself, please use /api/calendar/:id/leave instead',
      statusCode: 400
    });
  });
});
