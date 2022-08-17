'use strict';
const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const utils = require('../components/utils');
const { getExchanges, createExchange, getExchange, claimAllExchanges, markAs, getEdxUsers, findPrimaryEdxActivationCode, generateOrRegeneratePrimaryEdxActivationCode, updateEdxUserRoles,
  schoolUserActivationInvite, createSecureExchangeComment, uploadDocumentToExchange, getExchangeDocumentById, markAsClosed, claimExchange, removeDocumentFromExchange,
  removeUserSchoolAccess, relinkUserSchoolAccess, createSecureExchangeStudent, removeSecureExchangeStudent, createSecureExchangeNote, removeSecureExchangeNote
} = require('../components/edx/exchange');

const extendSession = utils.extendSession();

router.get('/users/ministryTeams', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, utils.forwardGet('getMinistryTeams', 'server:edx:rootURL', '/users/ministry-teams'));

router.get('/users/user-schools/mincodes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, utils.forwardGet('getMinCodes', 'server:edx:rootURL', '/users/user-schools/mincodes'));
router.get('/users/roles', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, utils.forwardGet('getUserRoles', 'server:edx:rootURL', '/users/roles'));
router.get('/users', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, getEdxUsers);
router.post('/users/roles', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, updateEdxUserRoles);
router.post('/users/remove', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, removeUserSchoolAccess);
router.post('/users/relink', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, relinkUserSchoolAccess);

router.get('/users/activation-code/primary/:mincode', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, findPrimaryEdxActivationCode);
router.post('/users/activation-code/primary/:mincode', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, generateOrRegeneratePrimaryEdxActivationCode);

//edx exchange routes
router.get('/exchange', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, getExchanges);
router.post('/exchange/claim', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, claimAllExchanges);
router.post('/exchange/:secureExchangeID/students', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, createSecureExchangeStudent);
router.post('/exchange/claimOne', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, claimExchange);
router.get('/exchange/statuses', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, utils.cacheMiddleware(), utils.getCodes('server:edx:exchangeStatusesURL', 'exchangeStatuses'));
router.get('/exchange/file-requirements', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, utils.cacheMiddleware(), utils.getCodes('server:edx:fileRequirementsURL', 'fileRequirements'));
router.put('/exchange/:secureExchangeID/markAs', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, markAs);
router.put('/exchange/:secureExchangeID/markAsClosed', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, markAsClosed);
router.put('/exchange/:secureExchangeID/removeDoc/:documentID', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, removeDocumentFromExchange);
router.put('/exchange/:secureExchangeID/removeStudent/:studentID', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, removeSecureExchangeStudent);
router.put('/exchange/:secureExchangeID/removeNote/:noteID', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, removeSecureExchangeNote);
router.get('/exchange/:secureExchangeID', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, getExchange);
router.post('/exchange/:secureExchangeID/comments', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken,extendSession, createSecureExchangeComment);
router.post('/exchange/:secureExchangeID/notes', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken,extendSession, createSecureExchangeNote);
router.post('/exchange', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, createExchange);
router.post('/exchange/:secureExchangeID/documents', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, extendSession, uploadDocumentToExchange);
router.get('/exchange/:secureExchangeID/documents/:documentId', auth.isValidExchangeUserToken, getExchangeDocumentById());
router.post('/school-user-activation-invite', passport.authenticate('jwt', {session: false}, undefined), auth.isValidExchangeUserToken, schoolUserActivationInvite);
module.exports = router;
