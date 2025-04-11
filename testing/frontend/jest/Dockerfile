FROM node:latest
WORKDIR /root
COPY . ./
RUN npm install jest react-test-renderer source-map --save
COPY docker-entrypoint.sh .
ENTRYPOINT [ "sh","docker-entrypoint.sh" ]
