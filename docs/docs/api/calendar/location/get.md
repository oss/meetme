---
properties: !!set
    ? api-endpoint
endpoint-info:
    http-method: GET
    url: /cal/:calendar_id/location
    latest-hash: cc1ca67906c54dbe6603abc20f52da0b5b87be3c
---

# Get

Gets the location for a calendar with id `:calendar_id`

## Endpoint Information

- URL: `/cal/:calendar_id/location`
- HTTP Method: `GET`
- Requires Authentication: `yes`

## Example Usage

``` javascript
fetch('https://api.localhost.edu/cal/42a7027d4bd9cbda8a27fe8f321b74bd70328b20d230ae7f16dd7548ee3f1878/location', {
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
    "location": "Hill Center 017"
}
```

## Argument reference

## Restrictions

- If the calendar is owned by an individual, the individual must either be a owner, editor, member, or view of the calendar to get the location

- If the calendar is owned by an organization, the individual must be part of the organization to access the location.

## Other behaviors

- If no location is set, `location` will be equal to `null`