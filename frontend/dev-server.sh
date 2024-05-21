tmpfile="/tmp/$(date | sha1sum | cut -d " " -f 1 )"
npm outdated --json | \
    jq -r '. | to_entries | map( { (.key): .value.latest } ) | add // {} | { "dependencies": . }' | \
    jq --argjson ignorelist '[]' '.dependencies | with_entries(select([.key] | inside($ignorelist) | not)) | {dependencies: .}' | \
    jq -s '.[0] * .[1]' package.json - > "$tmpfile"

mv "$tmpfile" package.json

npm install .

npx tailwindcss -i ./input.css -o index.css --watch &

API_URL="https://api.localhost.edu" BUILD="dev" npx webpack serve --allowed-hosts all --port 80 --config webpack.dev.js --history-api-fallback