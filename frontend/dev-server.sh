tmpfile="/tmp/$(date | sha1sum | cut -d " " -f 1 )"
rm -rf node_modules package-lock.json .npm .cache
npm outdated --json | \
    jq -r '. | to_entries | map( { (.key): .value.latest } ) | add // {} | { "dependencies": . }' | \
    jq --argjson ignorelist '[]' '.dependencies | with_entries(select([.key] | inside($ignorelist) | not)) | {dependencies: .}' | \
    jq -s '.[0] * .[1]' package.json - > "$tmpfile"

#npm outdated --json |     jq -r '. | to_entries | map( { (.key): .value.latest } ) | add // {} | { "dependencies": . }' |     jq --argjson ignorelist '["tailwindcss"]' '.dependencies | with_entries(select([.key] | inside($ignorelist) | not)) | {dependencies: .}' | jq --slurpfile s package.json '$s[0] * .' - > "$tmpfile"

mv "$tmpfile" package.json

npm install .

npx tailwindcss -i ./input.css -o index.css --watch=always &

echo "BALL"

API_URL="https://api.localhost.edu" WEBSITE_URL='https://localhost.edu' BUILD="dev" npx webpack serve --allowed-hosts all --port 80 --config webpack.dev.js --history-api-fallback