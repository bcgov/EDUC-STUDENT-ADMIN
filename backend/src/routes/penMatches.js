const passport = require('passport');
const express = require('express');
const router = express.Router();
const roles = require('../components/roles');
const auth = require('../components/auth');
const { getPenMatch ,getPossibleMatchesByStudentID, deletePossibleMatchesByStudentIDAndMatchedStudentID, savePossibleMatchesForStudent, deletePossibleMatches} = require('../components/penMatches');
const utils = require('../components/utils');
const extendSession = utils.extendSession();

const isValidUiTokenWithStaffRoles = auth.isValidUiTokenWithRoles('PenRequestBatch & StudentSearch', [...roles.User.PenRequestBatch, ...roles.User.StudentSearch]);
/*
 * Get results of pen match
 */
router.post('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession,  getPenMatch);

router.post('/possible-match/bulk-delete', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession,  deletePossibleMatches);

router.get('/possible-match-reason-codes', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, extendSession,  utils.cacheMiddleware(), utils.getCodes('server:penMatch:matchReasonCodes', 'PossibleMatchReasonCodes'));

router.get('/possible-match/:studentID', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession,  getPossibleMatchesByStudentID);

router.post('/possible-match/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession,  savePossibleMatchesForStudent);

router.delete('/possible-match/:studentID/:matchedStudentID', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession,  deletePossibleMatchesByStudentIDAndMatchedStudentID);



module.exports = router;
