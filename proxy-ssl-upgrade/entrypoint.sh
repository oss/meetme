#!/usr/bin/env sh

envsubst '$SITE_URL' < /etc/nginx/templates/backend.conf > /etc/nginx/conf.d/backend.conf
nginx -g "daemon off;"
