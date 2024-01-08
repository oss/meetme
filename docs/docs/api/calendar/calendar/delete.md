---
last_updated_hash: abc
---

# Delete

Delete a calendar

## Endpoint Information

- URL: `/cal/:calendar_id`
- HTTP Method: `DELETE` 
- Requires Authentication: `yes`

## Example Usage

``` javascript
fetch('https://api.localhost.edu/cal/42a7027d4bd9cbda8a27fe8f321b74bd70328b20d230ae7f16dd7548ee3f1878', {
    method: 'DELETE',
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
    "Status": "ok"
}
```

## Argument reference

## Restrictions

- If the calendar is owned by an individual, the calendar can only be deleted by the owner
- If the calendar is owned by an organization, the calendar can only be deleted by the organization's owner or admins.

## Other behaviors