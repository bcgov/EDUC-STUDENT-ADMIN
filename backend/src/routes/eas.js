const passport = require('passport');
const express = require('express');
const router = express.Router();
const { postAssessmentStudent, getAssessmentSessions, getAssessmentSessionsBySchoolYear, updateAssessmentSession, getAssessmentStudentsPaginated, getAssessmentStudentByID, updateAssessmentStudentByID, getAssessmentSpecialCases, deleteAssessmentStudentByID, 
  uploadAssessmentKeyFile } = require('../components/eas/eas');
const utils = require('../components/utils');
const extendSession = utils.extendSession();
const permUtils = require('../components/permissionUtils');
const perm = require('../util/Permission');
const validate = require('../components/validator');

const {putStudentAssessmentSchema, postStudentAssessmentSchema, fileUploadSchema} = require('../validations/eas');
const { scanFilePayload } = require('../components/fileUtils');

const PERMISSION = perm.PERMISSION;


router.get('/assessment-sessions', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EAS_SESSIONS_PERMISSION), extendSession, getAssessmentSessions);
router.get('/assessment-sessions/school-year/:schoolYear', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EAS_SESSIONS_PERMISSION), extendSession, getAssessmentSessionsBySchoolYear);
router.put('/assessment-sessions/:sessionID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EAS_SESSIONS_PERMISSION), extendSession, updateAssessmentSession);

router.post('/assessment-registrations/student', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_EAS_STUDENT_PERMISSION), extendSession, validate(postStudentAssessmentSchema), postAssessmentStudent);
router.get('/assessment-registrations/student/:assessmentStudentID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_EAS_STUDENT_PERMISSION), extendSession, getAssessmentStudentByID);
router.put('/assessment-registrations/student/:assessmentStudentID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_EAS_STUDENT_PERMISSION), extendSession, validate(putStudentAssessmentSchema), updateAssessmentStudentByID);
router.get('/assessment-registrations/paginated', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_EAS_STUDENT_PERMISSION), extendSession, getAssessmentStudentsPaginated);
router.delete('/assessment-registrations/student/:assessmentStudentID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_EAS_STUDENT_PERMISSION), extendSession, deleteAssessmentStudentByID);

router.post('/assessment-keys/session/:sessionID/upload-file', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EAS_ASSESSMENT_KEYS_PERMISSION), extendSession, validate(fileUploadSchema), scanFilePayload, uploadAssessmentKeyFile);

router.get('/assessment-specialcase-types', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EAS_SESSIONS_PERMISSION), extendSession, getAssessmentSpecialCases);

module.exports = router;
