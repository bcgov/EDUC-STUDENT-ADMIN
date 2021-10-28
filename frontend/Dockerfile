FROM docker-remote.artifacts.developer.gov.bc.ca/node:lts-alpine

WORKDIR /opt/app-root/src

COPY package*.json ./
RUN npm ci --cache .npm  --prefer-offline --no-audit
# --no-optional --production

# Build Application
COPY . /opt/app-root/src

EXPOSE 8080 443
RUN npm run build
