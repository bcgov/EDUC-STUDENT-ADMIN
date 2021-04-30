const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { getSchoolByMincode, getPenCoordinatorByMincode } = require('../components/school');
const utils = require('../components/utils');
const roles = require('../components/roles');
const extendSession = utils.extendSession();

const isValidUiTokenWithStaffRoles = auth.isValidUiTokenWithRoles('PenRequestBatch & StudentSearch', [...roles.User.PenRequestBatch, ...roles.User.StudentSearch]);

/*
 * Get a school entity by mincode
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, extendSession, getSchoolByMincode);

/*
 * Get a pen coordinator entity by mincode
 */
router.get('/:mincode/penCoordinator', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, extendSession, getPenCoordinatorByMincode);

module.exports = router;

