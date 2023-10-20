const passport = require('passport');
const express = require('express');
const router = express.Router();
const { getSchoolByMincode, getPenCoordinatorByMincode } = require('../components/school');
const utils = require('../components/utils');
const extendSession = utils.extendSession();
/*
 * Get a school entity by mincode
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), extendSession, getSchoolByMincode);

/*
 * Get a pen coordinator entity by mincode
 */
router.get('/:mincode/penCoordinator', passport.authenticate('jwt', {session: false}, undefined), extendSession, getPenCoordinatorByMincode);

router.get('/fedProvSchoolCodes', passport.authenticate('jwt', {session: false}, undefined), extendSession, utils.getCodes('server:schoolAPIURL', 'fedProvSchoolCodes', '/schools/federal-province-codes', false));

module.exports = router;

