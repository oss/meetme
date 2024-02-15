FROM golang:latest as build-mongotools
WORKDIR /mongotools
RUN git clone https://github.com/mongodb/mongo-tools /mongotools
RUN for tool in bsondump mongodump mongoexport mongofiles mongoimport mongorestore mongostat mongotop; do CI=1 CGO_ENABLED=0 go build -o bin/${tool} ${tool}/main/${tool}.go; done

FROM debian:11
COPY --from=build-mongotools /mongotools/bin /usr/local/bin
WORKDIR /root
RUN mkdir /templates
RUN apt-get update && apt-get install -y curl wget jq git ldap-utils  chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 ca-certificates

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium

ENV API_URL 'https://api.localhost.edu'
RUN git clone https://github.com/bats-core/bats-core.git && cd bats-core && ./install.sh /usr/local && cd /root
RUN git clone https://github.com/bats-core/bats-support.git test/test_helper/bats-support
RUN git clone https://github.com/bats-core/bats-assert.git test/test_helper/bats-assert
COPY ./scripts/install_mongosh.sh scripts/install_mongosh.sh
RUN ./scripts/install_mongosh.sh

RUN git clone https://github.com/nvm-sh/nvm.git '/usr/local/nvm'

RUN bash -i -c 'source /usr/local/nvm/nvm.sh && nvm install node && nvm use node && npm install puppeteer keygrip && ln -s /usr/local/nvm/versions/node/$(nvm current)/bin/* /usr/local/bin'
COPY ./lib test/test_helper/lib
COPY . .
ENTRYPOINT . /usr/local/nvm/nvm.sh && ./docker-entrypoint.sh --formatter tap