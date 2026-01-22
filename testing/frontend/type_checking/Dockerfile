FROM node:latest

RUN useradd -ms /bin/bash user
USER user
WORKDIR /home/user

RUN npm -g install typescript
ENTRYPOINT ["npx", "tsc", "-p", "/code/tsconfig.json"]
#CMD npx tsc --noEmit -p tsconfig.json
