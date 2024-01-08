---
last_updated_hash: abc
---

# Get

Gets the meeting time for a calendar with id `:calendar_id`

## Endpoint Information

- URL: `/cal/:calendar_id/meet_time`
- HTTP Method: `GET`
- Requires Authentication: `yes`

## Example Usage

``` javascript
fetch('https://api.localhost.edu/cal/42a7027d4bd9cbda8a27fe8f321b74bd70328b20d230ae7f16dd7548ee3f1878/meet_time', {
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
    "meeting_time": {
        "start": 1000,
        "end": 2000
    }
}
```

## Argument reference

## Restrictions

- If the owner of the calendar is an organization, the requestor must be...
    1. The owner of the organization
    2. An admin of the organization
    3. An editor of the organization
    4. A member of the organization
    5. A viewer of the organization



## Other behaviors

- If no location is set, `location` will be equal to `null`