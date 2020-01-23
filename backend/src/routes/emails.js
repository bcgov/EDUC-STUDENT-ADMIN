const passport = require('passport');
const config = require('../config/index');
const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../components/auth');

router.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: [
      '/reject',
      '/info',
      '/complete',
    ]
  });
});

router.post('/reject', passport.authenticate('jwt', {session: false}), auth.isValidAdminToken,
  async (req, res) => {
    try{
      var sessID = req.sessionID;
      // eslint-disable-next-line no-console
      var thisSession = JSON.parse(req.sessionStore.sessions[sessID]);
      var userToken = thisSession.passport.user.jwt;
      // eslint-disable-next-line no-console
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      const penEmailsResponse = await axios.post(config.get("server:penEmails") + '/reject', req.body);
      if(penEmailsResponse.status !== 200){
        return res.status(penEmailsResponse.status).json({
          message: 'API error'
        });
      }
      return res.status(200).json({
        message: 'success'
      });
    } catch(e) {
      console.log(e);
      return res.status(500).json({
        message: 'API error'
      });
    }
});

module.exports = router;