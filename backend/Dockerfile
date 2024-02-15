#So far we dont really need dockerfile, this is here just in case we need it
FROM node:latest

ENV MONGO_URL="mongodb://mongo:27017,mongo-jr:27017,mongo-the-third:27017/meetme?replicaSet=rs0"
ARG DEV
ARG GIT_HASH
ARG GIT_BRANCH
ARG LOGIN_URL
ENV GIT_HASH=$GIT_HASH
ENV GIT_BRANCH=$GIT_BRANCH
ENV DEV=$DEV
ENV LOGIN_URL=$LOGIN_URL
ENV COOKIE_DURATION=2
EXPOSE 8000

WORKDIR /root
RUN npm install express mongoose cookie-parser passport body-parser @node-saml/passport-saml cookie-session ldapjs winston --save

COPY . .
CMD ["node","main.js"]