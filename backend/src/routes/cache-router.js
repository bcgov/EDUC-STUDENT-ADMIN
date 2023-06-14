const auth = require('../components/auth');
const passport = require('passport');
const express = require('express');
const router = express.Router();
const {getCachedDistrictByDistrictId, getCachedDistricts, getCachedSchools, getCachedSchoolBySchoolID, getCachedAuthorities, getCachedAuthorityByAuthorityID,getCachedSchoolCategoryFacilityTypes,getCachedInstituteData} = require('../components/institute/institute');
const utils = require('../components/utils');
const constants = require('../util/constants');

const extendSession = utils.extendSession();

router.get('/district/:districtId', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedDistrictByDistrictId);

router.get('/district', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedDistricts);

router.get('/school', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedSchools);

router.get('/school/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedSchoolBySchoolID);

router.get('/authority', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedAuthorities);

router.get('/authority/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedAuthorityByAuthorityID);

router.get('/school-category-facility-type', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedSchoolCategoryFacilityTypes);

router.get('/facility-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedInstituteData(constants.CACHE_KEYS.FACILITY_TYPES,'server:institute:facilityTypeURL'));

router.get('/district-contact-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedInstituteData(constants.CACHE_KEYS.DISTRICT_CONTACT_TYPE_CODES,'server:institute:facilityTypeURL'));

router.get('/facility-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedInstituteData(constants.CACHE_KEYS.FACILITY_TYPES,'server:institute:facilityTypeURL'));

router.get('/school-category-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedInstituteData(constants.CACHE_KEYS.SCHOOL_CATEGORY_TYPES,'server:institute:categoryCodesURL'));

router.get('/school-organization-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession,getCachedInstituteData(constants.CACHE_KEYS.SCHOOL_ORGANIZATION_TYPES,'server:institute:organizationCodeURL'));

router.get('/school-neighborhood-learning-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedInstituteData(constants.CACHE_KEYS.SCHOOL_NEIGHBOURHOOD_LEARNING_TYPES,'server:institute:neighbourhoodLearningURL'));

router.get('/authority-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), getCachedInstituteData(constants.CACHE_KEYS.AUTHORITY_TYPES,'server:institute:authorityTypeCodesURL'));

router.get('/grade-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), getCachedInstituteData(constants.CACHE_KEYS.GRADE_CODES,'server:institute:gradeCodeURL'));

router.get('/province-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), getCachedInstituteData(constants.CACHE_KEYS.PROVINCE_CODES,'server:institute:provinceCodesURL'));

router.get('/country-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), getCachedInstituteData(constants.CACHE_KEYS.COUNTRY_CODES,'server:institute:countryCodesURL'));

router.get('/school-contact-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), getCachedInstituteData(constants.CACHE_KEYS.SCHOOL_CONTACT_TYPES,'server:institute:schoolContactTypeCodesURL'));

router.get('/authority-contact-types', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.cacheMiddleware(), getCachedInstituteData(constants.CACHE_KEYS.AUTHORITY_CONTACT_TYPES,'server:institute:authorityContactTypeCodesURL'));

module.exports = router;
