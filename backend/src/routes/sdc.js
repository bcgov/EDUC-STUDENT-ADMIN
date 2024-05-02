const passport = require('passport');
const express = require('express');
const router = express.Router();
const utils = require('../components/utils');
const perm = require('../util/Permission');
const extendSession = utils.extendSession();
const { getSnapshotFundingDataForSchool, getAllCollectionsForSchool, getActiveCollection} = require('../components/sdc/sdc');
const {getCachedSDCData} = require('../components/sdc/sdc-cache');
const constants = require('../util/constants');
const PERMISSION = perm.PERMISSION;
const permUtils = require('../components/permissionUtils');

router.get('/funding-groups-snapshot/:schoolID/:collectionID', passport.authenticate('jwt', {session: false}, undefined), permUtils.hasPermissionToAddOrUpdateFundingData(), extendSession, getSnapshotFundingDataForSchool);
router.get('/collection-type-codes', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getCachedSDCData(constants.CACHE_KEYS.COLLECTION_TYPE_CODES, 'sdc:collectionTypeCodesURL'));
router.get('/sdcSchoolCollection/:schoolID', passport.authenticate('jwt', {session: false}, undefined), permUtils.hasPermissionToAddOrUpdateFundingData(), extendSession, getAllCollectionsForSchool);
router.get('/collection/active', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getActiveCollection);

module.exports = router;

