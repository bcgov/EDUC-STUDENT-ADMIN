'use strict';

const axios = require('axios');
const config = require('../config/index');
const log = require('./logger');
const jsonwebtoken = require('jsonwebtoken');
const qs = require('querystring');
const safeStringify = require('fast-safe-stringify');
const userRoles = require('./roles');
const {partial, fromPairs} = require('lodash');
const HttpStatus = require('http-status-codes');
const {pick} = require('lodash');
const {ApiError} = require('./error');
let discovery = null;
let serviceToken = null;

/**
 * Create help functions for authorization: isValidGMPUserToken, isValidGMPUser, isValidGMPAdmin, etc
 * @param {*} roles
 */
function createRoleHelpers(roles) {
  const userTokenHelpers = Object.entries(roles.User).map(([roleType, roleNames]) => [
    `isValid${roleType}UserToken`, isValidUiToken(isUserHasRoles, roleType, roleNames)
  ]);
  // userHelpers is called to generate object { isValidGMPUser: ture, isValidUMPUser: true, isValidStudentSearchUser: false, ...} which will be passed to the frontend.
  const userHelpers = Object.entries(roles.User).map(([roleType, roleNames]) => [
    `isValid${roleType}User`, isValidUser(isUserHasRoles, roleType, roleNames)
  ]);
  const adminHelpers = Object.entries(roles.Admin).map(([roleType, roleName]) => [
    `isValid${roleType}Admin`, isValidUiToken(isUserHasAdminRole, roleType, roleName)
  ]);
  const adminHelpersFE = Object.entries(roles.Admin).map(([roleType, roleName]) => [
    `isValid${roleType}Admin`, isValidUser(isUserHasAdminRole, roleType, roleName)
  ]);
  // create object { isValidGMPUser: ture, isValidUMPUser: true, isValidStudentSearchUser: false, ...}
  const isValidUsers = (req) => fromPairs(userHelpers.map(([roleType, verifyRole]) => [roleType, verifyRole(req)]));
  const isValidAdminUsers = (req) => fromPairs(adminHelpersFE.map(([roleType, verifyRole]) => [roleType, verifyRole(req)]));
  return ({...fromPairs([...userTokenHelpers, ...userHelpers, ...adminHelpers]), isValidUsers, isValidAdminUsers});
}

function isUserHasAdminRole(roleType, roleName, roles) {
  const adminRole = roleName || '';
  log.silly(`valid ${roleType} from environment variable is ${adminRole}`);
  return !!(Array.isArray(roles) && roles.includes(adminRole));
}

function isUserHasRoles(roleType, roleNames, roles) {
  const validRoles = roleNames || [];
  log.silly(`valid ${roleType} Roles from environment variable are ${safeStringify(validRoles)}`);
  const isValidUserRole = (element) => Array.isArray(validRoles) ? validRoles.includes(element) : false;
  return !!(Array.isArray(roles) && roles.some(isValidUserRole));
}

function isValidUiToken(isUserHasRole, roleType, roleNames) {
  return async function checkValidUserToken(req, res, next) {
    try {
      const jwtToken = auth.getBackendUserToken(req);
      if (!jwtToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Unauthorized user'
        });
      }
      let userToken;
      try {
        userToken = jsonwebtoken.verify(jwtToken, config.get('oidc:publicKey'));
      } catch (e) {
        log.debug('error is from verify', e);
        return res.status(HttpStatus.UNAUTHORIZED).json();
      }
      if (userToken?.realm_access?.roles
        && isUserHasRole(roleType, roleNames, userToken.realm_access.roles)) {
        return next();
      }
      return res.status(HttpStatus.FORBIDDEN).json({
        message: 'user is missing role'
      });
    } catch (e) {
      log.error(e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json();
    }

  };
}

function isValidUser(isUserHasRole, roleType, roleNames) {
  return function isValidUserHandler(req) {
    try {
      const thisSession = req['session'];
      if (thisSession?.passport?.user?.jwt) {
        const userToken = jsonwebtoken.verify(thisSession.passport.user.jwt, config.get('oidc:publicKey'));
        log.silly(`userToken is ${safeStringify(userToken)}`);
        if (userToken?.realm_access?.roles
          && (isUserHasRole(roleType, roleNames, userToken.realm_access.roles))) {
          return true;
        }
      }
      return false;
    } catch (e) {
      log.error(e);
      return false;
    }
  };
}

function isValidLoggedInUser(req, res, next) {
  try {
    const jwtToken = auth.getBackendUserToken(req);
    if (!jwtToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Unauthorized user'
      });
    }
    try {
      jsonwebtoken.verify(jwtToken, config.get('oidc:publicKey'));
    } catch (e) {
      log.debug('Error is from verify', e);
      return res.status(HttpStatus.UNAUTHORIZED).json();
    }
    return next();
  } catch (e) {
    log.error(e);
    return res.status(HttpStatus.UNAUTHORIZED).json();
  }
}

