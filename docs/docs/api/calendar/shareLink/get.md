---
properties: !!set
    ? api-endpoint
endpoint-info:
    http-method: GET
    url: /cal/:calendar_id/shareLink
    latest-hash: hash
---

# Get

Gets the shareLink state for a calendar with id `:calendar_id`.

## Endpoint Information

- URL: `/cal/:calendar_id/shareLink`
- HTTP Method: `GET`
- Requires Authentication: `yes`

## Example Usage

``` javascript
fetch('https://api.localhost.edu/cal/42a7027d4bd9cbda8a27fe8f321b74bd70328b20d230ae7f16dd7548ee3f1878/shareLink', {
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
    "Status": "ok",
    "shareLink": true
}
```

## Argument reference

## Restrictions

- If the calendar is owned by an individual, the individual must either be a owner, editor, member, or viewer of the calendar to get the shareLink state.

- If the calendar is owned by an organization, the individual must be part of the organization to access the shareLink state.

## Other behaviors
