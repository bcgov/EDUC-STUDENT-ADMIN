FROM artifacts.developer.gov.bc.ca/docker-remote/node:16.17.1-alpine

WORKDIR /opt/app-root/src

COPY package*.json ./
RUN npm install -g npm@8.1.2
RUN npm ci --cache .npm  --prefer-offline --no-audit
# --no-optional --production

# Build Application
COPY . /opt/app-root/src

EXPOSE 8080 443
RUN npm run build
