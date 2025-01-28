'use strict';

const config = require('../config/index');
const passport = require('passport');
const express = require('express');
const auth = require('../components/auth');
const jsonwebtoken = require('jsonwebtoken');
const roles = require('../components/roles');
const log = require('../components/logger');
const HttpStatus = require('http-status-codes');
const redis = require('../util/redis/redis-client');
const {v4: uuidv4, validate} = require('uuid');
const permUtils = require('../components/permissionUtils');
const {
  body,
  validationResult
} = require('express-validator');
const UnauthorizedRsp = {
  error: 'Unauthorized',
  error_description: 'Not logged in'
};

const isValidStaffUserWithRoles = auth.isValidUserWithRoles('GMP & UMP & PenRequestBatch & StudentSearch & StaffAdministration & NominalRoll & NominalRollReadOnly & GUMPAnalytics & PenRequestBatchAnalytics', [...roles.User.GMP, ...roles.User.UMP, ...roles.User.PenRequestBatch, ...roles.User.StudentSearch, ...roles.User.StaffAdministration, ...roles.User.NominalRoll , ...roles.User.NominalRollReadOnly, ...roles.User.GUMPAnalytics, ...roles.User.PenRequestBatchAnalytics]);
const isValidWebSocketUserWithRoles = auth.isValidUserWithRoles('GMP & UMP & PenRequestBatch', [...roles.User.GMP, ...roles.User.UMP, ...roles.User.PenRequestBatch]);

const router = express.Router();

//provides a callback location for the auth service
router.get('/callback',
  passport.authenticate('oidc', {
    failureRedirect: 'error',
  }),
  (_req, res) => {
    res.redirect(config.get('server:frontend'));
  }
);

//a prettier way to handle errors
router.get('/error', (_req, res) => {
  res.status(401).json({
    message: 'Error: Unable to authenticate'
  });
});

//redirects to the SSO login screen
router.get('/login', passport.authenticate('oidc', {
  scope: ['openid', 'profile'],
  failureRedirect: 'error'
}));

router.get('/silent_idir_login', async function (req, res, next) {
  const client = redis.getRedisClient();

  if(!req.query.idir_guid){
    res.status(401).json(UnauthorizedRsp);
  }
  let idir_guid = req.query.idir_guid;
  if(req.query.schoolSearch){
    await client.set(idir_guid + '::schoolSearch', true, {EX: 1800});
  }else if(req.query.schoolDetails && req.query.schoolID){
    let schoolID = req.query.schoolID;
    if (!validate(schoolID)) {
      res.status(401).json(UnauthorizedRsp);
    }
    await client.set(idir_guid + '::schoolDetails', true, {EX: 1800});
    await client.set(idir_guid + '::schoolID', schoolID, {EX: 1800});
  }else{
    res.status(401).json(UnauthorizedRsp);
  }

  const authenticator = passport.authenticate('oidcIDIRSilent', { failureRedirect: 'error', scope: 'openid profile' });
  authenticator(req, res, next);
});


router.get(
  '/callback_idir_silent',
  passport.authenticate('oidcIDIRSilent', { failureRedirect: 'error', scope: 'openid profile' }),
  async (req, res) => {
    if(!req.session?.passport?.user?.username){
      await res.redirect(config.get('server:frontend') + '/unauthorized');
      return;
    }
    let idir_guid = req.session.passport.user.username;
    const client = redis.getRedisClient();
    let schoolSearch = await client.get(idir_guid + '::schoolSearch');
    let schoolDetails = await client.get(idir_guid + '::schoolDetails');
    let schoolID = await client.get(idir_guid + '::schoolID');

    await client.del(idir_guid + '::schoolSearch');
    await client.del(idir_guid + '::schoolDetails');
    await client.del(idir_guid + '::schoolID');

    if(schoolSearch){
      res.redirect(config.get('server:frontend') + '/institute/school' );
    }else if(schoolDetails){
      res.redirect(config.get('server:frontend') + '/institute/school/' + schoolID + '/details' );
    }

    res.status(401).json(UnauthorizedRsp);
  },
);

//removes tokens and destroys session
router.get('/logout', async (req, res, next) => {
  let primaryURL = config.get('logoutEndpoint') + '?post_logout_redirect_uri=' + config.get('server:frontend');
  let idToken = req?.session?.passport?.user?.idToken;
  if (idToken) {
    req.logout(function(err) {
      if (err) {
        return next(err);
      }
      req.session.destroy();
      let retUrl;
      if (req.query && req.query.sessionExpired) {
        retUrl = encodeURIComponent(primaryURL + '/session-expired' + '&id_token_hint=' + idToken);
      } else {
        retUrl = encodeURIComponent(primaryURL + '/logout' + '&id_token_hint=' + idToken);
      }
      res.redirect(config.get('siteMinder_logout_endpoint') + retUrl);
    });
  }else {
    let retUrl;
    if (req.query && req.query.sessionExpired) {
      retUrl = encodeURIComponent(primaryURL + '/session-expired' + '&client_id=' + config.get('oidc:clientId'));
    } else {
      retUrl = encodeURIComponent(primaryURL + '/logout' + '&client_id=' + config.get('oidc:clientId'));
    }
    res.redirect(config.get('siteMinder_logout_endpoint') + retUrl);
  }
});

