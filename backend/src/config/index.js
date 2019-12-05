'use strict';
const nconf = require('nconf');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const env = process.env.NODE_ENV;

//injects environment variables into the json file
nconf.overrides({
  environment: env,
  logoutEndpoint: process.env.KC_DOMAIN + '/protocol/openid-connect/logout',
  server: {
    frontend: process.env.SERVER_FRONTEND,
    backend: process.env.SERVER_FRONTEND + '/api',
    logLevel: 'silent',
    morganFormat: 'dev',
    port: '8080',
    codeTableURL: process.env.CODETABLE_API_URL,
    penRequestURL: process.env.PEN_REQUEST_API_URL
  },
  oidc: {
    publicKey: process.env.PUBLIC_KEY,
    clientId: process.env.ID,
    clientSecret: process.env.SECRET,
    discovery: process.env.DISCOVERY,
    codetableRead: "READ_CODETABLE_SET",
    penrequestRead: "READ_PEN_REQUEST",
    penrequestWrite: "WRITE_PEN_REQUEST",
    staffRole: "STUDENT_ADMIN"
  }
});


nconf.argv()
  .env()
  .file({ file: path.join(__dirname, `${env}.json`) });

nconf.defaults({

});

module.exports = nconf;
