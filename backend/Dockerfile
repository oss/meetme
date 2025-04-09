FROM node:latest

ARG GIT_HASH
ARG GIT_BRANCH
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8000 || exit 1

WORKDIR /root
RUN npm install express mongoose cookie-parser passport body-parser @node-saml/passport-saml cookie-session cjsldap winston keygrip json5 --save

RUN apt-get update -y && apt-get install jq -y && jq -rn --arg hash $GIT_HASH --arg branch $GIT_BRANCH '{ "GIT_HASH": $hash , "GIT_BRANCH": $branch }' > build.json

COPY . .
COPY config.json5 /etc/meetme/
CMD ["node","main.js"]