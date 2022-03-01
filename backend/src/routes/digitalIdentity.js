const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { getDigitalIdentityByStudentID, unlinkDigitalIdentity } = require('../components/digitalIdentity');
const utils = require('../components/utils');
const extendSession = utils.extendSession();

router.get('/list', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchUserToken, extendSession, getDigitalIdentityByStudentID);

router.put('/:digitalID', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchUserToken, extendSession, unlinkDigitalIdentity);

module.exports = router;
