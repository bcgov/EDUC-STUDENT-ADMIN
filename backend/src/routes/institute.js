const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getDistricts, getSchools, getSchoolsPaginated, getAuthoritiesPaginated,
  getAuthorityByID, getSchoolByID, getDistrictByDistrictID, addNewSchoolNote, updateSchoolContact, updateAuthority, updateAuthorityContact,
  addNewAuthorityNote, updateSchool, addSchoolContact
} = require('../components/institute/institute');
const utils = require('../components/utils');
const auth = require('../components/auth');
const extendSession = utils.extendSession();
const {getCodes} = require('../components/utils');
const {CACHE_KEYS} = require('../components/constants');

router.get('/districts', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getDistricts);

router.get('/districtContactTypeCodes', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCodes('server:institute:rootURL', CACHE_KEYS.DISTRICT_CONTACT_TYPE_CODES, '/district-contact-type-codes'));

router.get('/districts/:districtId', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getDistrictByDistrictID);

router.post('/authority/contact', passport.authenticate('jwt', {session: false}, undefined), auth.isValidIndependentAuthorityAdmin, extendSession, updateAuthorityContact);

router.get('/school', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getSchools);

router.post('/school/note', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, addNewSchoolNote);

router.post('/school/contact', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, updateSchoolContact);

router.post('/:schoolID/contact', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, addSchoolContact);

router.get('/school/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getSchoolByID);

router.put('/school/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, updateSchool);

router.get('/schoolsPaginated', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getSchoolsPaginated);

router.get('/authoritiesPaginated', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getAuthoritiesPaginated);

router.post('/authority/note', passport.authenticate('jwt', {session: false}, undefined), auth.isValidIndependentAuthorityAdmin, extendSession, addNewAuthorityNote);

router.post('/authority/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isValidIndependentAuthorityAdmin, extendSession, updateAuthority);

router.get('/authority/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getAuthorityByID);

module.exports = router;
