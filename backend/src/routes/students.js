const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { getStudentById } = require('../components/requests');


router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, getStudentById);

module.exports = router;
