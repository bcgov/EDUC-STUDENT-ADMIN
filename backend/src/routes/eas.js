const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getAssessmentSessions, updateAssessmentSession } = require('../components/eas/eas');
const utils = require('../components/utils');
const extendSession = utils.extendSession();
const permUtils = require('../components/permissionUtils');
const perm = require('../util/Permission');

const PERMISSION = perm.PERMISSION;

router.get('/assessment-sessions', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EAS_SESSIONS_PERMISSION), extendSession, getAssessmentSessions);
router.put('/assessment-sessions/:assessmentSessionID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EAS_SESSIONS_PERMISSION), extendSession, updateAssessmentSession);

module.exports = router;
