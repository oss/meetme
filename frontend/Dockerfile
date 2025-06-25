# syntax=docker/dockerfile:1-labs

FROM node as build-stage

RUN mkdir /root/build
WORKDIR /root
COPY package.json .
RUN npm install .

COPY --exclude=.npm --exclude=node_modules . .

RUN bash build.sh

FROM nginx:latest

RUN mkdir -p /etc/nginx/certificate && openssl dhparam -out /etc/nginx/certificate/dhparams.pem 4096
RUN openssl req -new -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -x509 -nodes -days 365 -out /etc/nginx/certificate/frontend_cert.pem -keyout /etc/nginx/certificate/frontend_key.pem -subj "/CN=localhost.edu" -addext "subjectAltName=DNS:localhost.edu,DNS:*.locahost.edu"

COPY --from=build-stage /root/build /usr/share/nginx/html
COPY --from=build-stage /root/webpack.output /root/webpack.out
COPY --from=build-stage /root/proxy/proxy.conf /etc/nginx/conf.d/default.conf