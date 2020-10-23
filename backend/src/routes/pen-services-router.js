const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { validateStudentDemogData } = require('../components/pen-services');
const utils = require('../components/utils');
const extendSession = utils.extendSession();
/*
 * Get results of student demographics validation
 */
router.post('/demog-validation', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, extendSession,  validateStudentDemogData);

module.exports = router;
