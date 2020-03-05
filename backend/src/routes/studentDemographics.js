const passport = require('passport');
const config = require('../config/index');
const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../components/auth');
const utils = require('../components/utils');
const log = require('npmlog');


router.get('/:id', passport.authenticate('jwt', {session: false}), auth.isValidAdminToken,
  async (req, res) => {
    try{
      const token = utils.getBackendToken(req);
      axios.defaults.headers['common']['Authorization'] = `Bearer ${token}`;
      const response = await axios.get(config.get('server:demographicsURL') + '/' + req.params.id);

      const birthDate = utils.formatDate(response.data['studBirth']);

      if(response.status >= 200 && response.status < 300){
        req['session'].studentDemographics = response.data;
        req['session'].studentDemographics.dob = birthDate;
        const formattedResponse = {
          legalFirst: response.data['studGiven'],
          legalMiddle: response.data['studMiddle'],
          legalLast: response.data['studSurname'],
          usualFirst: response.data['usualGiven'],
          usualMiddle: response.data['usualMiddle'],
          usualLast: response.data['usualSurname'],
          dob: birthDate,
          gender: response.data['studSex']
        };
        return res.status(200).json(formattedResponse);
      }
      log.error('Invalid status code received from pen-demog-api.  Check pen-demog-api logs.');
      log.error(response.status);
      log.error(response.data);
      return res.status(500).json();
    } catch(e) {
      log.error('Error occurred while attempting to GET pen demographics.');
      log.error(e);
      return res.status(500);
    }
  }
);

module.exports = router;
