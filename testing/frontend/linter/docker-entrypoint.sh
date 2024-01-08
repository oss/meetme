if [ -d "code" ]; then
    #ls /code > /dev/stdout
    #sleep 30000000
    npx eslint -c /root/eslint.config.cjs --color $@ "./code/**/*.{jsx,js}"
else
    npx eslint --help
fi