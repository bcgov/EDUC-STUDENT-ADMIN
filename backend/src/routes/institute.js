const passport = require('passport');
const express = require('express');
const router = express.Router();
const perm = require('../util/Permission');
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
const PERMISSION = perm.PERMISSION;
const permUtils = require('../components/permissionUtils');

router.get('/district', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_DISTRICT_PERMISSION), extendSession, getDistricts);

router.get('/district/:districtId', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_DISTRICT_PERMISSION), extendSession, getDistrictByDistrictID);

router.put('/district/:districtId', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_DISTRICT_PERMISSION), extendSession, updateDistrict);

router.get('/studentRegistrationContacts', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_REGISTRATION_CONTACTS_PERMISSION), extendSession, getStudentRegistrationContacts);

router.get('/studentRegistrationContact/:mincode', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_REGISTRATION_CONTACTS_PERMISSION), extendSession, getStudentRegistrationContactByMincode);

router.put('/district/contact/:contactId', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_DISTRICT_PERMISSION), extendSession, updateDistrictContact);

router.delete('/district/contact/:districtId/:contactId', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_DISTRICT_PERMISSION), extendSession, deleteDistrictContact);

router.get('/district/:districtId/notes', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_DISTRICT_PERMISSION), extendSession, getDistrictNotes);

router.post('/district/note', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_DISTRICT_PERMISSION), extendSession, addNewDistrictNote);

router.put('/district/note/:noteId', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_DISTRICT_PERMISSION), extendSession, updateDistrictNote);

router.delete('/district/note/:districtId/:noteId', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_DISTRICT_PERMISSION), extendSession, deleteDistrictNote);

router.post('/district/contact', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_DISTRICT_PERMISSION), extendSession, addDistrictContact);

router.put('/authority/contact/:contactId', passport.authenticate('jwt', {session: false}, undefined), permUtils.hasPermissionToUpdateAuthority(), extendSession, updateAuthorityContact);

router.delete('/authority/contact/:independentAuthorityId/:contactId', passport.authenticate('jwt', {session: false}, undefined), permUtils.hasPermissionToUpdateAuthority(), extendSession, deleteAuthorityContact);

router.post('/authority', passport.authenticate('jwt', {session: false}, undefined), permUtils.hasPermissionToAddAuthority(), extendSession, addAuthority);

router.post('/authority/contact', passport.authenticate('jwt', {session: false}, undefined), permUtils.hasPermissionToUpdateAuthority(), extendSession, addAuthorityContact);

router.get('/school', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_SCHOOL_PERMISSION), extendSession, getSchools);

router.post('/school', passport.authenticate('jwt', {session: false}, undefined), permUtils.hasPermissionToAddSchool(), extendSession, addSchool);

router.get('/school/:schoolId/notes', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_SCHOOL_PERMISSION), extendSession, getSchoolNotes);

router.post('/school/note', passport.authenticate('jwt', {session: false}, undefined), permUtils.hasPermissionToAddOrUpdateSchool(), extendSession, addNewSchoolNote);

router.put('/school/note/:noteId', passport.authenticate('jwt', {session: false}, undefined), permUtils.hasPermissionToAddOrUpdateSchool(), extendSession, updateSchoolNote);

router.delete('/school/note/:schoolId/:noteId', passport.authenticate('jwt', {session: false}, undefined), permUtils.hasPermissionToAddOrUpdateSchool(), extendSession, deleteSchoolNote);

router.delete('/school/contact/:schoolId/:contactId', passport.authenticate('jwt', {session: false}, undefined), permUtils.hasPermissionToAddOrUpdateSchool(), extendSession, deleteSchoolContact);

router.put('/school/contact/:contactId', passport.authenticate('jwt', {session: false}, undefined), permUtils.hasPermissionToAddOrUpdateSchool(), extendSession, updateSchoolContact);

router.post('/school/contact', passport.authenticate('jwt', {session: false}, undefined), permUtils.hasPermissionToAddOrUpdateSchool(), extendSession, addSchoolContact);

router.get('/school/:id', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_SCHOOL_PERMISSION), extendSession, getSchoolByID);

router.get('/school/mincode/:mincode', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_SCHOOL_PERMISSION), extendSession, getSchoolByMincode);

router.put('/school/:id', passport.authenticate('jwt', {session: false}, undefined), permUtils.hasPermissionToAddOrUpdateSchool(), extendSession, updateSchool);

router.get('/schoolsPaginated', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_SCHOOL_PERMISSION), extendSession, getSchoolsPaginated);

router.get('/schoolHistoryPaginated', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_SCHOOL_PERMISSION), extendSession, getSchoolHistoryPaginated);

router.post('/school/moveSchool', passport.authenticate('jwt', {session: false}, undefined), permUtils.hasPermissionToMoveSchool(), extendSession, moveSchool);

router.get('/authoritiesPaginated', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_AUTHORITY_PERMISSION), extendSession, getAuthoritiesPaginated);

router.get('/authority/:independentAuthorityId/notes', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_AUTHORITY_PERMISSION), extendSession, getAuthorityNotes);

router.post('/authority/note', passport.authenticate('jwt', {session: false}, undefined), permUtils.hasPermissionToUpdateAuthority(), extendSession, addNewAuthorityNote);

router.put('/authority/note/:noteId', passport.authenticate('jwt', {session: false}, undefined), permUtils.hasPermissionToUpdateAuthority(), extendSession, updateAuthorityNote);

router.delete('/authority/note/:independentAuthorityId/:noteId', passport.authenticate('jwt', {session: false}, undefined), permUtils.hasPermissionToUpdateAuthority(), extendSession, deleteAuthorityNote);

router.post('/authority/:id', passport.authenticate('jwt', {session: false}, undefined), permUtils.hasPermissionToUpdateAuthority(), extendSession, updateAuthority);

router.get('/authority/:id', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_AUTHORITY_PERMISSION), extendSession, getAuthorityByID);

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
