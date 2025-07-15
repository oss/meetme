FROM node:latest

WORKDIR /root
RUN npm install eslint eslint-plugin-react @babel/core @babel/eslint-parser globals eslint-plugin-react-compiler eslint-formatter-junit
COPY . /root
RUN chmod +x /root/docker-entrypoint.sh
ENTRYPOINT ["sh","/root/docker-entrypoint.sh"]
