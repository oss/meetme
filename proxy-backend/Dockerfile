FROM nginx

EXPOSE 80
ENV PROD_URL https://localhost.edu

RUN mkdir /logs
COPY nginx /etc/nginx
COPY entrypoint.sh .

CMD ./entrypoint.sh
