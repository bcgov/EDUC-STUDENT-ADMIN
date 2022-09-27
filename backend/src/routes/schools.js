const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getSchoolByMincode, getPenCoordinatorByMincode, getPenCoordinators, updatePenCoordinatorByMincode } = require('../components/school');
const utils = require('../components/utils');
const auth = require('../components/auth');
const extendSession = utils.extendSession();
const roles = require('../components/roles');

const isValidUiTokenWithEditRoles = auth.isValidUiTokenWithRoles('StaffAdministration & NominalRoll', [roles.Admin.StaffAdministration, roles.Admin.NominalRoll, roles.Admin.EDX]);

/*
 * Get a school entity by mincode
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), extendSession, getSchoolByMincode);

/*
 * Get a pen coordinator entity by mincode
 */
router.get('/:mincode/penCoordinator', passport.authenticate('jwt', {session: false}, undefined), extendSession, getPenCoordinatorByMincode);

/*
 * Update a pen coordinator entity by mincode
 */
router.put('/:mincode/penCoordinator', passport.authenticate('jwt', {session: false}, undefined), isValidUiTokenWithEditRoles, extendSession, updatePenCoordinatorByMincode);

/*
 * Get all pen coordinator entities
 */
router.get('/penCoordinators', passport.authenticate('jwt', {session: false}, undefined), extendSession, getPenCoordinators);

router.get('/fedProvSchoolCodes', passport.authenticate('jwt', {session: false}, undefined), extendSession, utils.getCodes('server:schoolAPIURL', 'fedProvSchoolCodes', '/schools/federal-province-codes', false));

module.exports = router;

