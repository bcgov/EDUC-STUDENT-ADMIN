const passport = require('passport');
const express = require('express');
const router = express.Router();
const utils = require('../components/utils');
const extendSession = utils.extendSession();

router.get('/fedProvSchoolCodes', passport.authenticate('jwt', {session: false}, undefined), extendSession, utils.getCodes('server:schoolAPIURL', 'fedProvSchoolCodes', '/schools/federal-province-codes', false));

module.exports = router;

