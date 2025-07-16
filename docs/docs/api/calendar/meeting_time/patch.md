---
properties: !!set
    ? api-endpoint
endpoint-info:
    http-method: PATCH
    url: /cal/:calendar_id/meet_time
    latest-hash: hash
---

# Patch

Sets the meeting time for a calendar with id `:calendar_id`.

## Endpoint Information

- URL: `/cal/:calendar_id/meet_time`
- HTTP Method: `PATCH`
- Requires Authentication: `yes`

## Example Usage

``` javascript
fetch('https://api.localhost.edu/cal/42a7027d4bd9cbda8a27fe8f321b74bd70328b20d230ae7f16dd7548ee3f1878/meet_time', {
    method: 'PATCH',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
    },
    body: {
        'start': 1000,
        'end': 2000
    },
}).then((res) => res.json()).then((data) => {
    console.log(JSON.stringify(data));
});
```

## Example Response
```json
{
    "Status": "ok",
    "meeting_time": {
        "start": 1000,
        "end": 2000
    }
}
```

## Argument reference

- The start and end times must not overlap.

## Restrictions

- If the calendar is owned by an individual, the individual must either be an owner, editor, or admin of the calendar to change the meeting time.

- If the calendar is owned by an organization, the individual must be part of the organization to change the location.

## Other behaviors
