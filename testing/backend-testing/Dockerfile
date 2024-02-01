FROM golang:latest as build-mongotools
WORKDIR /mongotools
RUN git clone https://github.com/mongodb/mongo-tools /mongotools
RUN for tool in bsondump mongodump mongoexport mongofiles mongoimport mongorestore mongostat mongotop; do CI=1 CGO_ENABLED=0 go build -o bin/${tool} ${tool}/main/${tool}.go; done

FROM debian:11
COPY --from=build-mongotools /mongotools/bin /usr/local/bin
WORKDIR /root
RUN mkdir /templates
RUN apt-get update && apt-get install curl wget jq git -y
ENV API_URL 'https://api.localhost.edu'
RUN git clone https://github.com/bats-core/bats-core.git && cd bats-core && ./install.sh /usr/local && cd /root
RUN git clone https://github.com/bats-core/bats-support.git test/test_helper/bats-support
RUN git clone https://github.com/bats-core/bats-assert.git test/test_helper/bats-assert
COPY ./scripts scripts
RUN ./scripts/install_mongosh.sh
COPY ./lib test/test_helper/lib
COPY . .
RUN touch /root/env
ENTRYPOINT ./docker-entrypoint.sh --formatter tap