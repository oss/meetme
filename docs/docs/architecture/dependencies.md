All dependencies and their purposes are listed below.

## Backend
`express`
:   Javascript framework for creating restful APIs

`mongoose`
:   Allows communication with mongodb

`cookie-parser`
:   Reads cookies which are in headers (used for authentication)

`passport@0.5.3`
:   Main authentication framework

`body-parser`
!!! warning "Potentially unused dependency"

    Check if this is used...

`passport-saml`
:   Enables passport to authentication using SAML

`cookie-session`
:   Saves sessions in the form of cookies

`ldapjs`
:   Allows communication with ldap servers

`winston`
:   Logging framework


## Frontend

## Websockets
`socket.io`
:   Websocket framework to enable auto-updates

`@socket.io/mongo-emitter`
:   Allows socket.io to communicate with other websocket instances

`@socket.io/mongo-adapter`
:   Allows socket.io to use mongodb as a shared data source for multiple websocket instances

`mongodb`
:   Mongodb driver to allow changestreams

`node-fetch@2`
:   Used to verify identity of the request against the backend's `whoami` endpoint.


## Database
`mongodb`
:   The main database for meetme

`mongodb_exporter`
:   Exports prometheus metrics which can be used to monitor the status of the mongodb cluster

## Monitoring
`prometheus`
:   Scrapes all metrics from specific endpoints and aggregates them into one location

`grafana`
:   Allows us to create nice looking dashboards with prometheus data

## Other notable apps
`nginx`
:   A fast performant proxy. Used specifically in meetme as a reverse proxy

`openldap`
:   An open source identity provider which uses LDAP protocol

`shibboleth`
:   Uses ldap identity to allow uses to sign in. This is what Rutgers uses

## Documentation
`mkdocs`
:   The main documentation engine

`mkdocs-material`
:   The theme for our documentation