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
  siteMinder_logout_endpoint: process.env.SITEMINDER_LOGOUT_ENDPOINT,
  server: {
    frontend: process.env.SERVER_FRONTEND,
    backend: process.env.SERVER_FRONTEND + '/api',
    logLevel: process.env.LOG_LEVEL,
    morganFormat: 'dev',
    port: '8080',
    penRequest: {
      statusCodeURL: process.env.PEN_REQUEST_API_URL + '/statuses',
      documentTypeCodesURL: process.env.PEN_REQUEST_API_URL + '/document-types',
      rootURL: process.env.PEN_REQUEST_API_URL,
      macrosURL: process.env.PEN_REQUEST_API_URL + '/pen-request-macro',
    },
    studentRequest: {
      statusCodeURL: process.env.STUDENT_PROFILE_API_URL + '/statuses',
      documentTypeCodesURL: process.env.STUDENT_PROFILE_API_URL + '/document-types',
      rootURL: process.env.STUDENT_PROFILE_API_URL,
      macrosURL: process.env.STUDENT_PROFILE_API_URL + '/student-profile-macro',
    },
    demographicsURL: process.env.PEN_DEMOGRAPHICS_URL,
    digitalIdURL: process.env.DIGITAL_ID_URL,
    digitalIdIdentityTypeCodesURL: process.env.DIGITAL_ID_URL + '/identityTypeCodes',
    studentURL: process.env.STUDENT_API_URL,
    studentGenderCodesURL: process.env.STUDENT_API_URL + '/gender-codes',
    penEmails: process.env.PEN_REQUEST_EMAIL_API_URL,
  },
  oidc: {
    publicKey: process.env.SOAM_PUBLIC_KEY,
    clientId: process.env.ID,
    clientSecret: process.env.SECRET,
    discovery: process.env.DISCOVERY,
    staffRole: 'STUDENT_ADMIN',
    rolesAllowed: ['STUDENT_ADMIN','STUDENT_ADMIN_READ_ONLY']
  },
  tokenGenerate: {
    privateKey: process.env.UI_PRIVATE_KEY,
    publicKey: process.env.UI_PUBLIC_KEY,
    audience: process.env.SERVER_FRONTEND,
    issuer: process.env.ISSUER
  },
  redis:{
    host:process.env.REDIS_HOST,
    port:process.env.REDIS_PORT,
    password:process.env.REDIS_PASSWORD
  }
});

module.exports = nconf;
