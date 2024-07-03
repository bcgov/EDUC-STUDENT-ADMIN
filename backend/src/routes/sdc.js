const passport = require('passport');
const express = require('express');
const router = express.Router();
const utils = require('../components/utils');
const perm = require('../util/Permission');
const extendSession = utils.extendSession();
const { getSnapshotFundingDataForSchool, getAllCollectionsForSchool, getActiveCollection, getSdcDistrictCollectionMonitoringByCollectionId,
  getIndySdcSchoolCollectionMonitoringByCollectionId, unsubmitSdcDistrictCollection, unsubmitSdcSchoolCollection, getInDistrictDuplicates,
  getSDCSchoolCollectionStudentPaginated, getSDCSchoolCollectionStudentDetail, updateStudentPEN, checkDuplicatesInCollection, resolveDuplicates
} = require('../components/sdc/sdc');
const {getCachedSDCData} = require('../components/sdc/sdc-cache');
const constants = require('../util/constants');
const {getCodes} = require('../components/utils');
const PERMISSION = perm.PERMISSION;
const permUtils = require('../components/permissionUtils');

//cached code table calls
router.get('/band-codes', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_BAND_CODES, 'sdc:bandCodesURL'));
router.get('/career-program-codes', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_CAREER_PROGRAM_CODES, 'sdc:careerProgramCodesURL'));
router.get('/enrolled-grade-codes', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_ENROLLED_GRADE_CODES, 'sdc:enrolledGradeCodesURL'));
router.get('/enrolled-program-codes', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_ENROLLED_PROGRAM_CODES, 'sdc:enrolledProgramCodesURL'));
router.get('/gender-codes', passport.authenticate('jwt', {session: false}, undefined),  permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getCodes('sdc:genderCodesURL', constants.CACHE_KEYS.SDC_GENDER_CODES, null, true));
router.get('/home-language-spoken-codes', passport.authenticate('jwt', {session: false}, undefined),  permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_HOME_LANGUAGE_SPOKEN_CODES, 'sdc:homeLanguageSpokenCodesURL'));
router.get('/school-funding-codes', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_SCHOOL_FUNDING_CODES, 'sdc:schoolFundingCodesURL'));
router.get('/specialEducation-codes', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_SPECIAL_ED_CODES, 'sdc:specialEdCodesURL'));
router.get('/duplicate-resolution-codes', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_DUPLICATE_RESOLUTION_CODES, 'sdc:duplicateResolutionCodesURL'));
//end cached code table calls

router.get('/district-collection-status-codes', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_DISTRICT_COLLECTION_STATUS_CODES, 'sdc:districtCollectionStatusCodesURL'));
router.get('/school-collection-status-codes', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_SCHOOL_COLLECTION_STATUS_CODES, 'sdc:schoolCollectionStatusCodesURL'));
router.get('/funding-groups-snapshot/:schoolID/:collectionID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_SCHOOL_PERMISSION), extendSession, getSnapshotFundingDataForSchool);
router.get('/collection-type-codes', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_SCHOOL_PERMISSION), extendSession, getCachedSDCData(constants.CACHE_KEYS.COLLECTION_TYPE_CODES, 'sdc:collectionTypeCodesURL'));
router.get('/sdcSchoolCollection/:schoolID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_SCHOOL_PERMISSION), extendSession, getAllCollectionsForSchool);
router.get('/collection/active', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getActiveCollection);

//collection
router.get('/collection/:collectionID/sdcDistrictCollectionMonitoring', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getSdcDistrictCollectionMonitoringByCollectionId);
router.get('/collection/:collectionID/indySdcSchoolCollectionMonitoring', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getIndySdcSchoolCollectionMonitoringByCollectionId);
router.get('/collection/:collectionID/students-paginated', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getSDCSchoolCollectionStudentPaginated);
router.get('/collection/:collectionID/duplicates', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, checkDuplicatesInCollection);

//student
router.get('/sdcSchoolCollectionStudent/:sdcSchoolCollectionStudentID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getSDCSchoolCollectionStudentDetail);
router.post('/sdcSchoolCollectionStudent/:sdcSchoolCollectionStudentID/update-pen/:penCode', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, updateStudentPEN);

//district collection
router.post('/sdcDistrictCollection/:sdcDistrictCollectionID/unsubmit', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, unsubmitSdcDistrictCollection);
router.post('/sdcDistrictCollection/resolve-district-duplicates/:sdcDuplicateID/:type', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, resolveDuplicates);

//school collection
router.post('/sdcSchoolCollection/:sdcSchoolCollectionID/unsubmit', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, unsubmitSdcSchoolCollection);
router.post('/sdcSchoolCollection/:sdcSchoolCollectionID/resolve-duplicates/:sdcDuplicateID/:type', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, resolveDuplicates);

router.get('/collection/:collectionID/provincial-duplicates', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_DATA_COLLECTION), extendSession, getInDistrictDuplicates);
module.exports = router;

