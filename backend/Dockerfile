FROM node:latest

ARG GIT_HASH
ARG GIT_BRANCH
EXPOSE 8000

WORKDIR /root
COPY install_dependencies.sh .
RUN bash install_dependencies.sh

RUN apt-get update -y
RUN apt-get install jq -y

COPY . .
COPY config.json5 /etc/meetme/
COPY ./auth/shibboleth/metadata.xml /etc/meetme/security/shibboleth_metadata.xml
RUN jq -rn --arg hash $GIT_HASH --arg branch $GIT_BRANCH '{ "GIT_HASH": $hash , "GIT_BRANCH": $branch }' > build.json

CMD ["node","main.js"]