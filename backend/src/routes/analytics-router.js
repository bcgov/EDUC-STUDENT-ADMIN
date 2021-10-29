'use strict';
const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const roles = require('../components/roles');

const {getGMPStatsByStatsType, getUMPStatsByStatsType, getNewPenStats, getMergeStats} = require('../components/analytics');
const utils = require('../components/utils');
const extendSession = utils.extendSession();

const isValidGUMPStatsUser = auth.isValidUiTokenWithRoles('GMP & UMP & StudentSearch', [roles.User.GMP, roles.User.UMP, roles.Admin.StudentSearch]);
const isValidStatsAdmin = auth.isValidUiTokenWithRoles('PenRequestBatch & GMP & UMP & StudentSearch', [...roles.Admin.PenRequestBatch, roles.Admin.GMP, roles.Admin.UMP, roles.Admin.StudentSearch]);

// FIX ME role for the route.
router.get('/gmp/stats', passport.authenticate('jwt', {session: false}, undefined), isValidGUMPStatsUser, extendSession, getGMPStatsByStatsType);
router.get('/ump/stats', passport.authenticate('jwt', {session: false}, undefined), isValidGUMPStatsUser, extendSession, getUMPStatsByStatsType);
router.get('/new-pen', passport.authenticate('jwt', {session: false}, undefined), isValidStatsAdmin, extendSession, getNewPenStats);
router.get('/merges', passport.authenticate('jwt', {session: false}, undefined), isValidStatsAdmin, extendSession, getMergeStats);
module.exports = router;
