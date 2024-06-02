---
properties: !!set
    ? api-endpoint
endpoint-info:
    http-method: GET
    url: '/logout'
    latest-hash: 98bb445987c0f6e6c5425acc2ef4d4162cb1f5b1
---

# Logout

Logs out the user by sending headers which will _override_ the cookie with an invalid session.

## Endpoint Information

- URL: `/logout`
- HTTP Method: `GET`
- Requires Authentication: `yes`

## Example Usage

=== "MacOS"

    ``` sh
    open "http://api.localhost.edu/logout"
    ```

=== "Linux"

    ``` sh
    xdg-open "http://api.localhost.edu/logout"
    ```

=== "Windows"

    ``` sh
    explorer "http://api.localhost.edu/logout"
    ```

## Example Response

### Response Headers

``` sh

< HTTP/2 200 
< server: nginx/1.27.0
< date: Sun, 02 Jun 2024 04:51:50 GMT
< content-type: application/json; charset=utf-8
< content-length: 15
< x-powered-by: Express
< etag: W/"f-K+zlQz2WdLjI4Q/Gm5SS+J/TcSI"
< set-cookie: session=eyJwYXNzcG9ydCI6e30sInRpbWUiOjE3MTczMDM5MX0=; path=/; domain=localhost.edu; Secure; SameSite=Lax
< session.sig=28dwdcMThLJNWQ-vKab4QQMWYrjWVPABmZ7u_pVs9ByrfuokOU_OfveT8H1x8EGILjp_rZ24PA2KpBxfM6JamQ; path=/; domain=localhost.edu; Secure; SameSite=Lax
< access-control-allow-origin: https://localhost.edu
< access-control-allow-credentials: true
< access-control-allow-methods: GET,POST,DELETE,PUT,OPTIONS,PATCH
< access-control-allow-headers: DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Cookie
< X-Firefox-Spdy: h2

```

### Response Body

``` json

{
    "Status": "ok"
}

```

## Argument reference

No Arguments

## Restrictions

No Restrictions

## Other behaviors

Behaviors may differ based on identity providers ex. [Shibboleth](https://www.shibboleth.net/), [SimpleSAMLphp](https://simplesamlphp.org/)