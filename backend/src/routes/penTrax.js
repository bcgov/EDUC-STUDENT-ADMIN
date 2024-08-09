const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { getTraxDataByPen } = require('../components/penTrax');
const utils = require('../components/utils');
const permUtils = require('../components/permissionUtils');
const extendSession = utils.extendSession();

router.get('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchUserToken, permUtils.isValidUUIDQueryParam('pen'), extendSession, getTraxDataByPen);

module.exports = router;
