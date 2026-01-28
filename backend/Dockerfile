# syntax=docker/dockerfile:1-labs

FROM node:latest

ARG GIT_HASH
ARG GIT_BRANCH

ENV GIT_HASH=$GIT_HASH
ENV GIT_BRANCH=$GIT_BRANCH
ENV PROD false

EXPOSE 8000

WORKDIR /root
RUN npm install express mongoose cookie-parser passport body-parser @node-saml/passport-saml cookie-session cjsldap winston keygrip json5 --no-save

COPY --exclude=node_modules --exclude=.npm . .
COPY auth/shibboleth/metadata.xml /etc/meetme/security/shibboleth_metadata.xml

CMD ./entrypoint.sh
