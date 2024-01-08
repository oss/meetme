npm install uniqid \
@babel/core @babel/preset-env @babel/preset-react @babel/plugin-transform-object-assign babel-loader url-loader \
webpack webpack-cli html-webpack-plugin css-loader autoprefixer style-loader postcss-loader webpack-remove-debug copy-webpack-plugin \
react react-dom react-router-dom \
tailwindcss postcss react-date-range \
js-cookie socket.io-client webpack-dev-server webpack-cli @headlessui/react @babel/preset-typescript

npx tailwindcss -i ./input.css -o index.css

API_URL="https://api.localhost.edu" BUILD="dev" npx webpack serve --allowed-hosts all --port 80 --config webpack.config.dev.js --history-api-fallback