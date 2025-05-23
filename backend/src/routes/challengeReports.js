const passport = require('passport');
const express = require('express');
const router = express.Router();
const {getActiveChallengeReportsPeriod, updateActiveChallengeReportsSession} = require('../components/challengeReports');
const { PERMISSION } = require('../util/Permission');
const permUtils = require('../components/permissionUtils');
const utils = require('../components/utils');
const extendSession = utils.extendSession();

router.get('/active-period', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_GRAD_DATA_COLLECTION_PERMISSION), extendSession, getActiveChallengeReportsPeriod);
router.put('/active-period', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_GRAD_DATA_COLLECTION_PERMISSION), extendSession, updateActiveChallengeReportsSession);
module.exports = router;
