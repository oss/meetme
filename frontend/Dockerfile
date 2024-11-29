FROM node:latest as build-stage

RUN mkdir /root/build
WORKDIR /root
ARG BUILD
ENV BUILD=${BUILD}
COPY package.json .
RUN npm install .

COPY . .

RUN ./build.sh

FROM nginx:latest

COPY --from=build-stage /root/build /usr/share/nginx/html
COPY --from=build-stage /root/webpack.output /root/webpack.out
COPY --from=build-stage /root/proxy /etc/nginx