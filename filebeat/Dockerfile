FROM fluent/fluent-bit
#COPY --chown=root:filebeat filebeat.yml /usr/share/filebeat/filebeat.yml
#COPY fluent_bit.conf /fluent-bit/etc/fluent-bit.conf
COPY ./geoip /geoip
COPY certs/cert.* /etc/pki/client/
COPY certs/ca.pem /etc/pki/root/ca.pem
COPY ./parsers.conf /fluent-bit/etc/parsers.conf
COPY ./configs /fluent-bit/etc/configs
COPY ./fluent_bit.conf /fluent-bit/etc/fluent-bit.conf
#CMD "--config /fluent-bit/etc/fluent-bit.conf"