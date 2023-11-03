const passport = require('passport');
const express = require('express');
const router = express.Router();
const utils = require('../components/utils');
const perm = require('../util/Permission');
const extendSession = utils.extendSession();
const { getFundingGroupDataForSchool, deleteFundingDataForSchool, updateFundingDataForSchool, 
    getSnapshotFundingDataForSchool, addNewFundingForSchool, getAllCollectionsForSchool} = require('../components/sdc/sdc');
const {getCachedSDCData} = require('../components/sdc/sdc-cache');
const constants = require('../util/constants');
const PERMISSION = perm.PERMISSION;

router.post('/funding-groups/:schoolID', passport.authenticate('jwt', {session: false}, undefined), utils.hasPermissionToAddOrUpdateFundingData(), extendSession, addNewFundingForSchool);
router.get('/funding-groups/:schoolID', passport.authenticate('jwt', {session: false}, undefined), utils.hasPermissionToAddOrUpdateFundingData(), extendSession, getFundingGroupDataForSchool);
router.delete('/funding-groups/:schoolID/funding/:schoolFundingGroupID', passport.authenticate('jwt', {session: false}, undefined), utils.hasPermissionToAddOrUpdateFundingData(), extendSession, deleteFundingDataForSchool);
router.put('/funding-groups/:schoolID/funding/:schoolFundingGroupID', passport.authenticate('jwt', {session: false}, undefined), utils.hasPermissionToAddOrUpdateFundingData(), extendSession, updateFundingDataForSchool);
router.get('/funding-groups/snapshot/:schoolID/:collectionID', passport.authenticate('jwt', {session: false}, undefined), utils.hasPermissionToAddOrUpdateFundingData(), extendSession, getSnapshotFundingDataForSchool);

router.get('/funding-groups', passport.authenticate('jwt', {session: false}, undefined), utils.checkUserHasPermission(PERMISSION.VIEW_SCHOOL_PERMISSION), extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_FUNDING_GROUPS, 'sdc:fundingGroupsURL'));
router.get('/sdcSchoolCollection/:schoolID', passport.authenticate('jwt', {session: false}, undefined), utils.hasPermissionToAddOrUpdateFundingData(), extendSession, getAllCollectionsForSchool);
module.exports = router;

