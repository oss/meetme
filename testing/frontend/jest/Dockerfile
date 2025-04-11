FROM node:latest
WORKDIR /root
COPY . ./
RUN npm install jest @testing-library/react @testing-library/dom jest-environment-jsdom source-map --save
COPY docker-entrypoint.sh .
ENTRYPOINT [ "sh","docker-entrypoint.sh" ]
