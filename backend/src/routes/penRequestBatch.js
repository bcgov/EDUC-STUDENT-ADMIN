const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const utils = require('../components/utils');
const extendSession = utils.extendSession();
const { getPENBatchRequestStats, getPenRequestFiles, getPenRequestBatchStudents, getPenWebBlobBySubmissionNumber, getPenRequestBatchStudentById, getPenRequestBatchStudentMatchOutcome, updatePrbStudentInfoRequested,
  issueNewPen, userMatchSaga, userUnmatchSaga, archiveFiles, unarchiveFiles, softDeleteFiles, releaseBatchFilesForFurtherProcessing } = require('../components/penRequestBatch');

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
 * Get pen web blob
 */
router.get('/source', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession, getPenWebBlobBySubmissionNumber);

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
/*
 * User Unmatch saga
 */
router.post('/:id/students/:studentId/user-unmatch', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession, userUnmatchSaga);

router.post('/archiveFiles', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession, archiveFiles);
router.post('/unarchiveFiles', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession, unarchiveFiles);
router.post('/deleteFiles', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession, softDeleteFiles);
router.post('/release-batch-files', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession, releaseBatchFilesForFurtherProcessing);
module.exports = router;
