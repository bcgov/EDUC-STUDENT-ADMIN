const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { validateStudentDemogData, getMergeByStudentIDAndMergeDirection, mergeStudents, demergeStudents, splitPen, moveSldRecords } = require('../components/pen-services');
const utils = require('../components/utils');
const extendSession = utils.extendSession();
const atomicStudentUpdate = require('../middlewares/atomic-student-update');
const permUtils = require('../components/permissionUtils');
const roles = require('../components/roles');

const isValidUiTokenWithSearchRoles = auth.isValidUiTokenWithRoles('StudentSearch', [...roles.User.StudentSearch]);

/*
 * Get results of student demographics validation
 */
router.post('/demog-validation', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, extendSession,  validateStudentDemogData);
router.get('/:id/student-merge', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithSearchRoles, extendSession, permUtils.isValidUUIDParam('id'), getMergeByStudentIDAndMergeDirection);
router.post('/:id/student-merge-complete', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, extendSession, atomicStudentUpdate.handleConcurrentStudentModification, mergeStudents);
router.post('/:id/student-demerge-complete', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, extendSession, atomicStudentUpdate.handleConcurrentStudentModification, demergeStudents);
router.post('/:id/split-pen', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, extendSession, atomicStudentUpdate.handleConcurrentStudentModification, splitPen);
router.post('/:id/move-sld', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, extendSession, moveSldRecords);

module.exports = router;
