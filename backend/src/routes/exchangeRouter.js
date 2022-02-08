'use strict';
const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const utils = require('../components/utils');
const { getExchanges } = require('../components/exchange');

const extendSession = utils.extendSession();

router.get('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, getExchanges);

module.exports = router;
