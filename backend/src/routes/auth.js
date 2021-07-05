'use strict';

const config = require('../config/index');
const passport = require('passport');
const express = require('express');
const auth = require('../components/auth');
const jsonwebtoken = require('jsonwebtoken');
const roles = require('../components/roles');
const log = require('../components/logger');
const HttpStatus = require('http-status-codes');

const {
  body,
  validationResult
} = require('express-validator');

const isValidStaffUserWithRoles = auth.isValidUserWithRoles('GMP & UMP & PenRequestBatch & StudentSearch & StaffAdministration', [...roles.User.GMP, ...roles.User.UMP, ...roles.User.PenRequestBatch, ...roles.User.StudentSearch, ...roles.User.StaffAdministration]);

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
  failureRedirect: 'error'
}));

function logout(req) {
  req.logout();
  req.session.destroy();
}

//removes tokens and destroys session
router.get('/logout', async (req, res) => {
  if (req?.session?.passport?.user) {
    logout(req);
    let retUrl;
    if (req.query && req.query.sessionExpired) {
      retUrl = encodeURIComponent(config.get('logoutEndpoint') + '?post_logout_redirect_uri=' + config.get('server:frontend') + '/session-expired');
    } else {
      retUrl = encodeURIComponent(config.get('logoutEndpoint') + '?post_logout_redirect_uri=' + config.get('server:frontend') + '/logout');
    }
    res.redirect(config.get('siteMinder_logout_endpoint') + retUrl);
  } else {
    if (req.query && req.query.sessionExpired) {
      res.redirect(config.get('server:frontend') + '/session-expired');
    } else {
      res.redirect(config.get('server:frontend') + '/logout');
    }
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
    const responseJson = {
      jwtFrontend: req.user.jwtFrontend,
      isAuthorizedUser: isAuthorizedUser,
      ...isValidUsers
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
      const responseJson = {
        jwtFrontend: req.user.jwtFrontend,
        isAuthorizedUser: isAuthorizedUser,
        ...isValidUsers
      };
      return res.status(HttpStatus.OK).json(responseJson);
    }
  }

});

//provides a jwt to authenticated users
router.get('/token', auth.refreshJWT, (req, res) => {
  const isAuthorizedUser = isValidStaffUserWithRoles(req);
  const isValidUsers = auth.isValidUsers(req);
  if (req['user'] && req['user'].jwtFrontend && req['user'].refreshToken) {
    const responseJson = {
      jwtFrontend: req['user'].jwtFrontend,
      isAuthorizedUser: isAuthorizedUser,
      ...isValidUsers
    };
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
    if (userToken === undefined || userToken.realm_access === undefined || userToken.realm_access.roles === undefined) {
      return res.status(HttpStatus.UNAUTHORIZED).json();
    }
  } catch (e) {
    log.error('error is from verify', e);
    return res.status(HttpStatus.UNAUTHORIZED).json();
  }
  const userName = {
    userName: userToken['idir_username'],
    userGuid: userToken.preferred_username.toUpperCase(),
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
