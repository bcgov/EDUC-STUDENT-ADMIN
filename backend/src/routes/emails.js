const passport = require('passport');
const config = require('../config/index');
const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../components/auth');

router.post('/', passport.authenticate('jwt', {session: false}), auth.isValidAdminToken,
  async (req, res) => {
    try{
      const sessID = req.sessionID;
      // eslint-disable-next-line no-console
      const thisSession = JSON.parse(req.sessionStore.sessions[sessID]);
      const userToken = thisSession.passport.user.jwt;
      // eslint-disable-next-line no-console
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      const penEmailsResponse = await axios.post(config.get("server:penEmails") + '/' + req.query.type, req.body);
      console.log(penEmailsResponse);
      if(penEmailsResponse.status >= 200 && penEmailsResponse.status <= 300){
        return res.status(200).json({
          message: 'success'
        });
      }
      else {
        console.log('Error calling email service.  Check the PEN-REQUEST-EMAIL-API logs.');
        return res.status(500).json({
          message: 'Error calling email service'
        });
      }
    } catch(e) {
      console.log(e);
      return res.status(500).json({
        message: 'API error'
      });
    }
});

module.exports = router;
