const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getActiveReportingPeriod } = require('../components/gdc/gdc');
const utils = require('../components/utils');
const extendSession = utils.extendSession();
const permUtils = require('../components/permissionUtils');
const perm = require('../util/Permission');

const PERMISSION = perm.PERMISSION;

router.get('/active-reporting-period', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_GDC_REPORTING_PERIOD), extendSession, getActiveReportingPeriod);

module.exports = router;
