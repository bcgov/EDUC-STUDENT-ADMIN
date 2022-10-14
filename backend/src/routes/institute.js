const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getDistricts, getSchools, getSchoolsPaginated, getAuthorities, getAuthoritiesPaginated,
  getAuthorityByID, getSchoolByID, getDistrictByDistrictID, addNewSchoolNote
} = require('../components/institute/institute');
const utils = require('../components/utils');
const auth = require('../components/auth');
const extendSession = utils.extendSession();
const isValidSchoolAdmin = auth.isValidSchoolIndependentOffshoreAdmin || auth.isValidSchoolAdmin;

router.get('/districts', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getDistricts);

router.get('/districts/:districtId', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getDistrictByDistrictID);

router.get('/school', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getSchools);

router.post('/school/note', passport.authenticate('jwt', {session: false}, undefined), isValidSchoolAdmin, extendSession, addNewSchoolNote);

router.get('/school/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getSchoolByID);

router.get('/schoolsPaginated', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getSchoolsPaginated);

router.get('/authoritiesPaginated', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getAuthoritiesPaginated);

router.get('/authorities', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getAuthorities);

router.get('/authority/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getAuthorityByID);

module.exports = router;
