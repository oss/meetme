## General Format

### Good Response

If you complete a successful request, the status field will have the value of "ok".

```json
{
  "Status": "ok",
  "somedata": {
    "key": "value",
    "array": ["index 0", "index 1"]
  }
}
```

### Bad response

If you compete a invalid response, you will get a response along the lines of...

```json
{
  "Status": "error",
  "error": "an error describing what went wrong"
}
```

!!! warning "HTTP Status Codes"

    Currently if you hit a valid endpoint in express, it will always return a 200 status code. This is because your request was successfully processed. This should be changed in the future. Please look at the following link for more info.
    
    https://expressjs.com/en/5x/api.html#res.status

## Authentication
To ensure that a user is authenticated, we use two cookies: `session` and `session.sig`. The `session` cookie stores the actual data of the user encoded in base64, such as `netid` and `firstName`. The `session.sig` cookie contains a hash which is validated against `session`. To successfully make an authenticated request, you need to send both the `session` and `session.sig` cookies in the header of your request.

=== "shell"

    ``` sh
    curl 'https://api.localhost.edu/user/me' -H 'Cookie: session=eyJwYXNzcG9ydCI6eyJ1c2VyIjp7Imlzc3VlciI6Imh0dHBzOi8vaWRwLmxvY2FsaG9zdC5lZHUvaWRwL3NoaWJib2xldGgiLCJpblJlc3BvbnNlVG8iOiJfNzRlOGNiNjNhNzUwMjg3ZTgwYWEiLCJzZXNzaW9uSW5kZXgiOiJfOTZjYzIzN2IxNmU1YzMzZDQzZmFjZGQ3ZTk0NmNlMTUiLCJuYW1lSUQiOiJBQWR6WldOeVpYUXhsMk1IbTlPTWJMY1BvTDN5WWJlSzBYK3lBTE5pMGtJM0ZYYUsvWVVKV2xadTAwbjJTVGpkamtGMDNicTlSS3piT0pWU0FMakpUS0Q0QkVzbjNsWEc0ZHUvcFVLRWRmU3pVdzIwWnVQY0VaemdRMkg5c25ZSkNZTHdxNUw5Q0Y2UWZ4OWVScGJlbnpCWCIsIm5hbWVJREZvcm1hdCI6InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpuYW1laWQtZm9ybWF0OnRyYW5zaWVudCIsIm5hbWVRdWFsaWZpZXIiOiJodHRwczovL2lkcC5sb2NhbGhvc3QuZWR1L2lkcC9zaGliYm9sZXRoIiwic3BOYW1lUXVhbGlmaWVyIjoiaHR0cHM6Ly9hcGkubG9jYWxob3N0LmVkdS9zaGliYm9sZXRoIiwidXJuOm9pZDoyLjUuNC40MiI6IkZpcnN0MSIsInVybjpvaWQ6Mi41LjQuNCI6Ikxhc3QxIiwidXJuOm9pZDowLjkuMjM0Mi4xOTIwMDMwMC4xMDAuMS4xIjoibmV0aWQxIiwiYXR0cmlidXRlcyI6eyJ1cm46b2lkOjIuNS40LjQyIjoiRmlyc3QxIiwidXJuOm9pZDoyLjUuNC40IjoiTGFzdDEiLCJ1cm46b2lkOjAuOS4yMzQyLjE5MjAwMzAwLjEwMC4xLjEiOiJuZXRpZDEifSwidWlkIjoibmV0aWQxIiwiZmlyc3ROYW1lIjoiRmlyc3QxIiwibGFzdE5hbWUiOiJMYXN0MSJ9fX0=; session.sig=u_mhcr18g2iZf_FvHyYmqgf3ssk'
    ```

=== "python"

    ``` python
    import requests
    requests.get('http://api.localhost.edu/whoami', cookies={'session': 'eyJwYXNzcG9ydCI6eyJ1c2VyIjp7Imlzc3VlciI6Imh0dHBzOi8vaWRwLmxvY2FsaG9zdC5lZHUvaWRwL3NoaWJib2xldGgiLCJpblJlc3BvbnNlVG8iOiJfNzRlOGNiNjNhNzUwMjg3ZTgwYWEiLCJzZXNzaW9uSW5kZXgiOiJfOTZjYzIzN2IxNmU1YzMzZDQzZmFjZGQ3ZTk0NmNlMTUiLCJuYW1lSUQiOiJBQWR6WldOeVpYUXhsMk1IbTlPTWJMY1BvTDN5WWJlSzBYK3lBTE5pMGtJM0ZYYUsvWVVKV2xadTAwbjJTVGpkamtGMDNicTlSS3piT0pWU0FMakpUS0Q0QkVzbjNsWEc0ZHUvcFVLRWRmU3pVdzIwWnVQY0VaemdRMkg5c25ZSkNZTHdxNUw5Q0Y2UWZ4OWVScGJlbnpCWCIsIm5hbWVJREZvcm1hdCI6InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpuYW1laWQtZm9ybWF0OnRyYW5zaWVudCIsIm5hbWVRdWFsaWZpZXIiOiJodHRwczovL2lkcC5sb2NhbGhvc3QuZWR1L2lkcC9zaGliYm9sZXRoIiwic3BOYW1lUXVhbGlmaWVyIjoiaHR0cHM6Ly9hcGkubG9jYWxob3N0LmVkdS9zaGliYm9sZXRoIiwidXJuOm9pZDoyLjUuNC40MiI6IkZpcnN0MSIsInVybjpvaWQ6Mi41LjQuNCI6Ikxhc3QxIiwidXJuOm9pZDowLjkuMjM0Mi4xOTIwMDMwMC4xMDAuMS4xIjoibmV0aWQxIiwiYXR0cmlidXRlcyI6eyJ1cm46b2lkOjIuNS40LjQyIjoiRmlyc3QxIiwidXJuOm9pZDoyLjUuNC40IjoiTGFzdDEiLCJ1cm46b2lkOjAuOS4yMzQyLjE5MjAwMzAwLjEwMC4xLjEiOiJuZXRpZDEifSwidWlkIjoibmV0aWQxIiwiZmlyc3ROYW1lIjoiRmlyc3QxIiwibGFzdE5hbWUiOiJMYXN0MSJ9fX0=','session.sig': 'u_mhcr18g2iZf_FvHyYmqgf3ssk'}).json()
    ```

=== "browser-fetch"
    ``` javascript
    fetch('https://api.localhost.edu/whoami', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((res) => res.json()).then((data) => {
        console.log(data)
    });
    ```
    !!! note
        Due to security, we are not able to access our login credentials directly. To send the proper cookies, we need to use fetch with the `credentials` flag.


## Headers
To ensure that your json is properly parsed, you must include the `'Content-Type': 'application/json'` header in addition to the authentication headers mentioned at [Authentication](#authentication).
