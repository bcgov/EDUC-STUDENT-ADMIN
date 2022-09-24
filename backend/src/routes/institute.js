const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getDistricts, getDistrictByDistrictId, getSchools, getSchoolsPaginated} = require('../components/institute');
const utils = require('../components/utils');
const extendSession = utils.extendSession();


router.get('/districts', passport.authenticate('jwt', {session: false}, undefined), extendSession, getDistricts);

router.get('/districts/:districtId', passport.authenticate('jwt', {session: false}, undefined), extendSession, getDistrictByDistrictId);

router.get('/school', passport.authenticate('jwt', {session: false}, undefined), extendSession, getSchools);

router.get('/schoolsPaginated', passport.authenticate('jwt', {session: false}, undefined), extendSession, getSchoolsPaginated);

router.get('/facility-types', passport.authenticate('jwt', {session: false}, undefined), extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'schoolFacilityTypeCodes', '/facility-codes'));

router.get('/school-category-types', passport.authenticate('jwt', {session: false}, undefined), extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'schoolCategoryTypeCodes', '/category-codes'));

module.exports = router;
