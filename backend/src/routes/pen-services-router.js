const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { validateStudentDemogData, getMergeByStudentIDAndMergeDirection, mergeStudents, demergeStudents, splitPen, getMacros } = require('../components/pen-services');
const utils = require('../components/utils');
const extendSession = utils.extendSession();
const atomicStudentUpdate = require('../middlewares/atomic-student-update');
const roles = require('../components/roles');

const hasMacroRoles = auth.isValidUiTokenWithRoles('UMP & GMP & PenRequestBatch & StudentSearch & StaffAdministration', [...roles.User.UMP, ...roles.User.GMP, ...roles.User.PenRequestBatch, ...roles.User.StudentSearch, ...roles.User.StaffAdministration]);
/*
 * Get results of student demographics validation
 */
router.post('/demog-validation', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, extendSession,  validateStudentDemogData);
router.get('/:id/student-merge', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, extendSession, getMergeByStudentIDAndMergeDirection);
router.post('/:id/student-merge-complete', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, extendSession, atomicStudentUpdate.handleConcurrentStudentModification, mergeStudents);
router.post('/:id/student-demerge-complete', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, extendSession, atomicStudentUpdate.handleConcurrentStudentModification, demergeStudents);
router.post('/:id/split-pen', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStudentSearchAdmin, extendSession, atomicStudentUpdate.handleConcurrentStudentModification, splitPen);
router.get('/macros', passport.authenticate('jwt', {session: false}, undefined), hasMacroRoles, getMacros);
router.put('/macros/:macroId', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStaffAdministrationAdmin, utils.updateMacroByMacroId('server:penServices:rootURL', '/pen-services-macro'));
router.post('/macros', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStaffAdministrationAdmin, utils.createMacro('server:penServices:rootURL', '/pen-services-macro'));

module.exports = router;
