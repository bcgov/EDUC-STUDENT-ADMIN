const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getDistricts, getSchools, getSchoolsPaginated, getAuthorities, getAuthoritiesPaginated,
  getAuthorityByID, getSchoolByID, getCachedDistrictByDistrictId,getDistrictByDistrictID,getCachedDistricts
} = require('../components/institute/institute');
const utils = require('../components/utils');
const auth = require('../components/auth');
const extendSession = utils.extendSession();

router.get('/districts', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getDistricts);

router.get('/cache/districts/:districtID', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedDistrictByDistrictId);

router.get('/cache/districts', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedDistricts);

router.get('/districts/:districtId', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getDistrictByDistrictID);

router.get('/school', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getSchools);

router.get('/school/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getSchoolByID);

router.get('/schoolsPaginated', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getSchoolsPaginated);

router.get('/authoritiesPaginated', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getAuthoritiesPaginated);

router.get('/authorities', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getAuthorities);

router.get('/authority/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getAuthorityByID);

router.get('/facility-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'schoolFacilityTypeCodes', '/facility-codes'));

router.get('/school-category-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'schoolCategoryTypeCodes', '/category-codes'));

router.get('/school-contact-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'schoolContactTypeCodes', '/school-contact-type-codes'));

router.get('/school-organization-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'schoolOrganizationTypeCodes', '/organization-codes'));

router.get('/school-neighborhood-learning-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'schoolNeighborhoodLearningTypeCodes', '/neighborhood-learning-codes'));

router.get('/school-contact-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'schoolContactTypeCodes', '/school-contact-type-codes'));

router.get('/authority-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'authorityTypeCodes', '/authority-type-codes'));

router.get('/grade-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'gradeCodes', '/grade-codes'));

router.get('/authority-contact-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'authorityContactTypeCodes', '/authority-contact-type-codes'));

module.exports = router;
