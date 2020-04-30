FROM node:lts-alpine

RUN apk add --no-cache iproute2

WORKDIR /opt/app-root/src

COPY package*.json ./
RUN npm ci
# --no-optional --production

# Build Application
COPY . /opt/app-root/src

EXPOSE 8080 443
RUN npm run build