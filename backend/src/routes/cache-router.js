const auth = require('../components/auth');
const passport = require('passport');
const express = require('express');
const router = express.Router();
const {getCachedDistrictByDistrictId, getCachedDistricts, getCachedSchools, getCachedSchoolBySchoolID, getCachedAuthorities, getCachedAuthorityByAuthorityID} = require('../components/institute/institute');
const utils = require('../components/utils');

const extendSession = utils.extendSession();

router.get('/districts/:districtID', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedDistrictByDistrictId);

router.get('/districts', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedDistricts);

router.get('/school', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedSchools);

router.get('/school/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedSchoolBySchoolID);

router.get('/authorities', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedAuthorities);

router.get('/authority/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedAuthorityByAuthorityID);

router.get('/facility-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'schoolFacilityTypeCodes', '/facility-codes'));

router.get('/school-category-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'schoolCategoryTypeCodes', '/category-codes'));

router.get('/school-organization-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'schoolOrganizationTypeCodes', '/organization-codes'));

router.get('/school-neighborhood-learning-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'schoolNeighborhoodLearningTypeCodes', '/neighborhood-learning-codes'));

router.get('/authority-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'authorityTypeCodes', '/authority-type-codes'));

router.get('/grade-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'gradeCodes', '/grade-codes'));

router.get('/school-contact-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'schoolContactTypeCodes', '/school-contact-type-codes'));

router.get('/authority-contact-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), utils.getCodes('server:institute:rootURL', 'authorityContactTypeCodes', '/authority-contact-type-codes'));

module.exports = router;
