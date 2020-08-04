const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const {getPenRequestFiles} = require('../components/penRequestBatch');

/*
 * Get all pen request batch files
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidPenRequestBatchAdmin, getPenRequestFiles);


module.exports = router;
