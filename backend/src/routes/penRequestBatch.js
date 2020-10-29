const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const utils = require('../components/utils');
const extendSession = utils.extendSession();
const { getPENBatchRequestStats, getPenRequestFiles, getPenRequestBatchStudents, getPenRequestBatchStudentById, getPenRequestBatchStudentMatchOutcome, updatePrbStudentInfoRequested } = require('../components/penRequestBatch');

/*
 * Get all pen request batch files
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession, getPenRequestFiles);

/*
 * Returns the number of pen requests in initial and subsequent review
 */
router.get('/stats', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession, getPENBatchRequestStats);

/*
 * Get pen request students
 */
router.get('/students', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession, getPenRequestBatchStudents);

/*
 * Get pen request batch students match results
 */
router.get('/matchOutcome', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession, getPenRequestBatchStudentMatchOutcome);


// Updates the info requested of student by studentId.
router.put('/:id/students/:studentId', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, updatePrbStudentInfoRequested);

/*
 * Get pen request batch student by id
 */
router.get('/:id/students/:studentId', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession, getPenRequestBatchStudentById);


router.get('/studentStatusCodes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, utils.cacheMiddleware(), utils.getCodes('server:penRequestBatch:studentStatusCodesURL', 'penRequestBatchStudentStatusCodes'));

router.get('/studentInfoMacros', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, utils.cacheMiddleware(), utils.getCodes('server:penRequestBatch:studentInfoMacrosURL', 'penRequestBatchStudentInfoMacros'));

module.exports = router;
