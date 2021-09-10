const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { getSldStudentHistoryByPen } = require('../components/sld');
const utils = require('../components/utils');
const extendSession = utils.extendSession();

router.get('/studentHistory', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchUserToken, extendSession,  getSldStudentHistoryByPen);

module.exports = router;
