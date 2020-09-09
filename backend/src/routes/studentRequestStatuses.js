const passport = require('passport');
const express = require('express');
const router = express.Router();
const utils = require('../components/utils');
const auth = require('../components/auth');
const extendSession = utils.extendSession();
router.get('/requestStatuses', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPUserToken, utils.cacheMiddleware(), extendSession, utils.getCodes('server:studentRequest:statusCodeURL', 'studentRequestStatusCodes'));

router.get('/documentTypes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPUserToken, utils.cacheMiddleware(), extendSession, utils.getCodes('server:studentRequest:documentTypeCodesURL', 'studentRequestDocumentTypeCodes'));

module.exports = router;
