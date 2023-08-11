const passport = require('passport');
const express = require('express');
const router = express.Router();
const utils = require('../components/utils');
const extendSession = utils.extendSession();
const { getFundingGroupDataForSchool, deleteFundingDataForSchool, updateFundingDataForSchool, 
    getSnapshotFundingDataForSchool, addNewFundingForSchool, getAllCollectionsForSchool} = require('../components/sdc/sdc');
const auth = require('../components/auth');
const {getCachedSDCData} = require('../components/sdc/sdc-cache');
const constants = require('../util/constants');

router.post('/funding-groups/:schoolID', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, addNewFundingForSchool);
router.get('/funding-groups/:schoolID', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getFundingGroupDataForSchool);
router.delete('/funding-groups/:schoolID/funding/:schoolFundingGroupID', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, deleteFundingDataForSchool);
router.put('/funding-groups/:schoolID/funding/:schoolFundingGroupID', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, updateFundingDataForSchool);
router.get('/funding-groups/snapshot/:schoolID/:collectionID', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getSnapshotFundingDataForSchool);

router.get('/funding-groups', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_FUNDING_GROUPS, 'sdc:fundingGroupsURL'));
router.get('/sdcSchoolCollection/:schoolID', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getAllCollectionsForSchool);
module.exports = router;

