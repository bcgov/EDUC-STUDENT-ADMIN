const passport = require('passport');
const express = require('express');
const router = express.Router();
const utils = require('../components/utils');
const auth = require('../components/auth');
const { getRequestCodes } = require('../components/requests');

router.get('/requestStatuses', passport.authenticate('jwt', {session: false}, undefined), auth.isValidGMPUserToken, utils.cacheMiddleware(), getRequestCodes('server:penRequest:statusCodeURL', 'penRequestStatusCodes'));

router.get('/documentTypes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidGMPUserToken, utils.cacheMiddleware(), getRequestCodes('server:penRequest:documentTypeCodesURL', 'penRequestDocumentTypeCodes'));

module.exports = router;
