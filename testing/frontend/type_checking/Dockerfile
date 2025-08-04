FROM registry.redhat.io/rhel9/nodejs-22
WORKDIR /root
RUN npm -g install typescript
ENTRYPOINT ["npx","tsc","-p","/code/tsconfig.json"]
#CMD npx tsc --noEmit -p tsconfig.json
