FROM registry.hub.docker.com/node:lts-alpine

RUN mkdir -p /logs
RUN chmod 755 /logs

WORKDIR /opt/app-root/src

RUN ln -s /logs .
COPY package*.json ./
RUN npm ci

COPY . /opt/app-root/src
RUN npm run build
EXPOSE 443 8080
CMD ["npm", "start"]
