'use strict';
const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const utils = require('../components/utils');
const permUtils = require('../components/permissionUtils');
const perm = require('../util/Permission');
const {
  getExchanges,
  createExchange,
  getExchange,
  claimAllExchanges,
  markAs,
  getEdxDistrictUsers,
  getEdxSchoolUsers,
  findSchoolPrimaryEdxActivationCode,
  findDistrictPrimaryEdxActivationCode,
  generateOrRegeneratePrimaryEdxActivationDistrictCode,
  generateOrRegeneratePrimaryEdxActivationSchoolCode,
  updateEdxUserSchoolRoles,
  updateEdxUserDistrictRoles,
  schoolUserActivationInvite,
  createSecureExchangeComment,
  uploadDocumentToExchange,
  getExchangeDocumentById,
  markExchangeStatusAs,
  claimExchange,
  removeDocumentFromExchange,
  removeUserSchoolAccess,
  removeUserDistrictAccess,
  relinkUserSchoolAccess,
  relinkUserDistrictAccess,
  createSecureExchangeStudent,
  removeSecureExchangeStudent,
  createSecureExchangeNote,
  removeSecureExchangeNote,
  getExchangeStats,
  districtUserActivationInvite,
  createSchool,
  findAllSchoolInvitations,
  findAllDistrictInvitations,
  uploadOnboardingFile

} = require('../components/edx/exchange');

const extendSession = utils.extendSession();
const PERMISSION = perm.PERMISSION;

router.get('/users/ministryTeams', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION), extendSession, utils.forwardGet('getMinistryTeams', 'server:edx:rootURL', '/users/ministry-teams'));

router.get('/valid-schools-for-messaging', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION), extendSession, utils.forwardGet('getUserSchools', 'server:edx:rootURL', '/users/user-schools'));
router.get('/valid-districts-for-messaging', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION), extendSession, utils.forwardGet('getUserDistricts', 'server:edx:rootURL', '/users/user-districts'));

//school-district user access routes
router.get('/users/roles', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, utils.forwardGet('getUserRoles', 'server:edx:rootURL', '/users/roles'));

router.get('/users/school/:schoolID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EDX_SCHOOL_USERS_PERMISSION), extendSession, getEdxSchoolUsers);
router.get('/users/district/:districtID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EDX_DISTRICT_USERS_PERMISSION), extendSession, getEdxDistrictUsers);

router.post('/users/roles/school', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EDX_SCHOOL_USERS_PERMISSION), extendSession, updateEdxUserSchoolRoles);
router.post('/users/roles/district', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EDX_DISTRICT_USERS_PERMISSION), extendSession, updateEdxUserDistrictRoles);

router.post('/users/remove/school', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EDX_SCHOOL_USERS_PERMISSION), extendSession, removeUserSchoolAccess);
router.post('/users/remove/district', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EDX_DISTRICT_USERS_PERMISSION), extendSession, removeUserDistrictAccess);

router.post('/users/relink/school', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EDX_SCHOOL_USERS_PERMISSION), extendSession, relinkUserSchoolAccess);
router.post('/users/relink/district', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EDX_DISTRICT_USERS_PERMISSION), extendSession, relinkUserDistrictAccess);

router.get('/users/activation-code/primary/school/:instituteIdentifier', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EDX_SCHOOL_USERS_PERMISSION), extendSession, findSchoolPrimaryEdxActivationCode);
router.get('/users/activation-code/primary/district/:instituteIdentifier', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EDX_DISTRICT_USERS_PERMISSION), extendSession, findDistrictPrimaryEdxActivationCode);

router.post('/users/activation-code/primary/school/:instituteIdentifier', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EDX_SCHOOL_USERS_PERMISSION), extendSession, generateOrRegeneratePrimaryEdxActivationSchoolCode);
router.post('/users/activation-code/primary/district/:instituteIdentifier', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EDX_DISTRICT_USERS_PERMISSION), extendSession, generateOrRegeneratePrimaryEdxActivationDistrictCode);

router.post('/school-user-activation-invite', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EDX_SCHOOL_USERS_PERMISSION), schoolUserActivationInvite);
router.post('/district-user-activation-invite', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EDX_DISTRICT_USERS_PERMISSION), districtUserActivationInvite);

router.get('/findAll-school-invites', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EDX_SCHOOL_USERS_PERMISSION), extendSession, findAllSchoolInvitations);
router.get('/findAll-district-invites', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EDX_DISTRICT_USERS_PERMISSION), extendSession, findAllDistrictInvitations);

//edx exchange routes
router.get('/exchange', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION), extendSession, getExchanges);
router.get('/exchange/stats/:teamRole', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EXCHANGE_PEN_INBOX_PERMISSION), extendSession, getExchangeStats);

router.post('/exchange/claim', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION), extendSession, claimAllExchanges);
router.post('/exchange/:secureExchangeID/students', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION), extendSession, createSecureExchangeStudent);

router.post('/exchange/claimOne', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION), extendSession, claimExchange);

router.get('/exchange/statuses', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION), utils.cacheMiddleware(), utils.getCodes('server:edx:exchangeStatusesURL', 'exchangeStatuses'));
router.get('/exchange/file-requirements', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION), utils.cacheMiddleware(), utils.getCodes('server:edx:fileRequirementsURL', 'fileRequirements'));
router.put('/exchange/:secureExchangeID/markAs', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION), extendSession, markAs);
router.put('/exchange/:secureExchangeID/markExchangeStatusAs/:status', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION), extendSession, markExchangeStatusAs);

router.put('/exchange/:secureExchangeID/removeDoc/:documentID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION), extendSession, removeDocumentFromExchange);
router.put('/exchange/:secureExchangeID/removeStudent/:studentID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION), extendSession, removeSecureExchangeStudent);
router.put('/exchange/:secureExchangeID/removeNote/:noteID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION), extendSession, removeSecureExchangeNote);

router.get('/exchange/:secureExchangeID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION), extendSession, getExchange);
router.post('/exchange/:secureExchangeID/comments', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION),extendSession, createSecureExchangeComment);
router.post('/exchange/:secureExchangeID/notes', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION),extendSession, createSecureExchangeNote);
router.post('/exchange', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION), extendSession, createExchange);
router.post('/exchange/:secureExchangeID/documents', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION), extendSession, uploadDocumentToExchange);
router.get('/exchange/:secureExchangeID/documents/:documentId', permUtils.checkUserHasPermission(PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION), getExchangeDocumentById());
router.post('/exchange/onboarding-file', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.MANAGE_EDX_SCHOOL_USERS_PERMISSION),extendSession, uploadOnboardingFile);


// Create School Saga
router.post('/create-school', passport.authenticate('jwt', {session: false}, undefined), permUtils.hasPermissionToAddSchool(), createSchool);

module.exports = router;
