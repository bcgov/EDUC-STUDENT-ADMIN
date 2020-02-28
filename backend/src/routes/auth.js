'use strict';

const config =require('../config/index');
const passport = require('passport');
const express = require('express');
const auth = require('../components/auth');
const jsonwebtoken = require('jsonwebtoken');

const {
  body,
  validationResult
} = require('express-validator');

const router = express.Router();

//provides a callback location for the auth service
router.get('/callback',
  passport.authenticate('oidc', {
    failureRedirect: 'error'
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

//removes tokens and destroys session
router.get('/logout', async (req, res) => {
  if(req.user.jwt){
    const token = req.user.jwt;
    req.logout();
    req.session.destroy();
    res.redirect(config.get('logoutEndpoint') + '?id_token_hint=' + token + '&post_logout_redirect_uri=' + config.get('server:frontend'));
  } else {
    const refresh = await auth.renew(req.user.refreshToken);
    if(req.user){
      req.logout();
      req.session.destroy();
      res.redirect(config.get('logoutEndpoint') + '?id_token_hint=' + refresh.jwt + '&post_logout_redirect_uri=' + config.get('server:frontend'));
    } else{
      req.logout();
      req.session.destroy();
      res.redirect(config.get('server:frontend'));
    }
  }
});

//refreshes jwt on refresh if refreshToken is valid
router.post('/refresh', [
  body('refreshToken').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }


  let isAdminUser = auth.isAdminUser(req);
  if(!req['user'] || !req['user'].refreshToken){
    res.status(401).json();
  } else{
    const newTokens = await auth.renew(req['user'].refreshToken);
    req['user'].jwt = newTokens.jwt;
    req['user'].refreshToken = newTokens.refreshToken;
    if(req['user']){
      const newUiToken = auth.generateUiToken();
      const responseJson = {
        jwtFrontend: newUiToken,
        isAdminUser: isAdminUser
      };
      return res.status(200).json(responseJson);
    } else {
      res.status(401).json();
    }
  }
});

//provides a jwt to authenticated users
router.get('/token', auth.refreshJWT, (req, res) => {

  let isAdminUser = auth.isAdminUser(req);

  if (req['user'] && req['user'].jwtFrontend && req['user'].refreshToken) {
    const responseJson = {
      jwtFrontend: req['user'].jwtFrontend,
      isAdminUser : isAdminUser
    };
    res.status(200).json(responseJson);
  } else {
    res.status(401).json({
      message: 'Not logged in'
    });
  }
});

router.get('/user',  passport.authenticate('jwt', {session: false}), (req, res) => {
  const thisSession = req['session'];
  const userToken = jsonwebtoken.verify(thisSession['passport'].user.jwt, config.get('oidc:publicKey'));
  const userName = {
    userName: userToken['idir_username'],
    userGuid: userToken.preferred_username.toUpperCase()
  };

  if(userName.userName && userName.userGuid) {
    return res.status(200).json(userName);
  }
  else {
    return res.status(500);
  }

});

module.exports = router;
