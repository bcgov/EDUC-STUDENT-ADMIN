const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { getStudentById } = require('../components/requests');
const { searchStudent, getStudentGender, getDemogCodes, getStatusCodes, getGradeCodes } = require('../components/studentSearch');
const { saveStudent, getStudentByStudentId } = require('../components/student');

router.get('/genderCodes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, getStudentGender);
router.get('/demogCodes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, getDemogCodes);
router.get('/statusCodes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, getStatusCodes);
router.get('/gradeCodes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, getGradeCodes);
router.get('/search', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, searchStudent);
router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, getStudentById);
router.get('/detail/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, getStudentByStudentId);
router.post('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, saveStudent);

module.exports = router;
