const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getDistricts, getSchools, getSchoolsPaginated, getAuthoritiesPaginated,
  getAuthorityByID, getSchoolByID, getDistrictByDistrictID, addNewSchoolNote, updateSchoolNote, deleteSchoolNote, updateSchoolContact, updateAuthority, addAuthorityContact, updateAuthorityContact, deleteAuthorityContact,
  addNewAuthorityNote, updateAuthorityNote, deleteAuthorityNote, updateSchool, addSchool, addSchoolContact, deleteSchoolContact, updateDistrict, updateDistrictContact, deleteDistrictContact, addAuthority,
  addDistrictContact, addNewDistrictNote, updateDistrictNote, deleteDistrictNote, moveSchool, getSchoolHistoryPaginated,
  getStudentRegistrationContacts, getStudentRegistrationContactByMincode, getSchoolByMincode, getDistrictNotes, getSchoolNotes, getAuthorityNotes
} = require('../components/institute/institute');
const utils = require('../components/utils');
const auth = require('../components/auth');
const extendSession = utils.extendSession();
const {getCodes} = require('../components/utils');
const {CACHE_KEYS} = require('../util/constants');


router.get('/district', passport.authenticate('jwt', {session: false}, undefined), utils.checkUserHasPermission('VIEW_DISTRICT_PERMISSION'), extendSession, getDistricts);

router.get('/district/:districtId', passport.authenticate('jwt', {session: false}, undefined), utils.checkUserHasPermission('VIEW_DISTRICT_PERMISSION'), extendSession, getDistrictByDistrictID);

router.put('/district/:districtId', passport.authenticate('jwt', {session: false}, undefined), auth.isValidDistrictAdmin, extendSession, updateDistrict);

router.get('/studentRegistrationContacts', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getStudentRegistrationContacts);

router.get('/studentRegistrationContact/:mincode', passport.authenticate('jwt', {session: false}, undefined), extendSession, getStudentRegistrationContactByMincode);

router.put('/district/contact/:contactId', passport.authenticate('jwt', {session: false}, undefined), auth.isValidDistrictAdmin, extendSession, updateDistrictContact);

router.delete('/district/contact/:districtId/:contactId', passport.authenticate('jwt', {session: false}, undefined), auth.isValidDistrictAdmin, extendSession, deleteDistrictContact);

router.get('/district/:districtId/notes', passport.authenticate('jwt', {session: false}, undefined), utils.checkUserHasPermission('VIEW_DISTRICT_PERMISSION'), extendSession, getDistrictNotes);

router.post('/district/note', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, addNewDistrictNote);

router.put('/district/note/:noteId', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, updateDistrictNote);

router.delete('/district/note/:districtId/:noteId', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, deleteDistrictNote);

router.post('/district/contact', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, addDistrictContact);

router.put('/authority/contact/:contactId', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, updateAuthorityContact);

router.delete('/authority/contact/:independentAuthorityId/:contactId', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, deleteAuthorityContact);

router.post('/authority', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, addAuthority);

router.post('/authority/contact', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, addAuthorityContact);

router.get('/school', passport.authenticate('jwt', {session: false}, undefined), utils.checkUserHasPermission('VIEW_SCHOOL_PERMISSION'), extendSession, getSchools);

router.post('/school', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, addSchool);

router.get('/school/:schoolId/notes', passport.authenticate('jwt', {session: false}, undefined), utils.checkUserHasPermission('VIEW_SCHOOL_PERMISSION'), extendSession, getSchoolNotes);

router.post('/school/note', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, addNewSchoolNote);

router.put('/school/note/:noteId', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, updateSchoolNote);

router.delete('/school/note/:schoolId/:noteId', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, deleteSchoolNote);

router.delete('/school/contact/:schoolId/:contactId', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, deleteSchoolContact);

router.put('/school/contact/:contactId', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, updateSchoolContact);

router.post('/school/contact', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, addSchoolContact);

router.get('/school/:id', passport.authenticate('jwt', {session: false}, undefined), utils.checkUserHasPermission('VIEW_SCHOOL_PERMISSION'), extendSession, getSchoolByID);

router.get('/school/mincode/:mincode', passport.authenticate('jwt', {session: false}, undefined), utils.checkUserHasPermission('VIEW_SCHOOL_PERMISSION'), extendSession, getSchoolByMincode);

router.put('/school/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, updateSchool);

router.get('/schoolsPaginated', passport.authenticate('jwt', {session: false}, undefined), utils.checkUserHasPermission('VIEW_SCHOOL_PERMISSION'), extendSession, getSchoolsPaginated);

router.get('/schoolHistoryPaginated', passport.authenticate('jwt', {session: false}, undefined), utils.checkUserHasPermission('VIEW_SCHOOL_PERMISSION'), extendSession, getSchoolHistoryPaginated);

router.post('/school/moveSchool', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, moveSchool);

router.get('/authoritiesPaginated', passport.authenticate('jwt', {session: false}, undefined), utils.checkUserHasPermission('VIEW_AUTHORITY_PERMISSION'), extendSession, getAuthoritiesPaginated);

router.get('/authority/:independentAuthorityId/notes', passport.authenticate('jwt', {session: false}, undefined), utils.checkUserHasPermission('VIEW_AUTHORITY_PERMISSION'), extendSession, getAuthorityNotes);

router.post('/authority/note', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, addNewAuthorityNote);

router.put('/authority/note/:noteId', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, updateAuthorityNote);

router.delete('/authority/note/:independentAuthorityId/:noteId', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, deleteAuthorityNote);

router.post('/authority/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, updateAuthority);

router.get('/authority/:id', passport.authenticate('jwt', {session: false}, undefined), utils.checkUserHasPermission('VIEW_AUTHORITY_PERMISSION'), extendSession, getAuthorityByID);

router.get(
  '/reporting-requirement-codes',
  passport.authenticate('jwt', {session: false}, undefined),
  auth.isLoggedInUser,
  getCodes(
    'server:institute:rootURL',
    CACHE_KEYS.SCHOOL_REPORTING_REQUIREMENT_CODES,
    '/reporting-requirement-codes'
  )
);


module.exports = router;
