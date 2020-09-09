const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const {getStudentDemographicsById} = require('../components/requests');
const utils = require('../components/utils');
const extendSession = utils.extendSession();
router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isValidGMPAdmin, extendSession, getStudentDemographicsById);

module.exports = router;
