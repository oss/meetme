#!/usr/bin/env sh

envsubst '$PROD_URL' < /etc/nginx/templates/proxy.conf > /etc/nginx/conf.d/proxy.conf
nginx -g "daemon off;"
