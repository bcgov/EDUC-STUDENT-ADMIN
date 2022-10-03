const auth = require('../components/auth');
const passport = require('passport');
const express = require('express');
const router = express.Router();
const {getCachedDistrictByDistrictId, getCachedDistricts} = require('../components/institute/institute');
const utils = require('../components/utils');

const extendSession = utils.extendSession();

router.get('/districts/:districtID', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedDistrictByDistrictId);

router.get('/districts', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedDistricts);

module.exports = router;
