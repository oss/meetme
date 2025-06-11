FROM opensearchproject/opensearch:3.0.0

USER root
RUN mkdir /docker-entrypoint.d
USER opensearch

COPY ./create_useragent_pipeline.sh /docker-entrypoint.d/create_useragent_pipeline.sh
COPY ./custom-entrypoint.sh /custom-entrypoint.sh

ENTRYPOINT ["/custom-entrypoint.sh"]