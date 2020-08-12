const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { getPENBatchRequestStats, getPenRequestFiles } = require('../components/penRequestBatch');

/*
 * Get all pen request batch files
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, getPenRequestFiles);

/*
 * Returns the number of pen requests in initial and subsequent review
 */
router.get('/stats', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, getPENBatchRequestStats);



module.exports = router;
