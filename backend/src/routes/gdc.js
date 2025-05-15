const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getActiveReportingPeriod, getPreviousReportingPeriod, updateReportingPeriod, getReportingSummary, getFilesetsPaginated, getDemographicStudentByPenIncomingFilesetIdAndSchoolId, getReportingInsights, getSchoolSubmissionCounts } = require('../components/gdc/gdc');
const utils = require('../components/utils');
const extendSession = utils.extendSession();
const permUtils = require('../components/permissionUtils');
const perm = require('../util/Permission');

const PERMISSION = perm.PERMISSION;

router.get('/active-reporting-period', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_GRAD_DATA_COLLECTION_PERMISSION), extendSession, getActiveReportingPeriod);
router.get('/previous-reporting-period', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_GRAD_DATA_COLLECTION_PERMISSION), extendSession, getPreviousReportingPeriod);
router.put('/reporting-period', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_GRAD_DATA_COLLECTION_PERMISSION), extendSession, updateReportingPeriod);
router.get('/reporting-summary/:reportingPeriodID/school-submission-counts', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_GRAD_DATA_COLLECTION_PERMISSION), extendSession, getSchoolSubmissionCounts);
router.get('/reporting-summary/:reportingPeriodID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_GRAD_DATA_COLLECTION_PERMISSION), extendSession, getReportingSummary);
router.get('/fileset/paginated', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_GRAD_DATA_COLLECTION_PERMISSION), extendSession, getFilesetsPaginated);
router.get('/fileset/:filesetID/student/:pen', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_GRAD_DATA_COLLECTION_PERMISSION), extendSession, getDemographicStudentByPenIncomingFilesetIdAndSchoolId);

router.get('/reporting-insights/:reportingPeriodID/:reportingPeriodType/:sdcCollectionID/:schoolCategory', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_GRAD_DATA_COLLECTION_PERMISSION), extendSession, getReportingInsights);

module.exports = router;
