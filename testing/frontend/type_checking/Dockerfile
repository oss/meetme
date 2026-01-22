FROM nodejs:22

USER user
WORKDIR /root
RUN npm -g install typescript
ENTRYPOINT ["npx", "tsc", "-p", "/code/tsconfig.json"]
#CMD npx tsc --noEmit -p tsconfig.json
