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
  getStudentDemographicsOnlyByStudentId
} = require('../components/student');
const roles = require('../components/roles');
const utils = require('../components/utils');
const extendSession = utils.extendSession();
const atomicStudentUpdate = require('../middlewares/atomic-student-update');
const isValidUiTokenWithStaffRoles = auth.isValidUiTokenWithRoles('GMP & UMP & PenRequestBatch & StudentSearch', [...roles.User.GMP, ...roles.User.UMP, ...roles.User.PenRequestBatch, ...roles.User.StudentSearch, ...roles.User.StaffAdministration]);

router.get('/allStudents', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, extendSession, getAllStudentByStudentIds);
router.get('/genderCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, utils.cacheMiddleware(), utils.getCodes('server:student:genderCodesURL', 'studentGenderCodes'));
router.get('/demogCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, utils.cacheMiddleware(), utils.getCodes('server:student:demogCodesURL', 'studentDemogCodes'));
router.get('/statusCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, utils.cacheMiddleware(), utils.getCodes('server:student:statusCodesURL', 'studentStatusCodes'));
router.get('/gradeCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, utils.cacheMiddleware(), utils.getCodes('server:student:gradeCodesURL', 'studentGradeCodes'));
router.get('/historyActivityCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, utils.cacheMiddleware(), utils.getCodes('server:student:historyActivityCodesURL', 'studentHistoryActivityCodes'));
router.get('/search', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchUserToken, extendSession, searchStudent);
router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, extendSession, getStudentById);
router.get('/', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, extendSession, getStudentByPen);
router.get('/detail/:id', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, extendSession, getStudentByStudentId);
router.get('/demographics/:id', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, extendSession, getStudentDemographicsOnlyByStudentId);
router.put('/:studentID', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, extendSession, atomicStudentUpdate.handleConcurrentStudentModification, updateStudent);
router.post('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStaffAdministrationAdmin, extendSession, createNewStudent);
router.get('/:id/history', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, extendSession, getStudentHistoryByStudentID);

module.exports = router;
