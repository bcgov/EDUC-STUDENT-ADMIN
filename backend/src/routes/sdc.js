const passport = require('passport');
const express = require('express');
const router = express.Router();
const utils = require('../components/utils');
const perm = require('../util/Permission');
const extendSession = utils.extendSession();
const { getSnapshotFundingDataForSchool, getAllCollectionsForSchool, getActiveCollection, getSdcDistrictCollectionMonitoringByCollectionId,
  getIndySdcSchoolCollectionMonitoringByCollectionId
} = require('../components/sdc/sdc');
const {getCachedSDCData} = require('../components/sdc/sdc-cache');
const constants = require('../util/constants');
const PERMISSION = perm.PERMISSION;
const permUtils = require('../components/permissionUtils');

router.get('/district-collection-status-codes', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_DISTRICT_COLLECTION_STATUS_CODES, 'sdc:districtCollectionStatusCodesURL'));
router.get('/school-collection-status-codes', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_SCHOOL_COLLECTION_STATUS_CODES, 'sdc:schoolCollectionStatusCodesURL'));
router.get('/funding-groups-snapshot/:schoolID/:collectionID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_SCHOOL_PERMISSION), extendSession, getSnapshotFundingDataForSchool);
router.get('/collection-type-codes', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_SCHOOL_PERMISSION), extendSession, getCachedSDCData(constants.CACHE_KEYS.COLLECTION_TYPE_CODES, 'sdc:collectionTypeCodesURL'));
router.get('/sdcSchoolCollection/:schoolID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_SCHOOL_PERMISSION), extendSession, getAllCollectionsForSchool);
router.get('/collection/active', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getActiveCollection);

router.get('/collection/:collectionID/sdcDistrictCollectionMonitoring', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getSdcDistrictCollectionMonitoringByCollectionId);
router.get('/collection/:collectionID/indySdcSchoolCollectionMonitoring', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getIndySdcSchoolCollectionMonitoringByCollectionId);

module.exports = router;

