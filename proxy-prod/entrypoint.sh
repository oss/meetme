#!/usr/bin/env sh

envsubst '$PROD_URL' < /etc/nginx/templates/backend.conf > /etc/nginx/conf.d/backend.conf
nginx -g "daemon off;"
