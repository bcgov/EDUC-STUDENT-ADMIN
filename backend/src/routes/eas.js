const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getAssessmentSessions, getAssessmentSessionsBySchoolYear, updateAssessmentSession, getAssessmentStudentsPaginated } = require('../components/eas/eas');
const utils = require('../components/utils');
const extendSession = utils.extendSession();
const permUtils = require('../components/permissionUtils');
const perm = require('../util/Permission');

const PERMISSION = perm.PERMISSION;


router.get('/assessment-sessions', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EAS_SESSIONS_PERMISSION), extendSession, getAssessmentSessions);
router.get('/assessment-sessions/school-year/:schoolYear', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EAS_SESSIONS_PERMISSION), extendSession, getAssessmentSessionsBySchoolYear);
router.put('/assessment-sessions/:sessionID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EAS_SESSIONS_PERMISSION), extendSession, updateAssessmentSession);

router.get('/assessment-registrations/paginated', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EAS_SESSIONS_PERMISSION), extendSession, getAssessmentStudentsPaginated);


module.exports = router;
