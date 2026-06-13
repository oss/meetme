FROM node:24-slim

EXPOSE 3000

WORKDIR /app
COPY package*.json .
RUN npm ci --omit=dev && npm cache clean --force
COPY . .

CMD ["node", "run", "start"]
