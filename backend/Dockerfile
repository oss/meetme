#So far we dont really need dockerfile, this is here just in case we need it
FROM node:16.14.2-bullseye

ENV MONGO_URL="mongodb://mongo:27017,mongo-jr:27017,mongo-the-third:27017/meetme?replicaSet=rs0"
ARG DEV
ARG GIT_HASH
ARG GIT_BRANCH
ARG LOGIN_URL
ENV GIT_HASH=$GIT_HASH
ENV GIT_BRANCH=$GIT_BRANCH
ENV DEV=$DEV
ENV LOGIN_URL=$LOGIN_URL
EXPOSE 8000

WORKDIR /root
RUN npm install express mongoose cookie-parser passport@0.5.3 body-parser passport-saml cookie-session ldapjs winston --save

COPY . .

RUN mv scripts/* /root
RUN chmod +x *.sh

CMD ["node","main.js"]