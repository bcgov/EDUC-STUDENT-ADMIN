'use strict';
const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const utils = require('../components/utils');
const {postNominalRollFile, isBeingProcessed, startProcessing, getNominalRollStudentById, getNominalRollStudents, validateNominalRollStudentDemogData, updateNominalRollStudent} = require('../components/nominal-roll');

const extendSession = utils.extendSession();
router.post('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidNominalRollAdmin, extendSession, postNominalRollFile);
router.get('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidNominalRollAdmin, extendSession, isBeingProcessed);
router.post('/process', passport.authenticate('jwt', {session: false}, undefined), auth.isValidNominalRollAdmin, extendSession, startProcessing);
router.get('/search', passport.authenticate('jwt', {session: false}, undefined), auth.isValidNominalRollAdmin, extendSession, getNominalRollStudents);
router.get('/nominalRollStudentIDs', passport.authenticate('jwt', {session: false}, undefined), auth.isValidNominalRollAdmin, extendSession, utils.forwardGet('getNominalRollStudentIDs', 'server:nominalRoll:rootURL', '/nominal-roll-student-ids'));
router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isValidNominalRollAdmin, extendSession, getNominalRollStudentById);
router.post('/validate', passport.authenticate('jwt', {session: false}, undefined), auth.isValidNominalRollAdmin, extendSession, validateNominalRollStudentDemogData);
router.put('/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isValidNominalRollAdmin, extendSession, updateNominalRollStudent);
module.exports = router;
