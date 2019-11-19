FROM node:lts-alpine

WORKDIR /opt/app-root/src

COPY package*.json ./
RUN npm ci

COPY . /opt/app-root/src
RUN npm run build
EXPOSE 443 8080
CMD ["npm", "start"]