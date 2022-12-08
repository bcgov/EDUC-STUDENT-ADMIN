FROM artifacts.developer.gov.bc.ca/docker-remote/node:14.20.1 as build-stage
WORKDIR /frontend
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM artifacts.developer.gov.bc.ca/docker-remote/caddy:2.4.6-alpine as caddy-stage

EXPOSE 2015
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build-stage /frontend/dist /srv
