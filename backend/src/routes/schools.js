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

module.exports = router;

