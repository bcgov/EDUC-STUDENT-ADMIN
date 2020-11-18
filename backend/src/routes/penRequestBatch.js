const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const utils = require('../components/utils');
const extendSession = utils.extendSession();
const { getPENBatchRequestStats,
  getPenRequestFiles, getAllPenRequestBatchIds,
  getPenRequestBatchStudents, getAllPenRequestBatchStudentIds,
  getPenRequestBatchStudentById, getPenRequestBatchStudentMatchOutcome, updatePrbStudentInfoRequested,
  issueNewPen, userMatchSaga } = require('../components/penRequestBatch');

/*
 * Get paginated pen request batch files
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession, getPenRequestFiles);

/*
 * Get all pen request batch files
 */
router.get('/allIds', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession, getAllPenRequestBatchIds);

/*
 * Returns the number of pen requests in initial and subsequent review
 */
router.get('/stats', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession, getPENBatchRequestStats);

/*
 * Get paginated pen request students
 */
router.get('/students', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession, getPenRequestBatchStudents);

/*
 * Get all pen request students
 */
router.get('/students/allIds', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession, getAllPenRequestBatchStudentIds);

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

router.get('/prbValidationFieldCodes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, utils.cacheMiddleware(), utils.getCodes('server:penServices:prbValidationFieldCodesURL', 'prbValidationFieldCodes'));

router.get('/prbValidationSeverityCodes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, utils.cacheMiddleware(), utils.getCodes('server:penServices:prbValidationSeverityCodesURL', 'prbValidationSeverityCodes'));

router.get('/prbValidationTypeCodes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, utils.cacheMiddleware(), utils.getCodes('server:penServices:prbValidationTypeCodesURL', 'prbValidationTypeCodes'));

/*
 * Issue new pen saga
 */
router.post('/:id/students/:studentId/issueNewPen', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession, issueNewPen);

/*
 * User Match saga
 */
router.post('/:id/students/:studentId/user-match', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession, userMatchSaga);
module.exports = router;
