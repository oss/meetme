FROM quay.io/sclorg/nodejs-22-c9s:latest
RUN mkdir /roo
WORKDIR /root
RUN npm -g install typescript
ENTRYPOINT ["npx","tsc","-p","/code/tsconfig.json"]
#CMD npx tsc --noEmit -p tsconfig.json
