const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { getDigitalIdentityByStudentID, unlinkDigitalIdentity } = require('../components/digitalIdentity');
const utils = require('../components/utils');
const permUtils = require('../components/permissionUtils');
const extendSession = utils.extendSession();

router.get('/list', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchUserToken, extendSession, permUtils.isValidUUIDParam('studentID'), getDigitalIdentityByStudentID);

router.put('/:digitalID', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchUserToken, extendSession, permUtils.isValidUUIDParam('digitalID'), unlinkDigitalIdentity);

module.exports = router;
