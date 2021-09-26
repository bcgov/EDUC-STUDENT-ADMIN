const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const utils = require('../components/utils');
const { addSagaStatus, updateMacroByMacroId, createMacro } = require('../components/macro');
const extendSession = utils.extendSession();
const roles = require('../components/roles');

const hasMacroRoles = auth.isValidUiTokenWithRoles('UMP & GMP & PenRequestBatch & StudentSearch & StaffAdministration', [...roles.User.UMP, ...roles.User.GMP, ...roles.User.PenRequestBatch, ...roles.User.StudentSearch, ...roles.User.StaffAdministration]);


router.get('/', passport.authenticate('jwt', {session: false}, undefined), hasMacroRoles, utils.forwardGet('getMacros', 'server:macro:penMacroURL', null, addSagaStatus));

router.post('/:macroId/updateMacro', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStaffAdministrationAdmin, extendSession, updateMacroByMacroId);

router.post('/createMacro', passport.authenticate('jwt', {session: false}, undefined), auth.isValidStaffAdministrationAdmin, extendSession, createMacro);

module.exports = router;
