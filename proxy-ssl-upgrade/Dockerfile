FROM nginx:latest

ENV SITE_URL https://localhost.edu
ENV PROD false

EXPOSE 80
EXPOSE 443

RUN mkdir /logs && touch /logs/api.log 
COPY . .

CMD ./entrypoint.sh
