const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const {getPENBatchRequestStats, getPenRequestFiles} = require('../components/penRequestBatch');
const utils = require('../components/utils');
const extendSession = utils.extendSession();
/*
 * Get all pen request batch files
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession, getPenRequestFiles);

/*
 * Returns the number of pen requests in initial and subsequent review
 */
router.get('/stats', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, extendSession, getPENBatchRequestStats);


module.exports = router;
