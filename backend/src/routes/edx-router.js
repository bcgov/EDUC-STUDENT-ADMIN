'use strict';
const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const utils = require('../components/utils');
const { getExchanges, createExchange, getExchange, claimAllExchanges } = require('../components/edx/exchange');

const extendSession = utils.extendSession();

router.get('/users/ministryTeams', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, utils.forwardGet('getMinistryTeams', 'server:edx:rootURL', '/users/ministry-teams'));

router.get('/users/user-schools/mincodes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, utils.forwardGet('getMinCodes', 'server:edx:rootURL', '/users/user-schools/mincodes'));
router.get('/users', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, utils.forwardGet('getEdxUsersByMincode', 'server:edx:rootURL', '/users'));

//edx exchange routes
router.get('/exchange/:secureExchangeID', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, getExchange);
router.get('/exchange', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, getExchanges);
router.post('/exchange/claim', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, claimAllExchanges);
router.get('/exchange/statuses', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, utils.cacheMiddleware(), utils.getCodes('server:edx:exchangeStatusesURL', 'exchangeStatuses'));

router.post('/exchange', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, createExchange);

module.exports = router;
