const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const {getStudentById} = require('../components/requests');
const {searchStudent, getStudentHistoryByStudentID} = require('../components/studentSearch');
const {
  createNewStudent,
  updateStudent,
  getStudentByStudentId,
  getStudentByPen,
  getAllStudentByStudentIds,
  getStudentDemographicsOnlyByStudentId,
} = require('../components/student');
const roles = require('../components/roles');
const utils = require('../components/utils');
const extendSession = utils.extendSession();
const atomicStudentUpdate = require('../middlewares/atomic-student-update');
const permUtils = require('../components/permissionUtils');
const isValidUiTokenWithStaffRoles = auth.isValidUiTokenWithRoles('GMP & UMP & PenRequestBatch & StudentSearch', [...roles.User.GMP, ...roles.User.UMP, ...roles.User.PenRequestBatch, ...roles.User.StudentSearch, ...roles.User.StaffAdministration]);

const isValidUITokenWithSearchRoles = auth.isValidUiTokenWithRoles('StudentSearch & PenRequestBatchAnalytics', [...roles.User.StudentSearch, ...roles.User.PenRequestBatchAnalytics]);

const isValidUiTokenWithSimpleSearchRoles = auth.isValidUiTokenWithRoles('GMP & UMP & PenRequestBatch & StudentSearch', [...roles.User.GMP, ...roles.User.UMP, ...roles.User.PenRequestBatch, ...roles.User.StudentSearch, ...roles.User.StaffAdministration]);

router.get('/allStudents', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, extendSession, getAllStudentByStudentIds);
router.get('/genderCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, utils.cacheMiddleware(), utils.getCodes('server:student:genderCodesURL', 'studentGenderCodes'));
router.get('/activeGenderCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, utils.cacheMiddleware(), utils.getActiveCodes('server:student:genderCodesURL', 'studentGenderCodes'));
router.get('/demogCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, utils.cacheMiddleware(), utils.getCodes('server:student:demogCodesURL', 'studentDemogCodes'));
router.get('/statusCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, utils.cacheMiddleware(), utils.getCodes('server:student:statusCodesURL', 'studentStatusCodes'));
router.get('/gradeCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, utils.cacheMiddleware(), utils.getCodes('server:student:gradeCodesURL', 'studentGradeCodes'));
router.get('/document-type-codes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, utils.cacheMiddleware(), utils.getCodes('server:student:docTypeCodesURL', 'studentDocTypeCodes'));
router.get('/historyActivityCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, utils.cacheMiddleware(), utils.getCodes('server:student:historyActivityCodesURL', 'studentHistoryActivityCodes'));
router.get('/search', passport.authenticate('jwt', {session: false}, undefined), isValidUITokenWithSearchRoles, extendSession, searchStudent);
router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, permUtils.isValidUUIDParam('id'), extendSession, getStudentById);
router.get('/', passport.authenticate('jwt', {session: false}, undefined), permUtils.hasPermissionToGetStudentByPEN(isValidUiTokenWithSimpleSearchRoles), permUtils.isValidUUIDQueryParam('pen'), extendSession, getStudentByPen);
router.get('/detail/:id', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, permUtils.isValidUUIDParam('id'), extendSession, getStudentByStudentId);
router.get('/demographics/:id', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, permUtils.isValidUUIDParam('id'), extendSession, getStudentDemographicsOnlyByStudentId);
router.put('/:studentID', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, permUtils.isValidUUIDParam('studentID'), extendSession, atomicStudentUpdate.handleConcurrentStudentModification, updateStudent);
router.post('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStaffAdministrationAdmin, extendSession, createNewStudent);
router.get('/:id/history', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, permUtils.isValidUUIDParam('id'), extendSession, getStudentHistoryByStudentID);

module.exports = router;
