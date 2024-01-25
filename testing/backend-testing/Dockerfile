FROM debian:11

WORKDIR /root
RUN apt-get update && apt-get install curl wget jq git -y
ENV API_URL 'https://api.localhost.edu'
RUN git clone https://github.com/bats-core/bats-core.git && cd bats-core && ./install.sh /usr/local && cd /root
RUN git clone https://github.com/bats-core/bats-support.git test/test_helper/bats-support
RUN git clone https://github.com/bats-core/bats-assert.git test/test_helper/bats-assert
COPY ./scripts scripts
RUN ls && ./scripts/install_mongosh.sh
COPY ./lib test/test_helper/lib
COPY . .
RUN touch /root/env
ENTRYPOINT ./docker-entrypoint.sh --formatter tap