FROM nginx:latest

EXPOSE 80
EXPOSE 443
RUN apt-get -y update && apt-get -y upgrade && apt-get install -y dnsutils
RUN mkdir -p /etc/nginx/certificate && openssl dhparam -out /etc/nginx/certificate/dhparams.pem 4096
RUN mkdir /logs && touch /logs/api.log 

COPY config.sh /docker-entrypoint.d
RUN chmod +x /docker-entrypoint.d/*.sh
COPY nginx /etc/nginx

#RUN ln -sf /dev/stdout /var/log/nginx/access.log && ln -sf /dev/stderr /var/log/nginx/error.log
#RUN ./config.sh
#CMD ["bash"]
#CMD ./docker-entrypoint.sh