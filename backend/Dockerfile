FROM node:latest

ARG GIT_HASH
ARG GIT_BRANCH
EXPOSE 8000

WORKDIR /root
RUN npm install express mongoose cookie-parser passport body-parser @node-saml/passport-saml cookie-session cjsldap winston keygrip json5 --save

RUN echo $GIT_HASH
RUN echo $GIT_BRANCH

COPY . .
COPY config.json5 /etc/meetme/
CMD ["node","main.js"]