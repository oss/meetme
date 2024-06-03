---
properties: !!set
    ? api-endpoint
endpoint-info:
    http-method: PATCH
    url: /cal/:calendar_id/accept
    latest-hash: hash
---

# Accept Invite

Accepts an invite to a specific calendar with ID `:calendar_id`

## Endpoint Information

- URL: `/cal/:calendar_id/accept`
- HTTP Method: `PATCH`
- Requires Authentication: `yes`

## Argument reference

- `calendar_id` (required) The id of the calendar which you want to accept the invite from

## Response reference
### Success
```typescript
{
    (string) Status: 'ok'
    (string) calendar: 'calendar id'
}
```

## Restrictions

- This only applies to calendars owned by an individual.
- The user must already have a pending invite to said calendar.

## Other behaviors

## Example Usage

``` javascript
fetch('https://api.localhost.edu/cal/42a7027d4bd9cbda8a27fe8f321b74bd70328b20d230ae7f16dd7548ee3f1878/accept', {
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
```json
{
    "Status": "ok",
    "calendar": "42a7027d4bd9cbda8a27fe8f321b74bd70328b20d230ae7f16dd7548ee3f1878"
}
```
