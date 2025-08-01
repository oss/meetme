# syntax=docker/dockerfile:1-labs

FROM node:latest

ARG GIT_HASH
ARG GIT_BRANCH
ENV PROD NO
EXPOSE 8000

WORKDIR /root
COPY install_dependencies.sh .
RUN bash install_dependencies.sh

RUN apt-get update -y
RUN apt-get install jq -y

COPY --exclude=node_modules --exclude=.npm . .
COPY config.json5 /etc/meetme/
COPY ./auth/shibboleth/metadata.xml /etc/meetme/security/shibboleth_metadata.xml

RUN jq -rn --arg hash "$GIT_HASH" \
	   --arg branch "$GIT_BRANCH" \
	   --arg idp_sha "$(sha1sum ./security/idp.pem | cut -f 1 -d ' ')"  \
	   --arg cert_sha "$(sha1sum ./security/cert.pem | cut -f 1 -d ' ')"  \
	   --arg key_sha "$(sha1sum ./security/private/key.pem | cut -f 1 -d ' ')"  \
       '{ "GIT_HASH": $hash, "GIT_BRANCH": $branch, "IDP_SHA": $idp_sha, "CERT_SHA": $cert_sha, "KEY_SHA": $key_sha }' > build.json

CMD ./entrypoint.sh
