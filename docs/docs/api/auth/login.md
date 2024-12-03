---
properties: !!set
    ? api-endpoint
endpoint-info:
    http-method: GET
    url: '/login'
    latest-hash: 3c0650f976665e14eb96fc6ede8dcde7f19cfffd
---

# Login

This endpoint sets and redirects the request to [Shibboleth](https://www.shibboleth.net/) or some other SAML2 Identity Provider. The response itself will be blank with a `302` status code.

## Endpoint Information

- URL: `/login`
- HTTP Method: `GET`
- Requires Authentication: `no`

## Example Usage

=== "MacOS"

    ``` sh
    open "http://api.localhost.edu/login"
    ```

=== "Linux"

    ``` sh
    xdg-open "http://api.localhost.edu/login"
    ```

=== "Windows"

    ``` sh
    explorer "http://api.localhost.edu/login"
    ```

## Example Response
``` sh

< HTTP/1.1 302 Found
< Server: nginx/1.27.0
< Date: Sat, 01 Jun 2024 03:55:58 GMT
< Content-Length: 0
< Connection: keep-alive
< X-Powered-By: Express
< Location: https://idp.localhost.edu:4443/idp/profile/SAML2/Redirect/SSO?SAMLRequest=nZLLbsIwEEV%2FJfKeOC8eskgQhUWRaEGEdtFN5TgTYsmxU49D6d9XQFFhURbdzozuuXdmxpNDo7w9WJRGpyT0AzLJxsgb1bJp52q9gY8O0HmHRmlkp0ZKOquZ4SiRad4AMidYPn1assgPWGuNM8Io4i3mKXkvw0LwqhyJpAr7AIOiCuJhATwOE0gGRTzkUTUaCUG814uJyA%2BIt0DsYKHRce1SEgVR0gsGvSDcBjHr91l%2F5IdR8ka89Q%2FuQepS6t19b8V5CNnjdrvurVf5lnhzQCc1dyd07VyLjFJZtr4ygqvaoPOh7FiSJPGxTFtrKqmAHkUjuoFSWhCO5vmKeFNEsEelmdHYNWBzsHsp4GWz%2FNXmrbzVpsrspCbntbNTcHu17%2FuR%2BAVJsr8BWMuiMApcPaZXkMuhn3kDi%2FnaKCm%2B%2FnPoqVLmc2aBO0iJsx0Qmp1Bt0%2BUfQM%3D
< Set-Cookie: session=e30=; path=/; domain=localhost.edu; Secure; SameSite=Lax
< Set-Cookie: session.sig=d_m-lrfpOr6HWVH0BqEe7ahZAVo; path=/; domain=localhost.edu; Secure; SameSite=Lax
< Access-Control-Allow-Origin: https://localhost.edu
< Access-Control-Allow-Credentials: true
< Access-Control-Allow-Methods: GET,POST,DELETE,PUT,OPTIONS,PATCH
< Access-Control-Allow-Headers: DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Cookie

```

## Argument reference

- `dest` (optional) The frontend URL to redirect to after logging in
    - It will default to `/` if none is provided

## Restrictions

No Restrictions

## Other behaviors

Behaviors may differ based on identity providers ex. [Shibboleth](https://www.shibboleth.net/), [SimpleSAMLphp](https://simplesamlphp.org/)