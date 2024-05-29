FROM node:latest
WORKDIR /root
RUN npm install madge
COPY install_yq.sh .
RUN ./install_yq.sh
RUN apt-get update -y && apt-get install jq moreutils -y
COPY . .
CMD [ "bash","verify_updated_docs.sh" ]