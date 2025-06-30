---
properties: !!set
    ? api-endpoint
endpoint-info:
    http-method: GET
    url: '/cal/:calendar_id/meta'
    latest-hash: hash
---

# Meta

Returns meta information about the given calendar. Meta information is details about the calendar itself, such as description, time blocks, and locations. For information about who owns the calendar, see `/cal/:calendar_id/main`.

## Endpoint Information

- URL: `/cal/:calendar_id/meta`
- HTTP Method: `GET`
- Requires Authentication: `yes`

## Example Usage
``` javascript
fetch('https://api.localhost.edu/cal/42a7027d4bd9cbda8a27fe8f321b74bd70328b20d230ae7f16dd7548ee3f1878/meta', {
    method: 'GET',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
    },
}).then((res) => res.json()).then((data) => {
    console.log(JSON.stringify(data));
});
```

## Example Response
```json
{
}
```

## Argument reference

- calender_id - The id of the calendar to fetch the metadata of

## Restrictions

- If the calendar is owned by an individual, the individual must either be a owner, editor, member, or viewer of the calendar to get the meta information.

- If the calendar is owned by an organization, the individual must be part of the organization to access the meta information.
