const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { getTraxDataByPen } = require('../components/penTrax');
const utils = require('../components/utils');
const extendSession = utils.extendSession();

router.get('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchUserToken, extendSession, getTraxDataByPen);

module.exports = router;
