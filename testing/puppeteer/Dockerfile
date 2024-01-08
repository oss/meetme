FROM node:latest
WORKDIR /root
RUN apt-get update \
 && apt-get install -y chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium
RUN npm install puppeteer
#ENV http_proxy http://host.docker.internal:80
#ENV https_proxy http://host.docker.internal:443

COPY . .