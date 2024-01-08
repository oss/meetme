FROM node:latest
WORKDIR /root
RUN npm -g install typescript
COPY . .
CMD npx tsc --noEmit -p tsconfig.json