const passport = require('passport');
const express = require('express');
const router = express.Router();
const utils = require('../components/utils');
const auth = require('../components/auth');
const { getPenRequestCodes } = require('../components/penRequests');

router.get('/penRequestStatuses', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, utils.cacheMiddleware(), getPenRequestCodes('server:statusCodeURL', 'penStatusCodes'));

router.get('/documentTypes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, utils.cacheMiddleware(), getPenRequestCodes('server:documentTypeCodesURL', 'documentTypeCodes'));

module.exports = router;