const auth = {
  // Check if JWT Access Token has expired
  // logic to add 30 seconds to the check is to avoid edge case when the token is valid here
  // but expires just before the api call due to ms time difference, so if token is expiring within next 30 seconds, refresh it.
  isTokenExpired(token) {
    const now = Date.now().valueOf() / 1000;
    const payload = jsonwebtoken.decode(token);

    return (!!payload['exp'] && payload['exp'] < (now + 30)); // Add 30 seconds to make sure , edge case is avoided and token is refreshed.
  },
  async getBackendServiceToken() {
    if(serviceToken){
      if (auth.isTokenExpired(serviceToken)) {
        log.info('Service token is expired, fetching new service client token');
        serviceToken = await auth.getServiceAccountToken();
      }
    }else{
      log.info('Service token not found, fetching new service client token');
      serviceToken = await auth.getServiceAccountToken();
    }
    return serviceToken;
  },

  getBackendUserToken(req){
    const thisSession = req.session;
    return thisSession?.passport?.user?.jwt;
  },

  // Check if JWT Refresh Token has expired
  isRenewable(token) {
    const now = Date.now().valueOf() / 1000;
    const payload = jsonwebtoken.decode(token);

    // Check if expiration exists, or lacks expiration
    return (typeof (payload['exp']) !== 'undefined' && payload['exp'] !== null &&
      payload['exp'] === 0 || payload['exp'] > now);
  },

  // Get new JWT and Refresh tokens
  async renew(refreshToken) {
    let result = {};

    try {
      const discovery = await auth.getOidcDiscovery();
      const response = await axios.post(discovery.token_endpoint,
        qs.stringify({
          client_id: config.get('oidc:clientId'),
          client_secret: config.get('oidc:clientSecret'),
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          scope: discovery.scopes_supported
        }), {
          headers: {
            Accept: 'application/json',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }
      );
      result.jwt = response.data.access_token;
      result.refreshToken = response.data.refresh_token;
    } catch (error) {
      log.error('renew', error.message);
      result = error.response.data;
    }

    return result;
  },

  // Update or remove token based on JWT and user state
  async refreshJWT(req, _res, next) {
    try {
      if (req?.user?.jwt) {
        log.verbose('refreshJWT', 'User & JWT exists');

        if (auth.isTokenExpired(req.user.jwt)) {
          log.verbose('refreshJWT', 'JWT has expired');

          if (req?.user?.refreshToken && auth.isRenewable(req.user.refreshToken)) {
            log.verbose('refreshJWT', 'Can refresh JWT token');
            // Get new JWT and Refresh Tokens and update the request
            const result = await auth.renew(req.user.refreshToken);
            req.user.jwt = result.jwt; // eslint-disable-line require-atomic-updates
            req.user.refreshToken = result.refreshToken; // eslint-disable-line require-atomic-updates
          } else {
            log.verbose('refreshJWT', 'Cannot refresh JWT token');
            delete req.user;
          }
        }
      } else {
        log.verbose('refreshJWT', 'No existing User or JWT');
        delete req.user;
      }
    } catch (error) {
      log.error('refreshJWT', error.message);
    }
    next();
  },

  generateUiToken() {
    const i = config.get('tokenGenerate:issuer');
    const s = 'user@penrequest.ca';
    const a = config.get('tokenGenerate:audience');
    const signOptions = {
      issuer: i,
      subject: s,
      audience: a,
      expiresIn: config.get('tokenGenerate:expiresIn') || '30m',
      algorithm: 'RS256'
    };

    const privateKey = config.get('tokenGenerate:privateKey');
    const uiToken = jsonwebtoken.sign({}, privateKey, signOptions, null);
    log.verbose('Generated JWT', uiToken);
    return uiToken;
  },
  isValidUiTokenWithRoles: partial(isValidUiToken, isUserHasRoles),
  isValidUserWithRoles: partial(isValidUser, isUserHasRoles),
  ...createRoleHelpers(userRoles),
  isLoggedInUser: isValidLoggedInUser,

  async getApiCredentials() {
    try {
      const discovery = await auth.getOidcDiscovery();
      const response = await axios.post(discovery.token_endpoint,
        qs.stringify({
          client_id: config.get('oidc:clientId'),
          client_secret: config.get('oidc:clientSecret'),
          grant_type: 'client_credentials',
          scope: discovery.scopes_supported
        }), {
          headers: {
            Accept: 'application/json',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }
      );

      log.verbose('getApiCredentials Res', safeStringify(response.data));

      let result = {};
      result.accessToken = response.data.access_token;
      result.refreshToken = response.data.refresh_token;
      return result;
    } catch (error) {
      log.error('getApiCredentials Error', error.response ? pick(error.response, ['status', 'statusText', 'data']) : error.message);
      const status = error.response ? error.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new ApiError(status, {message: 'Get getApiCredentials error'}, error);
    }
  },

  async getServiceAccountToken() {
    try {
      const discovery = await auth.getOidcDiscovery();
      const response = await axios.post(discovery.token_endpoint,
        qs.stringify({
          client_id: config.get('oidc:serviceClientId'),
          client_secret: config.get('oidc:serviceClientSecret'),
          grant_type: 'client_credentials',
        }), {
          headers: {
            Accept: 'application/json',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }
      );


      log.verbose('getServiceAccountToken Res', safeStringify(response.data));

      let result = {};
      result.accessToken = response.data.access_token;
      return result.accessToken;
    } catch (error) {
      log.error('getServiceAccountToken Error', error.response ? pick(error.response, ['status', 'statusText', 'data']) : error.message);
      const status = error.response ? error.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new ApiError(status, {message: 'Get getServiceAccountToken error'}, error);
    }
  },
  // Returns OIDC Discovery values
  async getOidcDiscovery() {
    if (!discovery) {
      try {
        const response = await axios.get(config.get('oidc:discovery'));
        discovery = response.data;
      } catch (error) {
        log.error('getOidcDiscovery', `OIDC Discovery failed - ${error.message}`);
      }
    }
    return discovery;
  },
};

module.exports = auth;
