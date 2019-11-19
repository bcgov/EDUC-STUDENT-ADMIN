FROM node:lts-alpine

WORKDIR /opt/app-root/src

COPY package*.json ./
RUN npm ci
# --no-optional --production

# Build Application
COPY . /opt/app-root/src

EXPOSE 8080 443
RUN npm run build