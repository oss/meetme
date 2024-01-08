FROM node:latest
WORKDIR /root
COPY dev-server.sh /root/dev-server.sh
ENTRYPOINT ./dev-server.sh
