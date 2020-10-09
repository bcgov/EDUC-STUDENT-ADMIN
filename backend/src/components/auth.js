'use strict';

const axios = require('axios');
const config = require('../config/index');
const log = require('./logger');
const jsonwebtoken = require('jsonwebtoken');
const qs = require('querystring');
const utils = require('./utils');
const safeStringify = require('fast-safe-stringify');
const userRoles = require('./roles');
const { partial, fromPairs } = require('lodash');
const HttpStatus = require('http-status-codes');
/**
 * Create help functions for authorization: isValidGMPUserToken, isValidGMPUser, isValidGMPAdmin, etc
 * @param {*} roles 
 */
function createRoleHelpers(roles) {
  const userTokenHelpers = Object.entries(roles.User).map(([roleType, roleNames]) => [
    `isValid${roleType}UserToken`, isValidUiToken(isUserHasRoles, roleType, roleNames)
  ]);
  const userHelpers = Object.entries(roles.User).map(([roleType, roleNames]) => [
    `isValid${roleType}User`, isValidUser(isUserHasRoles, roleType, roleNames)
  ]);
  const adminHelpers = Object.entries(roles.Admin).map(([roleType, roleName]) => [
    `isValid${roleType}Admin`, isValidUiToken(isUserHasAdminRole, roleType, roleName)
  ]);
  // create object { isValidGMPUser: ture, isValidUMPUser: true, isValidStudentSearchUser: false, ...}
  const isValidUsers = (req) => fromPairs(userHelpers.map(([roleType, verifyRole]) => [roleType, verifyRole(req)]));
  return ({...fromPairs([...userTokenHelpers, ...userHelpers, ...adminHelpers]), isValidUsers });
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
  return function checkValidUserToken(req, res, next) {
    try {
      const jwtToken = utils.getBackendToken(req);
      if (!jwtToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Unauthorized user'
        });
      }
      const userToken = jsonwebtoken.verify(jwtToken, config.get('oidc:publicKey'));
      if (userToken['realm_access'] && userToken['realm_access'].roles
        && isUserHasRole(roleType, roleNames, userToken['realm_access'].roles)) {
        return next();
      }
      return res.status(HttpStatus.FORBIDDEN).json({
        message: 'user is missing role'
      });
    } catch (e) {
      log.error(e);
      return res.status(500);
    }
  };
}

function isValidUser(isUserHasRole, roleType, roleNames) {
  return function isValidUserHandler(req) {
    try {
      const thisSession = req['session'];
      if (thisSession && thisSession['passport'] && thisSession['passport'].user && thisSession['passport'].user.jwt) {
        const userToken = jsonwebtoken.verify(thisSession['passport'].user.jwt, config.get('oidc:publicKey'));
        log.silly(`userToken is ${safeStringify(userToken)}`);
        if (userToken && userToken.realm_access && userToken.realm_access.roles
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

const auth = {
  // Check if JWT Access Token has expired
  isTokenExpired(token) {
    const now = Date.now().valueOf() / 1000;
    const payload = jsonwebtoken.decode(token);

    return (!!payload['exp'] && payload['exp'] < now);
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
      const discovery = await utils.getOidcDiscovery();
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
      if (!!req.user && !!req.user.jwt) {
        log.verbose('refreshJWT', 'User & JWT exists');

        if (auth.isTokenExpired(req.user.jwt)) {
          log.verbose('refreshJWT', 'JWT has expired');

          if (!!req.user.refreshToken && auth.isRenewable(req.user.refreshToken)) {
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
      expiresIn: config.get('tokenGenerate:expiresIn') || '30m' ,
      algorithm: 'RS256'
    };

    const privateKey = config.get('tokenGenerate:privateKey');
    const uiToken = jsonwebtoken.sign({}, privateKey, signOptions);
    log.verbose('Generated JWT', uiToken);
    return uiToken;
  },
  isValidUiTokenWithRoles: partial(isValidUiToken, isUserHasRoles),
  isValidUserWithRoles: partial(isValidUser, isUserHasRoles),
  ...createRoleHelpers(userRoles)
};

module.exports = auth;
