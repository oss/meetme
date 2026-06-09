#!/usr/bin/env sh

# Conditionally copy relevant nginx config files depending on the environment.
# The difference between the environments is that the PROD=true environment has
# no certs since our own proxy in front of it will handle SSL. For testing we
# will default to using the certs.

# TODO: right now, we still copy the certs in even with PROD=true, this
# shouldn't really be too bad since it is just self-signed certs. But
# we should consider deleting them from the container.

backend="/etc/nginx/templates/backend.conf"
frontend="/etc/nginx/templates/frontend.conf"

if [ "$PROD" = "true" ]; then
    backend="/etc/nginx/templates/backend-prod.conf"
    frontend="/etc/nginx/templates/frontend-prod.conf"
fi

# NOTE: keep this as single quotes, it is a literal, we do not want it to expand!
envsubst '$SITE_URL' < "$backend"  > /etc/nginx/conf.d/backend.conf
cp "$frontend" /etc/nginx/conf.d/frontend.conf

nginx -g "daemon off;"
