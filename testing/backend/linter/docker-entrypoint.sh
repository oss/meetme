if [ -d "/root/code" ]; then
    #ls /code > /dev/stdout
    #sleep 30000000
    npx eslint -c /root/eslint.config.mjs --color $@ "/root/code/**/*.js"
else
    npx eslint --help
fi