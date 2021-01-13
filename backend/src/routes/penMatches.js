const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { getPenMatch ,getPossibleMatchesByStudentID, deletePossibleMatchesByStudentIDAndMatchedStudentID, savePossibleMatchesForStudent, deletePossibleMatches} = require('../components/penMatches');
const utils = require('../components/utils');
const extendSession = utils.extendSession();
/*
 * Get results of pen match
 */
router.post('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, extendSession,  getPenMatch);

router.post('/possible-match/bulk-delete', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, extendSession,  deletePossibleMatches);

router.get('/possible-match-reason-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, extendSession,  utils.cacheMiddleware(), utils.getCodes('server:penMatch:matchReasonCodes', 'PossibleMatchReasonCodes'));

router.get('/possible-match/:studentID', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, extendSession,  getPossibleMatchesByStudentID);

router.post('/possible-match/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, extendSession,  savePossibleMatchesForStudent);

router.delete('/possible-match/:studentID/:matchedStudentID', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, extendSession,  deletePossibleMatchesByStudentIDAndMatchedStudentID);



module.exports = router;
