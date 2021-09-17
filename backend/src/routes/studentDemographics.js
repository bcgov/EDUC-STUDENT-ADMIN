const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const {getStudentDemographicsById} = require('../components/requests');
const utils = require('../components/utils');
const roles = require('../components/roles');
const extendSession = utils.extendSession();

const hasGMPUMPAdminRoles = auth.isValidUiTokenWithRoles('GMP & UMP', [roles.Admin.GMP, roles.Admin.UMP]);
router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), hasGMPUMPAdminRoles, extendSession, getStudentDemographicsById);

module.exports = router;
