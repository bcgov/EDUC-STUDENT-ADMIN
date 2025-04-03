'use strict';
const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const roles = require('../components/roles');
const utils = require('../components/utils');
const {createFedProvSchoolCode, postNominalRollFile, isBeingProcessed, startProcessing, getNominalRollStudentById, getNominalRollStudents, validateNominalRollStudentDemogData, updateNominalRollStudent, postNominalRollData, isDataPosted} = require('../components/nominal-roll');
const permUtils = require('../components/permissionUtils');

const isValidUiTokenWithStaffRoles = auth.isValidUiTokenWithRoles('NominalRoll & NominalRollReadOnly', [...roles.User.NominalRoll, ...roles.User.NominalRollReadOnly]);

const extendSession = utils.extendSession();
router.post('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidNominalRollUserToken, extendSession, postNominalRollFile);
router.get('/', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, extendSession, isBeingProcessed);
router.post('/process', passport.authenticate('jwt', {session: false}, undefined), auth.isValidNominalRollUserToken, extendSession, startProcessing);
router.get('/search', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, auth.isValidNominalRollUserToken, extendSession, getNominalRollStudents);
router.get('/nominalRollStudentIDs', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, auth.isValidNominalRollUserToken, extendSession, utils.forwardGet('getNominalRollStudentIDs', 'server:nominalRoll:rootURL', '/nominal-roll-student-ids'));
router.get('/posted', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, auth.isValidNominalRollUserToken, extendSession, isDataPosted);
router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, auth.isValidNominalRollUserToken, extendSession, permUtils.isValidUUIDParam('id'), getNominalRollStudentById);
router.post('/validate', passport.authenticate('jwt', {session: false}, undefined), auth.isValidNominalRollUserToken, extendSession, validateNominalRollStudentDemogData);
router.put('/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isValidNominalRollUserToken, extendSession, permUtils.isValidUUIDParam('id'), updateNominalRollStudent);
router.post('/postData', passport.authenticate('jwt', {session: false}, undefined), auth.isValidNominalRollUserToken, extendSession, postNominalRollData);
router.post('/fedProvSchoolCode', passport.authenticate('jwt', {session: false}, undefined), auth.isValidNominalRollUserToken, extendSession, createFedProvSchoolCode);
router.get('/fedProvSchoolCodes', passport.authenticate('jwt', {session: false}, undefined), extendSession, utils.getCodes('server:nominalRoll:rootURL', 'fedProvSchoolCodes', '/federal-province-codes', false));

module.exports = router;
