FROM node:latest
WORKDIR /root
RUN npm install uniqid \
    @babel/core @babel/preset-env @babel/preset-react @babel/plugin-transform-object-assign babel-loader url-loader \
    webpack webpack-cli html-webpack-plugin css-loader autoprefixer style-loader postcss-loader webpack-remove-debug copy-webpack-plugin \
    react react-dom react-router-dom \
    tailwindcss @material-tailwind/react postcss react-date-range \
    js-cookie socket.io-client @headlessui/react \
    babel-jest
RUN npm install jest babel-jest @babel/preset-env @babel/preset-react react-test-renderer source-map
COPY docker-entrypoint.sh .
ENTRYPOINT [ "sh","docker-entrypoint.sh" ]
