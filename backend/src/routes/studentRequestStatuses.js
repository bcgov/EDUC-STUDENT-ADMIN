const passport = require('passport');
const express = require('express');
const router = express.Router();
const utils = require('../components/utils');
const auth = require('../components/auth');
const { getRequestCodes } = require('../components/requests');

router.get('/requestStatuses', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, utils.cacheMiddleware(), getRequestCodes('server:studentRequest:statusCodeURL', 'studentRequestStatusCodes'));

router.get('/documentTypes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, utils.cacheMiddleware(), getRequestCodes('server:studentRequest:documentTypeCodesURL', 'studentRequestDocumentTypeCodes'));

module.exports = router;
