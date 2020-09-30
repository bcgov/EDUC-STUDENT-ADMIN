const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const utils = require('../components/utils');
const extendSession = utils.extendSession();
const { getPENBatchRequestStats, getPenRequestFiles, getPenRequestBatchStudents, updatePrbStudentInfoRequested } = require('../components/penRequestBatch');

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

// Updates the info requested of student by studentId.
router.put('/:id/students/:studentId', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, updatePrbStudentInfoRequested);

router.get('/studentStatusCodes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, utils.cacheMiddleware(), utils.getCodes('server:penRequestBatch:studentStatusCodesURL', 'penRequestBatchStudentStatusCodes'));

module.exports = router;