async function generateTokens(req, res) {
  const newTokens = await auth.renew(req['user'].refreshToken);
  if (newTokens && newTokens.jwt && newTokens.refreshToken) {
    req['user'].jwt = newTokens.jwt;
    req['user'].refreshToken = newTokens.refreshToken;
    req['user'].jwtFrontend = auth.generateUiToken();
    const isAuthorizedUser = isValidStaffUserWithRoles(req);
    const isValidUsers = auth.isValidUsers(req);
    const isValidAdminUsers = auth.isValidAdminUsers(req);
    const isAuthorizedWebsocketUser = isValidWebSocketUserWithRoles(req);
    const checkUserPermissions = permUtils.isAuthorized(req);
    const responseJson = {
      jwtFrontend: req.user.jwtFrontend,
      isAuthorizedUser: isAuthorizedUser || checkUserPermissions,
      ...isValidUsers,
      ...isValidAdminUsers,
      isAuthorizedWebsocketUser: isAuthorizedWebsocketUser || checkUserPermissions
    };
    return res.status(HttpStatus.OK).json(responseJson);
  } else {
    res.status(HttpStatus.UNAUTHORIZED).json();
  }
}

//refreshes jwt on refresh if refreshToken is valid
router.post('/refresh', [
  body('refreshToken').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      errors: errors.array()
    });
  }
  if (!req['user'] || !req['user'].refreshToken || !req?.user?.jwt) {
    res.status(HttpStatus.UNAUTHORIZED).json();
  } else {
    if (auth.isTokenExpired(req.user.jwt)) {
      if (req?.user?.refreshToken && auth.isRenewable(req.user.refreshToken)) {
        return generateTokens(req, res);
      } else {
        res.status(HttpStatus.UNAUTHORIZED).json();
      }
    } else {
      const isAuthorizedUser = isValidStaffUserWithRoles(req);
      const isValidUsers = auth.isValidUsers(req);
      const isValidAdminUsers = auth.isValidAdminUsers(req);
      const isAuthorizedWebsocketUser = isValidWebSocketUserWithRoles(req);
      const checkUserPermissions = permUtils.isAuthorized(req);
      const responseJson = {
        jwtFrontend: req.user.jwtFrontend,
        isAuthorizedUser: isAuthorizedUser || checkUserPermissions,
        ...isValidUsers,
        ...isValidAdminUsers,
        isAuthorizedWebsocketUser: isAuthorizedWebsocketUser || checkUserPermissions
      };
      return res.status(HttpStatus.OK).json(responseJson);
    }
  }

});

//provides a jwt to authenticated users
router.get('/token', auth.refreshJWT, (req, res) => {
  const isAuthorizedUser = isValidStaffUserWithRoles(req);
  const isValidUsers = auth.isValidUsers(req);
  const isValidAdminUsers = auth.isValidAdminUsers(req);
  const isAuthorizedWebsocketUser = isValidWebSocketUserWithRoles(req);
  const checkUserPermissions = permUtils.isAuthorized(req);
  if (req['user'] && req['user'].jwtFrontend && req['user'].refreshToken) {
    const responseJson = {
      jwtFrontend: req['user'].jwtFrontend,
      isAuthorizedUser: isAuthorizedUser || checkUserPermissions,
      ...isValidUsers,
      ...isValidAdminUsers,
      isAuthorizedWebsocketUser: isAuthorizedWebsocketUser || checkUserPermissions
    };
    req.session.correlationID = uuidv4();
    res.status(HttpStatus.OK).json(responseJson);
  } else {
    res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Not logged in'
    });
  }
});

router.get('/user', passport.authenticate('jwt', {session: false}), (req, res) => {
  const thisSession = req['session'];
  let userToken;
  try {
    userToken = jsonwebtoken.verify(thisSession['passport'].user.jwt, config.get('oidc:publicKey'));
    if (userToken === undefined || userToken.realm_access === undefined || userToken.realm_access.roles === undefined || userToken.idir_username === undefined) {
      return res.status(HttpStatus.UNAUTHORIZED).json();
    }
    thisSession.roles = userToken.realm_access.roles;
  } catch (e) {
    log.error('error is from verify', e);
    return res.status(HttpStatus.UNAUTHORIZED).json();
  }
  const userName = {
    userName: userToken['idir_username'],
    userGuid: userToken['idir_guid'].toUpperCase(),
    userRoles: userToken.realm_access.roles
  };

  if (userName.userName && userName.userGuid) {
    return res.status(HttpStatus.OK).json(userName);
  } else {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json();
  }

});

router.get('/user-session-remaining-time', passport.authenticate('jwt', {session: false}), (req, res) => {
  if (req?.session?.cookie && req?.session?.passport?.user) {
    const remainingTime = req.session.cookie.maxAge;
    log.info(`session remaining time is :: ${remainingTime} for user`, req.session?.passport?.user?.displayName);
    return res.status(HttpStatus.OK).json(req.session.cookie.maxAge);
  } else {
    return res.sendStatus(HttpStatus.UNAUTHORIZED);
  }
});

module.exports = router;
