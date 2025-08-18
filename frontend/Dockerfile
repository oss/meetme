# syntax=docker/dockerfile:1-labs

FROM node as build-stage

ARG API_URL=https://api.meetme.oss.rutgers.edu
ARG WEBSITE_URL=https://meetme.oss.rutgers.edu

RUN mkdir /root/build
WORKDIR /root
COPY package.json .
RUN npm install .

COPY --exclude=.npm --exclude=node_modules . .

RUN API_URL=${API_URL} WEBSITE_URL=${WEBSITE_URL} ./build.sh

FROM nginx:latest

COPY --from=build-stage /root/build /usr/share/nginx/html
COPY --from=build-stage /root/webpack.output /root/webpack.out
COPY --from=build-stage /root/proxy/proxy.conf /etc/nginx/conf.d/default.conf
