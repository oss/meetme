FROM node:latest

WORKDIR /root
RUN npm install eslint
COPY . .
ENTRYPOINT ["sh","/root/docker-entrypoint.sh"]
