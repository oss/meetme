FROM nginx

RUN mkdir /logs
RUN mkdir -p /etc/nginx/certificate && openssl dhparam -out /etc/nginx/certificate/dhparams.pem 4096
RUN openssl req -new -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -x509 -nodes -days 365 -out /etc/nginx/certificate/backend_cert.pem -keyout /etc/nginx/certificate/backend_key.pem -subj "/CN=api.localhost.edu" -addext "subjectAltName=DNS:api.localhost.edu,DNS:*.api.locahost.edu"
COPY proxy.conf /etc/nginx/conf.d/default.conf
