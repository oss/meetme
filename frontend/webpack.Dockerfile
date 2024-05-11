FROM node:latest
RUN apt-get update -y && apt-get install jq -y
WORKDIR /root
COPY dev-server.sh /root/dev-server.sh
ENTRYPOINT ./dev-server.sh
