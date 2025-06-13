FROM golang:latest as build-stage
WORKDIR /go
RUN git clone -b release-0.34.0 https://github.com/percona/mongodb_exporter.git
WORKDIR /go/mongodb_exporter
RUN make build

FROM mongo:latest

RUN apt-get update -y && apt-get install socat -y
WORKDIR /root
COPY scripts/*.sh .
COPY --from=build-stage /go/mongodb_exporter/mongodb_exporter /root/mongodb_exporter
RUN mkdir -p /var/run/external && chmod +x mongodb_exporter *.sh

ENTRYPOINT [ "./docker-entrypoint.sh" ]