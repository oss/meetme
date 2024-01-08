FROM node:16.14.2-bullseye
WORKDIR /root
RUN npm install express express-session mongodb @socket.io/mongo-emitter @socket.io/mongo-adapter mongoose cookie-parser passport@0.5.3 passport-saml body-parser cookie-session socket.io @socket.io/redis-adapter @socket.io/redis-emitter @socket.io/redis-adapter redis node-fetch@2 --save
ENV MONGO_URL="mongodb://mongo:27017/?replicaSet=rs0"
ENV API_URL='https://api.localhost.edu'
ENTRYPOINT ["/bin/bash","docker-entrypoint.sh"]
EXPOSE 3000

COPY docker-entrypoint.sh /usr/local/bin/
COPY . .

CMD node main.js