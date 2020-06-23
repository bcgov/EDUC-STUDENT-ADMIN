const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { getStudentById } = require('../components/requests');
const { searchStudent, getStudentGender } = require('../components/studentSearch');

router.get('/gender', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, getStudentGender);
router.get('/search', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, searchStudent);
router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, getStudentById);

module.exports = router;
