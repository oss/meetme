FROM nginx:latest

EXPOSE 80
EXPOSE 443
RUN apt-get -y update && apt-get -y upgrade && apt-get install -y dnsutils
RUN mkdir /logs && touch /logs/api.log 

COPY nginx /etc/nginx

#RUN ln -sf /dev/stdout /var/log/nginx/access.log && ln -sf /dev/stderr /var/log/nginx/error.log
#RUN ./config.sh
#CMD ["bash"]
#CMD ./docker-entrypoint.sh