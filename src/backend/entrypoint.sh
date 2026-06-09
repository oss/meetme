#!/usr/bin/env sh

# Use default settings when not in PROD. But error in PROD when config file is
# not provided, as that is most definitely a bad thing.
if [ ! -f "config.json5" ]; then
    if [ "$PROD" = "true" ]; then
	echo "No configuration file provided!"
	exit 1
    fi
    cp defaults/config.json5 /etc/meetme
    cp -r defaults/security/ .
fi

# We will run some checks directly in main.js to ensure we are not running with
# dev settings when in prod. Running dev settings (unconfigured settings) will
# most definitely break in production and/or are insecure.
if [ "$PROD" = "true" ]; then
    # See: https://expressjs.com/en/advanced/best-practice-performance.html
    NODE_ENV=production node main.js
else
    node --watch main.js
fi
