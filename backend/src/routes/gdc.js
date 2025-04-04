const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getActiveReportingPeriod, updateReportingPeriod } = require('../components/gdc/gdc');
const utils = require('../components/utils');
const extendSession = utils.extendSession();
const permUtils = require('../components/permissionUtils');
const perm = require('../util/Permission');

const PERMISSION = perm.PERMISSION;

router.get('/active-reporting-period', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_GDC_REPORTING_PERIOD), extendSession, getActiveReportingPeriod);
router.put('/reporting-period', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.WRITE_GDC_REPORTING_PERIOD), extendSession, updateReportingPeriod);

module.exports = router;
