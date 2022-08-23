const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getDistricts, getDistrictByDistrictId} = require('../components/institute');
const utils = require('../components/utils');
const extendSession = utils.extendSession();


router.get('/districts', passport.authenticate('jwt', {session: false}, undefined), extendSession, getDistricts);

router.get('/districts/:districtId', passport.authenticate('jwt', {session: false}, undefined), extendSession, getDistrictByDistrictId);
module.exports = router;
