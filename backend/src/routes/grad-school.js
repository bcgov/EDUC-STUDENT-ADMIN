const passport = require('passport');
const express = require('express');
const router = express.Router();
const utils = require('../components/utils');
const extendSession = utils.extendSession();
const permUtils = require('../components/permissionUtils');
const perm = require('../util/Permission');
const {getGradSchool, updateGradSchool, getGradSchools} = require('../components/grad-school');
const auth = require('../components/auth');

const PERMISSION = perm.PERMISSION;

router.get('/:schoolID', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, permUtils.isValidUUIDParam('schoolID'), permUtils.checkUserHasPermission(PERMISSION.VIEW_GRAD_DATA_COLLECTION_PERMISSION), extendSession, getGradSchool);
router.put('/:schoolID', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, permUtils.isValidUUIDParam('schoolID'), permUtils.checkUserHasPermission(PERMISSION.EDIT_GRAD_DATA_COLLECTION_PERMISSION), extendSession, updateGradSchool);
router.get('/', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getGradSchools);
module.exports = router;
