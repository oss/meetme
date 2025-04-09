---
properties: !!set
    ? api-endpoint
endpoint-info:
    http-method: PATCH
    url: '/org/:organization_id/accept'
    latest-hash: hash
---

# Title

Accepts an org invite

## Endpoint Information

- URL: `/org/:organization_id/accept`
- HTTP Method: `PATCH`
- Requires Authentication: `yes`

## Example Usage

``` js
fetch('https://api.localhost.edu/org/42a7027d4bd9cbda8a27fe8f321b74bd70328b20d230ae7f16dd7548ee3f1878/accept', {
    method: 'PATCH',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
    },
}).then((res) => res.json()).then((data) => {
    console.log(JSON.stringify(data));
});
```

## Example Response
``` json
{
    "Status": "ok",
    "org": "42a7027d4bd9cbda8a27fe8f321b74bd70328b20d230ae7f16dd7548ee3f1878",
}
```

## Argument reference

## Restrictions

- The User should have been invited to the org before this was called, returns error if they were not added to org

## Other behaviors

- Some description