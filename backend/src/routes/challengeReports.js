const passport = require('passport');
const express = require('express');
const router = express.Router();
const {getActiveChallengeReportsPeriod, updateActiveChallengeReportsSession, startChallengeReportPhase, downloadMinistryChallengeReport} = require('../components/challengeReports');
const { PERMISSION } = require('../util/Permission');
const permUtils = require('../components/permissionUtils');
const utils = require('../components/utils');
const auth = require('../components/auth');
const extendSession = utils.extendSession();

router.get('/active-period', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.CHALLENGE_REPORT_PERMISSION), extendSession, getActiveChallengeReportsPeriod);
router.put('/active-period', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_GRAD_DATA_COLLECTION_PERMISSION), extendSession, updateActiveChallengeReportsSession);
router.post('/startChallengeReportPhase', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_GRAD_DATA_COLLECTION_PERMISSION), extendSession, startChallengeReportPhase);
router.get('/report/:reportType', auth.refreshJWT, permUtils.checkUserHasPermission(PERMISSION.REPORTS_SDC_HEADCOUNTS_PERMISSION), extendSession, downloadMinistryChallengeReport);
module.exports = router;
