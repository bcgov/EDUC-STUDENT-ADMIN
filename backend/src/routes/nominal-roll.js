'use strict';
const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const roles = require('../components/roles');
const utils = require('../components/utils');
const {createFedProvSchoolCode, postNominalRollFile, isBeingProcessed, startProcessing, getNominalRollStudentById, getNominalRollStudents, validateNominalRollStudentDemogData, updateNominalRollStudent, postNominalRollData, isDataPosted} = require('../components/nominal-roll');

const isValidUiTokenWithStaffRoles = auth.isValidUiTokenWithRoles('NominalRoll & NominalRollReadOnly', [...roles.User.NominalRoll, ...roles.User.NominalRollReadOnly]);

const extendSession = utils.extendSession();
router.post('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidNominalRollUserToken, extendSession, postNominalRollFile);
router.get('/', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, extendSession, isBeingProcessed);
router.post('/process', passport.authenticate('jwt', {session: false}, undefined), auth.isValidNominalRollUserToken, extendSession, startProcessing);
router.get('/search', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, extendSession, getNominalRollStudents);
router.get('/nominalRollStudentIDs', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, extendSession, utils.forwardGet('getNominalRollStudentIDs', 'server:nominalRoll:rootURL', '/nominal-roll-student-ids'));
router.get('/posted', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, extendSession, isDataPosted);
router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, extendSession, getNominalRollStudentById);
router.post('/validate', passport.authenticate('jwt', {session: false}, undefined), auth.isValidNominalRollUserToken, extendSession, validateNominalRollStudentDemogData);
router.put('/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isValidNominalRollUserToken, extendSession, updateNominalRollStudent);
router.post('/postData', passport.authenticate('jwt', {session: false}, undefined), auth.isValidNominalRollUserToken, extendSession, postNominalRollData);
router.post('/fedProvSchoolCode', passport.authenticate('jwt', {session: false}, undefined), auth.isValidNominalRollUserToken, extendSession, createFedProvSchoolCode);

module.exports = router;
