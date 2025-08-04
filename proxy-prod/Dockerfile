FROM nginx:latest

EXPOSE 80
ENV PROD_URL https://localhost.edu

RUN mkdir /logs && touch /logs/api.log
COPY nginx /etc/nginx
COPY entrypoint.sh .

CMD ./entrypoint.sh
