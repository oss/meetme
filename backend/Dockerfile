FROM node:latest

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
RUN npm install express mongoose cookie-parser passport body-parser @node-saml/passport-saml cookie-session ldapjs winston keygrip --save

COPY <<EOF build.json
{
    "GIT_HASH": "$GIT_HASH",
    "GIT_BRANCH": "$GIT_BRANCH"
}
EOF

COPY <<EOF build.json
{
    "GIT_HASH": "$GIT_HASH",
    "GIT_BRANCH": "$GIT_BRANCH"
}
EOF

COPY . .
CMD ["node","main.js"]