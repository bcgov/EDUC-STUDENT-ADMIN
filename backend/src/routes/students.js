const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { getStudentById } = require('../components/requests');
const { searchStudent, getStudentGender, getDemogCodes, getStatusCodes, getGradeCodes } = require('../components/studentSearch');
const { saveStudent, getStudentByStudentId } = require('../components/student');
const roles = require('../components/roles');

const isValidUiTokenWithGumpRoles = auth.isValidUiTokenWithRoles('GMP & UMP', [...roles.User.GMP, ...roles.User.UMP]);

router.get('/genderCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithGumpRoles, getStudentGender);
router.get('/demogCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithGumpRoles, getDemogCodes);
router.get('/statusCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithGumpRoles, getStatusCodes);
router.get('/gradeCodes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithGumpRoles, getGradeCodes);
router.get('/search', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, searchStudent);
router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithGumpRoles, getStudentById);
router.get('/detail/:id', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithGumpRoles, getStudentByStudentId);
router.post('/', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithGumpRoles, saveStudent);

module.exports = router;
