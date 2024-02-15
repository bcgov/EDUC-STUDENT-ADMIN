FROM artifacts.developer.gov.bc.ca/docker-remote/node:18.16.0-alpine3.18

RUN mkdir -p /logs
RUN chmod 755 /logs

WORKDIR /opt/app-root/src
RUN ln -s /logs .

COPY package*.json ./
RUN npm ci

COPY . /opt/app-root/src
EXPOSE 443 8080
CMD ["node", "--max-old-space-size=150", "./src/server.js"]
