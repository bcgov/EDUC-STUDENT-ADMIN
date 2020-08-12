const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { getStudentById } = require('../components/requests');
const { searchStudent, getStudentGender, getDemogCodes, getStatusCodes, getGradeCodes } = require('../components/studentSearch');
const { saveStudent, getStudentByStudentId } = require('../components/student');
const roles = require('../components/roles');

const isValidUiTokenWithStaffRoles = auth.isValidUiTokenWithRoles('GMP & UMP & PenRequestBatch & StudentSearch', [...roles.User.GMP, ...roles.User.UMP, ...roles.User.PenRequestBatch, ...roles.User.StudentSearch]);

router.get('/genderCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, getStudentGender);
router.get('/demogCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, getDemogCodes);
router.get('/statusCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, getStatusCodes);
router.get('/gradeCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, getGradeCodes);
router.get('/search', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, searchStudent);
router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, getStudentById);
router.get('/detail/:id', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, getStudentByStudentId);
router.post('/', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, saveStudent);

module.exports = router;
