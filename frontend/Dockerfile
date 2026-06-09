# Base image
FROM node:24-slim as base

WORKDIR /app
ARG API_URL=https://api.meetme.oss.rutgers.edu
ARG WEBSITE_URL=https://meetme.oss.rutgers.edu

COPY package.json package-lock.json ./
RUN npm ci .

COPY . .
RUN npm run build

# Run npm dev in dev
FROM base as dev

WORKDIR /app
ARG API_URL=https://api.meetme.oss.rutgers.edu
ARG WEBSITE_URL=https://meetme.oss.rutgers.edu

CMD ["npm", "run", "dev"]

# Serve file using nginx in prod
FROM nginx:latest

ENV SITE_URL https://localhost.edu
ENV PROD false

EXPOSE 80
EXPOSE 443

RUN mkdir /logs && touch /logs/api.log 
COPY --from=base /app/build/dist /usr/share/nginx/html
COPY --from=base /app/nginx /etc/nginx/
COPY --from=base entrypoint.sh .

CMD ["entrypoint.sh"]
