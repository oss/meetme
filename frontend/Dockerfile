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

RUN mkdir -p /etc/nginx/certificate && openssl dhparam -out /etc/nginx/certificate/dhparams.pem 4096
RUN openssl req -new -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -x509 -nodes -days 365 -out /etc/nginx/certificate/frontend_cert.pem -keyout /etc/nginx/certificate/frontend_key.pem -subj "/CN=localhost.edu" -addext "subjectAltName=DNS:localhost.edu,DNS:*.locahost.edu"

COPY --from=build-stage /root/build /usr/share/nginx/html
COPY --from=build-stage /root/webpack.output /root/webpack.out
COPY --from=build-stage /root/proxy/proxy.conf /etc/nginx/conf.d/default.conf