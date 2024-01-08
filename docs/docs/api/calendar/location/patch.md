---
last_updated_hash: abc
---

# Update

Updates the location for a calendar with id `:calendar_id`

## Endpoint Information

- URL: `/cal/:calendar_id/location`
- HTTP Method: `PATCH`
- Requires Authentication: `yes`

## Example Usage

``` javascript
fetch('https://api.localhost.edu/cal/42a7027d4bd9cbda8a27fe8f321b74bd70328b20d230ae7f16dd7548ee3f1878/location', {
    method: 'PATCH',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        location: "Hill Center 111"
    }),
}).then((res) => res.json()).then((data) => {
    console.log(JSON.stringify(data));
});
```

## Example Response
```json
{
    "Status": "ok",
    "location": "Hill Center 111"
}
```

## Argument reference

- `location` (required) The meeting location which corresponds to the given calendar
    - Set the location to `null` to indicate that there is no location set for the calendar.

## Restrictions

- If the calendar is owned by an individual, the individual must either be a owner to modify the calendar

- If the calendar is owned by an organization, the individual must either be part of the organization, or individually shared to the calendar.

## Other behaviors

- If no location is set, `location` will be equal to `null`