const passport = require('passport');
const express = require('express');
const router = express.Router();
const utils = require('../components/utils');
const auth = require('../components/auth');
const extendSession = utils.extendSession();
router.get('/requestStatuses', passport.authenticate('jwt', {session: false}, undefined), auth.isValidGMPUserToken, utils.cacheMiddleware(), extendSession, utils.getCodes('server:penRequest:statusCodeURL', 'penRequestStatusCodes'));

router.get('/documentTypes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidGMPUserToken, utils.cacheMiddleware(), extendSession, utils.getCodes('server:penRequest:documentTypeCodesURL', 'penRequestDocumentTypeCodes'));

module.exports = router;
