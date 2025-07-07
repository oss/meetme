---
properties: !!set
    ? api-endpoint
endpoint-info:
    http-method: PATCH
    url: /cal/:calendar_id/owner
    latest-hash: hash
---

# Get

Sets the owner of the calendar with id `:calendar_id`.

## Endpoint Information

- URL: `/cal/:calendar_id/owner`
- HTTP Method: `PATCH`
- Requires Authentication: `yes`

## Example Usage

``` javascript
fetch('https://api.localhost.edu/cal/42a7027d4bd9cbda8a27fe8f321b74bd70328b20d230ae7f16dd7548ee3f1878/owner', {
    method: 'PATCH',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
    },
    body: {
        'owner_type': 'individual',
        'id': 'id'
    }
}).then((res) => res.json()).then((data) => {
    console.log(JSON.stringify(data));
});
```

## Example Response
```json
{
    "Status": "ok",
}
```

## Argument reference

## Restrictions

- You must be the owner in order to change the owner of the calendar.
- The new owner must have an account.


## Other behaviors
