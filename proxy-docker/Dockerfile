FROM haproxy:2.2-alpine

EXPOSE 2375
ENV ALLOW_RESTARTS=1 \
    AUTH=1 \
    BUILD=1 \
    COMMIT=1 \
    CONFIGS=1 \
    CONTAINERS=1 \
    DISTRIBUTION=1 \
    EVENTS=1 \
    EXEC=1 \
    GRPC=1 \
    IMAGES=1 \
    INFO=1 \
    LOG_LEVEL=info \
    NETWORKS=1 \
    NODES=1 \
    PING=1 \
    PLUGINS=1 \
    POST=1 \
    SECRETS=1 \
    SERVICES=1 \
    SESSION=1 \
    SOCKET_PATH=/var/run/docker.sock \
    SWARM=1 \
    SYSTEM=1 \
    TASKS=1 \
    VERSION=1 \
    VOLUMES=1 \
    METRICS=1
COPY haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg