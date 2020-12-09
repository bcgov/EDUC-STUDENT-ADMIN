const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { getSchoolByMincode } = require('../components/school');
const utils = require('../components/utils');
const extendSession = utils.extendSession();

/*
 * Get a school entity by mincode
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, extendSession, getSchoolByMincode);

module.exports = router;

