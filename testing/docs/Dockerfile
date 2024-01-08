FROM node:latest
WORKDIR /root
RUN npm install madge
RUN apt-get update -y && apt-get install jq moreutils -y
COPY . .
CMD [ "bash","verify_updated_docs.sh" ]