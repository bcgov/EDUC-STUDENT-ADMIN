const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getDistricts, getDistrictByDistrictId, getSchools, getSchoolsPaginated, getAuthorities, getAuthoritiesPaginated,
  getAuthorityByID
} = require('../components/institute/institute');
const utils = require('../components/utils');
const extendSession = utils.extendSession();


router.get('/districts', passport.authenticate('jwt', {session: false}, undefined), extendSession, getDistricts);

router.get('/districts/:districtId', passport.authenticate('jwt', {session: false}, undefined), extendSession, getDistrictByDistrictId);

router.get('/school', passport.authenticate('jwt', {session: false}, undefined), extendSession, getSchools);

router.get('/schoolsPaginated', passport.authenticate('jwt', {session: false}, undefined), extendSession, getSchoolsPaginated);

router.get('/authoritiesPaginated', passport.authenticate('jwt', {session: false}, undefined), extendSession, getAuthoritiesPaginated);

router.get('/authorities', passport.authenticate('jwt', {session: false}, undefined), extendSession, getAuthorities);

router.get('/authority/:id', passport.authenticate('jwt', {session: false}, undefined), extendSession, getAuthorityByID);

router.get('/facility-types', passport.authenticate('jwt', {session: false}, undefined), extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'schoolFacilityTypeCodes', '/facility-codes'));

router.get('/school-category-types', passport.authenticate('jwt', {session: false}, undefined), extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'schoolCategoryTypeCodes', '/category-codes'));

router.get('/authority-types', passport.authenticate('jwt', {session: false}, undefined), extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'authorityTypeCodes', '/authority-type-codes'));

module.exports = router;
