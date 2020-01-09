'use strict';

const config =require('../config/index');
const passport = require('passport');
const express = require('express');
const auth = require('../components/auth');
const {
  body,
  validationResult
} = require('express-validator');

const router = express.Router();


router.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: [
      '/callback',
      '/login',
      '/logout',
      '/refresh',
      '/token'
    ]
  });
});

//provides a callback location for the auth service
router.get('/callback',
  passport.authenticate('oidc', {
    failureRedirect: 'error'
  }),
  (_req, res) => {
    //redirect to localhost if running locally
    if(process.env.NODE_ENV === 'local'){
      res.redirect('localhost:8080');
    }
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
  if(process.env.NODE_ENV === 'local'){
    res.redirect(config.get('server:frontend'));
  } else {
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
  if(!req.user.refreshToken){
    res.redirect('/logout');
  } else{
    await auth.renew(req.user.refreshToken);
    if(req.user){
      var newUiToken = auth.generateUiToken();
    }
    return res.status(200).json(newUiToken);
  }
});

//provides a jwt to authenticated users
router.use('/token', auth.refreshJWT, (req, res) => {
  if (req.user && req.user.jwtFrontend && req.user.refreshToken) {
    const responseJson = {
      _json: req.user._json,
      jwtFrontend: req.user.jwtFrontend
    };
    res.status(200).json(responseJson);
  } else {
    res.status(401).json({
      message: 'Not logged in'
    });
  }
});

module.exports = router;
