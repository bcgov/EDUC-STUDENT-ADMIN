const passport = require('passport');
const express = require('express');
const router = express.Router();
const utils = require('../components/utils');
const extendSession = utils.extendSession();
const permUtils = require('../components/permissionUtils');
const perm = require('../util/Permission');
const {getGradSchool, updateGradSchool} = require('../components/grad-school');

const PERMISSION = perm.PERMISSION;

router.get('/:schoolID', passport.authenticate('jwt', {session: false}, undefined), permUtils.isValidUUIDParam('schoolID'), permUtils.checkUserHasPermission(PERMISSION.VIEW_GRAD_DATA_COLLECTION_PERMISSION), extendSession, getGradSchool);
router.put('/:schoolID', passport.authenticate('jwt', {session: false}, undefined), permUtils.isValidUUIDParam('schoolID'), permUtils.checkUserHasPermission(PERMISSION.EDIT_GRAD_DATA_COLLECTION_PERMISSION), extendSession, updateGradSchool);

module.exports = router;
