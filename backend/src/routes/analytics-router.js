'use strict';
const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');

const {getGMPStatsByStatsType, getUMPStatsByStatsType, getNewPenStats, getMergeStats} = require('../components/analytics');
const utils = require('../components/utils');
const extendSession = utils.extendSession();

router.get('/gmp/stats', passport.authenticate('jwt', {session: false}, undefined), auth.isValidGUMPAnalyticsUserToken, extendSession, getGMPStatsByStatsType);
router.get('/ump/stats', passport.authenticate('jwt', {session: false}, undefined), auth.isValidGUMPAnalyticsUserToken, extendSession,   getUMPStatsByStatsType);
router.get('/new-pen', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAnalyticsUserToken, extendSession,   getNewPenStats);
router.get('/merges', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAnalyticsUserToken, extendSession,   getMergeStats);
module.exports = router;
