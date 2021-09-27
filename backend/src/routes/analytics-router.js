'use strict';
const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const {getGMPStatsByStatsType} = require('../components/analytics');


// FIX ME role for the route.
router.get('/gmp/stats', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin,  getGMPStatsByStatsType);

module.exports = router;
