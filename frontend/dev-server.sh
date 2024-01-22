npm install .

npx tailwindcss -i ./input.css -o index.css

API_URL="https://api.localhost.edu" BUILD="dev" npx webpack serve --allowed-hosts all --port 80 --config webpack.dev.js --history-api-fallback