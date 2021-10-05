'use strict';
const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const {getGMPStatsByStatsType, getUMPStatsByStatsType, getNewPenStats, getMergeStats} = require('../components/analytics');


// FIX ME role for the route.
router.get('/gmp/stats', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStaffAdministrationAdmin,  getGMPStatsByStatsType);
router.get('/ump/stats', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStaffAdministrationAdmin,  getUMPStatsByStatsType);
router.get('/new-pen', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStaffAdministrationAdmin,  getNewPenStats);
router.get('/merges', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStaffAdministrationAdmin,  getMergeStats);
module.exports = router;
