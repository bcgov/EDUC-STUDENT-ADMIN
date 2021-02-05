const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { getSchoolByMincode } = require('../components/school');
const utils = require('../components/utils');
const roles = require('../components/roles');
const extendSession = utils.extendSession();

const isValidUiTokenWithStaffRoles = auth.isValidUiTokenWithRoles('PenRequestBatch & StudentSearch', [...roles.User.PenRequestBatch, ...roles.User.StudentSearch]);

/*
 * Get a school entity by mincode
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithStaffRoles, extendSession, getSchoolByMincode);

module.exports = router;

