const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getAssessmentSessions, getAssessmentSessionsBySchoolYear, getAssessmentSpecialCases, downloadAssessmentStudentReport,
  uploadAssessmentKeyFile , uploadAssessmentResultsFile, getResultUploadSummary, getRegistrationSummary, downloadReport, downloadXamFile, downloadSchoolLevelReport, approveResults} = require('../components/assessments/assessments');
const utils = require('../components/utils');
const extendSession = utils.extendSession();
const permUtils = require('../components/permissionUtils');
const perm = require('../util/Permission');
const validate = require('../components/validator');
const auth = require('../components/auth');
const {fileUploadSchema, reportSchema, approvalSchema} = require('../validations/assessments');
const { scanFilePayload } = require('../components/fileUtils');

const PERMISSION = perm.PERMISSION;


router.get('/assessment-sessions', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_ASSESSMENTS_PERMISSION), extendSession, getAssessmentSessions);
router.get('/assessment-sessions/school-year/:schoolYear', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_ASSESSMENTS_PERMISSION), extendSession, getAssessmentSessionsBySchoolYear);
router.post('/assessment-keys/session/:sessionID/upload-file', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_ASSESSMENT_ASSESSMENT_KEYS_PERMISSION), extendSession, validate(fileUploadSchema), scanFilePayload, uploadAssessmentKeyFile);

router.post('/assessment-results/session/:sessionID/upload-file', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_ASSESSMENT_RESULTS_PERMISSION), extendSession, validate(fileUploadSchema), scanFilePayload, uploadAssessmentResultsFile);
router.get('/assessment-specialcase-types', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_ASSESSMENTS_PERMISSION), extendSession, getAssessmentSpecialCases);
router.get('/assessment-results/session/:sessionID/summary', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_ASSESSMENTS_PERMISSION), extendSession, getResultUploadSummary);

router.get('/:sessionID/summary/:type', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_ASSESSMENTS_PERMISSION), extendSession, validate(reportSchema), getRegistrationSummary);
router.get('/:sessionID/report/:type/download', auth.refreshJWT, permUtils.checkUserHasPermission(PERMISSION.VIEW_ASSESSMENTS_PERMISSION), extendSession, validate(reportSchema), downloadReport);

router.get('/:sessionID/:schoolID/xam/download', auth.refreshJWT, permUtils.checkUserHasPermission(PERMISSION.VIEW_ASSESSMENTS_PERMISSION), extendSession, downloadXamFile);
router.get('/:sessionID/school/:schoolID/:reportTypeCode/download', auth.refreshJWT, permUtils.checkUserHasPermission(PERMISSION.VIEW_ASSESSMENTS_PERMISSION), extendSession, downloadSchoolLevelReport);

router.post('/:sessionID/approve', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasAnyPermission(PERMISSION.ASSESSMENT_APPROVER_ASSESSMENT_ANALYSIS_AND_REPORTING_PERMISSION, PERMISSION.ASSESSMENT_APPROVER_PROVINCIAL_ASSESSMENT_DESIGN_PERMISSION, PERMISSION.ASSESSMENT_APPROVER_STUDENT_CERTIFICATION_AND_DATA_MANAGEMENT_PERMISSION), extendSession, validate(approvalSchema), approveResults);
router.get('/reports/student/:studentID/:reportTypeCode/download', auth.refreshJWT, permUtils.checkUserHasPermission(PERMISSION.VIEW_ASSESSMENTS_PERMISSION), extendSession, downloadAssessmentStudentReport);

module.exports = router;
