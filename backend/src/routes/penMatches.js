const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { getPenMatch } = require('../components/penMatches');

/*
 * Get results of pen match
 */
router.post('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, getPenMatch);




module.exports = router;
