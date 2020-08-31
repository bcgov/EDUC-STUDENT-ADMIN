const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { getStudentById } = require('../components/requests');
const { searchStudent } = require('../components/studentSearch');
const { saveStudent, getStudentByStudentId } = require('../components/student');
const roles = require('../components/roles');
const utils = require('../components/utils');

const isValidUiTokenWithStaffRoles = auth.isValidUiTokenWithRoles('GMP & UMP & PenRequestBatch & StudentSearch', [...roles.User.GMP, ...roles.User.UMP, ...roles.User.PenRequestBatch, ...roles.User.StudentSearch]);

router.get('/genderCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, utils.cacheMiddleware(), utils.getCodes('server:student:genderCodesURL', 'studentGenderCodes'));
router.get('/demogCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, utils.cacheMiddleware(), utils.getCodes('server:student:demogCodesURL', 'studentDemogCodes'));
router.get('/statusCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, utils.cacheMiddleware(), utils.getCodes('server:student:statusCodesURL', 'studentStatusCodes'));
router.get('/gradeCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, utils.cacheMiddleware(), utils.getCodes('server:student:gradeCodesURL', 'studentGradeCodes'));
router.get('/twinReasonCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, utils.cacheMiddleware(), utils.getCodes('server:student:twinReasonCodesURL', 'studentTwinReasonCodes'));
router.get('/search', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, searchStudent);
router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, getStudentById);
router.get('/detail/:id', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, getStudentByStudentId);
router.post('/', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, saveStudent);

module.exports = router;
