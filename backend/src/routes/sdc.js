const passport = require('passport');
const express = require('express');
const router = express.Router();
const utils = require('../components/utils');
const perm = require('../util/Permission');
const extendSession = utils.extendSession();
const { getFundingGroupDataForSchool, deleteFundingDataForSchool, updateFundingDataForSchool, 
    getSnapshotFundingDataForSchool, addNewFundingForSchool, getAllCollectionsForSchool} = require('../components/sdc/sdc');
const auth = require('../components/auth');
const {getCachedSDCData} = require('../components/sdc/sdc-cache');
const constants = require('../util/constants');
const PERMISSION = perm.PERMISSION;

router.post('/funding-groups/:schoolID', passport.authenticate('jwt', {session: false}, undefined), utils.checkUserHasPermission(PERMISSION.EDIT_SCHOOL_PERMISSION), extendSession, addNewFundingForSchool);
router.get('/funding-groups/:schoolID', passport.authenticate('jwt', {session: false}, undefined), utils.checkUserHasPermission(PERMISSION.EDIT_SCHOOL_PERMISSION), extendSession, getFundingGroupDataForSchool);
router.delete('/funding-groups/:schoolID/funding/:schoolFundingGroupID', passport.authenticate('jwt', {session: false}, undefined), utils.checkUserHasPermission(PERMISSION.EDIT_SCHOOL_PERMISSION), extendSession, deleteFundingDataForSchool);
router.put('/funding-groups/:schoolID/funding/:schoolFundingGroupID', passport.authenticate('jwt', {session: false}, undefined), utils.checkUserHasPermission(PERMISSION.EDIT_SCHOOL_PERMISSION), extendSession, updateFundingDataForSchool);
router.get('/funding-groups/snapshot/:schoolID/:collectionID', passport.authenticate('jwt', {session: false}, undefined), utils.checkUserHasPermission(PERMISSION.EDIT_SCHOOL_PERMISSION), extendSession, getSnapshotFundingDataForSchool);

router.get('/funding-groups', passport.authenticate('jwt', {session: false}, undefined), utils.checkUserHasPermission(PERMISSION.EDIT_SCHOOL_PERMISSION), extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_FUNDING_GROUPS, 'sdc:fundingGroupsURL'));
router.get('/sdcSchoolCollection/:schoolID', passport.authenticate('jwt', {session: false}, undefined), utils.checkUserHasPermission(PERMISSION.EDIT_SCHOOL_PERMISSION), extendSession, getAllCollectionsForSchool);
module.exports = router;

