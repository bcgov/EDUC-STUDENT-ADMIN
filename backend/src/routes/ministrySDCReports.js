const passport = require('passport');
const express = require('express');
const router = express.Router();
const utils = require('../components/utils');
const permUtils = require('../components/permissionUtils');
const {getMinistrySDCReport, downloadMinistrySDCReport} = require('../components/ministrySDCReports');
const perm = require('../util/Permission');
const auth = require('../components/auth');
const extendSession = utils.extendSession();
const PERMISSION = perm.PERMISSION;

router.get('/public/:reportType/:collectionID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.REPORTS_SDC_PUBLIC_SCHOOLS_PERMISSION), permUtils.isValidUUIDParam('collectionID'), extendSession, getMinistrySDCReport);
router.get('/independent/:reportType/:collectionID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.REPORTS_SDC_INDEPENDENT_SCHOOLS_PERMISSION), permUtils.isValidUUIDParam('collectionID'), extendSession, getMinistrySDCReport);
router.get('/headcount/:reportType/:collectionID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.REPORTS_SDC_HEADCOUNTS_PERMISSION), permUtils.isValidUUIDParam('collectionID'), extendSession, getMinistrySDCReport);

router.get('/download/headcount/:reportType/:collectionID', auth.refreshJWT, permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), permUtils.isValidUUIDParam('collectionID'), extendSession, downloadMinistrySDCReport);

module.exports = router;
