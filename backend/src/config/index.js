'use strict';
const nconf = require('nconf');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const env = process.env.NODE_ENV;

nconf.argv()
  .file({ file: path.join(__dirname, `${env}.json`) });

nconf.defaults({
  environment: env,
  logoutEndpoint: process.env.KC_DOMAIN + '/protocol/openid-connect/logout',
  server: {
    frontend: process.env.SERVER_FRONTEND,
    backend: process.env.SERVER_FRONTEND + '/api',
    logLevel: 'verbose',
    morganFormat: 'dev',
    port: '8080',
    penRequestStatus: process.env.PEN_REQUEST_API_URL + '/statuses',
    penRequestURL: process.env.PEN_REQUEST_API_URL
  },
  oidc: {
    publicKey: process.env.SOAM_PUBLIC_KEY,
    clientId: process.env.ID,
    clientSecret: process.env.SECRET,
    discovery: process.env.DISCOVERY,
    penrequestRead: "READ_PEN_REQUEST",
    penrequestWrite: "WRITE_PEN_REQUEST",
    staffRole: "STUDENT_ADMIN"
  },
  tokenGenerate: {
    privateKey: process.env.UI_PRIVATE_KEY,
    publicKey: process.env.UI_PUBLIC_KEY,
    audience: process.env.SERVER_FRONTEND,
    issuer: process.env.ISSUER
  }
});

module.exports = nconf;
