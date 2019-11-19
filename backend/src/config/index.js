'use strict';
const nconf = require('nconf');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const env = 'local';//process.env.NODE_ENV;

//injects environment variables into the json file
nconf.overrides({
  environment: env,
  logoutEndpoint: process.env.KC_DOMAIN + '/auth/realms/master/protocol/openid-connect/logout',
  server: {
    frontend: process.env.SERVER_FRONTEND,
    logLevel: 'silent',
    morganFormat: 'dev',
    port: '8080'
  },
  oidc: {
    publicKey: process.env.PUBLIC_KEY,
    clientId: process.env.ID,
    clientSecret: process.env.SECRET,
    discovery: process.env.DISCOVERY
  }
});


nconf.argv()
  .env()
  .file({ file: path.join(__dirname, `${env}.json`) });

nconf.defaults({

});

module.exports = nconf;
