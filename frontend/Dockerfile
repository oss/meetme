FROM node:24-slim

# EXPOSE 5173

WORKDIR /app
COPY package*.json .
RUN npm ci && npm cache clean --force
COPY . .

CMD ["npm", "run", "dev"]
