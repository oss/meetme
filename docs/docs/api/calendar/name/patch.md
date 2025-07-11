---
properties: !!set
    ? api-endpoint
endpoint-info:
    http-method: PATCH
    url: /cal/:calendar_id/name
    latest-hash: hash
---

# Get

Gets the name for a calendar with id `:calendar_id`.

## Endpoint Information

- URL: `/cal/:calendar_id/name`
- HTTP Method: `PATCH`
- Requires Authentication: `yes`

## Example Usage

``` javascript
fetch('https://api.localhost.edu/cal/42a7027d4bd9cbda8a27fe8f321b74bd70328b20d230ae7f16dd7548ee3f1878/name', {
    method: 'PATCH',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
    },
    body: {
        'new_name': 'Better Calendar'
    }
}).then((res) => res.json()).then((data) => {
    console.log(JSON.stringify(data));
});
```

## Example Response
```json
{
    "Status": "ok",
    "name": "My Calendar"
}
```

## Argument reference

## Restrictions

- If the calendar is owned by an individual, the individual must either be a owner, editor, member, or viewer of the calendar to get the name.

- If the calendar is owned by an organization, the individual must be part of the organization to access the name.

## Other behaviors
