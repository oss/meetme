---
properties: !!set
    ? api-endpoint
endpoint-info:
    http-method: GET
    url: '/cal/:calendar_id/main'
    latest-hash: hash
---

# Meta

Returns main information about the given calendar. Main information is details about the owners, viewers, and editors of the calendar as well as links. For information about the calendar itself, see `/cal/:calendar_id/meta`.

## Endpoint Information

- URL: `/cal/:calendar_id/main`
- HTTP Method: `GET`
- Requires Authentication: `yes`

## Example Usage
``` javascript
fetch('https://api.localhost.edu/cal/42a7027d4bd9cbda8a27fe8f321b74bd70328b20d230ae7f16dd7548ee3f1878/main', {
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

- If the calendar is owned by an individual, the individual must either be a owner, editor, member, or viewer of the calendar to get the main information.

- If the calendar is owned by an organization, the individual must be part of the organization to access the main information.
