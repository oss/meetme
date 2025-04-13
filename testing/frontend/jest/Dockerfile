# syntax=docker/dockerfile:1.7-labs
FROM node:latest
WORKDIR /root
COPY package.json .
COPY docker-entrypoint.sh .

RUN npm install jest @testing-library/react @testing-library/dom jest-environment-jsdom source-map --save

COPY --exclude=package.json . .

ENTRYPOINT [ "sh","docker-entrypoint.sh" ]
