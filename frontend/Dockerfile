FROM node:latest as build-stage

RUN mkdir /root/build
WORKDIR /root
ARG BUILD
ENV BUILD=${BUILD}
RUN npm install uniqid \
    @babel/core @babel/preset-env @babel/preset-react @babel/plugin-transform-object-assign babel-loader @babel/preset-typescript url-loader \
    webpack webpack-cli html-webpack-plugin css-loader autoprefixer style-loader postcss-loader webpack-remove-debug copy-webpack-plugin \
    react react-dom react-router-dom \
    tailwindcss postcss react-date-range \
    js-cookie socket.io-client @headlessui/react \
    babel-jest

COPY . .

RUN ./build.sh

FROM nginx:latest

COPY --from=build-stage /root/build /usr/share/nginx/html
COPY --from=build-stage /root/webpack.output /root/webpack.out
COPY --from=build-stage /root/proxy /etc/nginx