---
last_updated_hash: abc
---

# Create

Creates a calendar

## Endpoint Information

- URL: `/cal`
- HTTP Method: `POST` 
- Requires Authentication: `yes`

## Example Usage
``` javascript
fetch('https://api.localhost.edu/cal', {
    method: 'POST',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        owner: {
            type: 'individual',
            id: 'netid1'
        },
        timeblocks: [
            { start: 1660219200000, end: 1660226400000 },
            { start: 1660305600000, end: 1660312800000 },
            { start: 1665057600000, end: 1665064800000 },
        ],
    }),
}).then((res) => res.json()).then((data) => {
    console.log(JSON.stringify(data));
});
```

## Example Response
```json
{
  "Status": "ok",
  "calendar": {
    "owner": {
      "owner_type": "individual",
      "_id": "netid1"
    },
    "meetingTime": {
      "start": null,
      "end": null
    },
    "deleted": {
      "isDeleted": false
    },
    "_id": "42a7027d4bd9cbda8a27fe8f321b74bd70328b20d230ae7f16dd7548ee3f1878",
    "blocks": [
      {
        "start": 1660219200000,
        "end": 1660226400000
      },
      {
        "start": 1660305600000,
        "end": 1660312800000
      },
      {
        "start": 1665057600000,
        "end": 1665064800000
      }
    ],
    "users": [
      {
        "_id": "netid1",
        "times": []
      }
    ],
    "pendingUsers": [],
    "viewers": [],
    "links": []
  }
}
```

## Argument reference

- owner - (optional) A json object to specify the owner of the calendar
- timeblocks - (required) A json array of json objects containing start and end times of when the calendar should be tracking.
- name - (optional) The calendar name.
- location - (optional) The location at which the meeting this calendar is related to is meant to meet at.
- public - (optional) A boolean which specifies wether the calendar should be able to be publicly viewable.

`timeblock` arrays have the following structure:

- is an array
- the array is composed of json objects with 2 keys: `start` and `end`
- the array times are sorted in chronological order
- the values of `start` and `end` are positive integers

`owner` objects have the following structure:

- contains two keys: `type` and `id`
- `type` can have 2 possible values: `organization` or `individual`
- `id` is the unique identifier of the corresponding owner. For individual's this is their netid, for organization its the organization's id.

## Restrictions

- When creating an individual calendar, the owner must always be the same as the authenticated user
- When creating an organization calendar, the user must either be an owner or admin of the organization the calendar belongs to

## Other behaviors
- If a name is not given, the name will default to `untitled`
- If an owner is not given, the calendar owner will be an individual calendar with an owner id equal to the netid of the currently signed in user.