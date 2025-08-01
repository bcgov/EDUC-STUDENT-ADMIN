const passport = require('passport');
const express = require('express');
const router = express.Router();
const utils = require('../components/utils');
const perm = require('../util/Permission');
const extendSession = utils.extendSession();
const { getSnapshotFundingDataForSchool, getAllCollectionsForSchool, getActiveCollection, getSdcDistrictCollectionMonitoringByCollectionId,
  getIndySdcSchoolCollectionMonitoringByCollectionId, unsubmitSdcDistrictCollection, unsubmitSdcSchoolCollection, getInDistrictDuplicates, getSDCSchoolCollectionStudentPaginatedSlice,
  getSDCSchoolCollectionStudentPaginated, getSDCSchoolCollectionStudentDetail, updateStudentPEN, checkDuplicatesInCollection, updateAndValidateSdcSchoolCollectionStudent, resolveDuplicates, postProvincialDuplicates, resolveRemainingDuplicates,
  closeCollection, getCollectionPaginated, getSDCSchoolCollectionDetail, downloadSdcReport,
  getCollectionByID, getSdcSchoolCollections, getSdcDistrictCollections, updateBandCode, moveSld, getDistrictHeadcounts, getSdcSchoolCollectionsFromSdcDistrictCollectionID,
  getSDCSchoolCollectionStudentSldHistoryPaginated, removeSDCSchoolCollectionStudents, getCollectionClosureSagaStatus, reprocessSdcSchoolCollection
} = require('../components/sdc/sdc');
const {getCachedSDCData} = require('../components/sdc/sdc-cache');
const constants = require('../util/constants');
const {getCodes} = require('../components/utils');
const PERMISSION = perm.PERMISSION;
const permUtils = require('../components/permissionUtils');
const auth = require('../components/auth');
const validate = require('../components/validator');
const { moveSldSchema } = require('../validations/sdc');

//cached code table calls
router.get('/band-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_BAND_CODES, 'sdc:bandCodesURL'));
router.get('/career-program-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_CAREER_PROGRAM_CODES, 'sdc:careerProgramCodesURL'));
router.get('/enrolled-grade-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_ENROLLED_GRADE_CODES, 'sdc:enrolledGradeCodesURL'));
router.get('/enrolled-program-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_ENROLLED_PROGRAM_CODES, 'sdc:enrolledProgramCodesURL'));
router.get('/gender-codes', passport.authenticate('jwt', {session: false}, undefined),  auth.isLoggedInUser, extendSession, getCodes('sdc:genderCodesURL', constants.CACHE_KEYS.SDC_GENDER_CODES, null, true));
router.get('/home-language-spoken-codes', passport.authenticate('jwt', {session: false}, undefined),  auth.isLoggedInUser, extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_HOME_LANGUAGE_SPOKEN_CODES, 'sdc:homeLanguageSpokenCodesURL'));
router.get('/school-funding-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_SCHOOL_FUNDING_CODES, 'sdc:schoolFundingCodesURL'));
router.get('/specialEducation-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_SPECIAL_ED_CODES, 'sdc:specialEdCodesURL'));
router.get('/validation-issue-type-codes', passport.authenticate('jwt', {session: false}, undefined),auth.isLoggedInUser, extendSession, getCodes('sdc:validationIssueTypeCodesURL', constants.CACHE_KEYS.SDC_VALIDATION_ISSUE_TYPE_CODES, null, true));
router.get('/program-eligibility-issue-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCodes('sdc:programEligibilityTypeCodesURL', constants.CACHE_KEYS.SDC_PROGRAM_ELIGIBILITY_TYPE_CODES, null, true));
router.get('/zero-fte-reason-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCodes('sdc:zeroFteReasonCodesURL', constants.CACHE_KEYS.SDC_ZERO_FTE_REASON_CODES, null, true));
router.get('/program-duplicate-type-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCodes('sdc:programDuplicateTypeCodesURL', constants.CACHE_KEYS.SDC_PROGRAM_DUPLICATE_TYPE_CODES, null, true));
router.get('/district-collection-status-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_DISTRICT_COLLECTION_STATUS_CODES, 'sdc:districtCollectionStatusCodesURL'));
router.get('/school-collection-status-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedSDCData(constants.CACHE_KEYS.SDC_SCHOOL_COLLECTION_STATUS_CODES, 'sdc:schoolCollectionStatusCodesURL'));
router.get('/collection-type-codes', passport.authenticate('jwt', {session: false}, undefined), auth.isLoggedInUser, extendSession, getCachedSDCData(constants.CACHE_KEYS.COLLECTION_TYPE_CODES, 'sdc:collectionTypeCodesURL'));
//end cached code table calls

router.put('/band-codes', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission('STUDENT_ADMIN_ADMINISTRATOR'), extendSession, updateBandCode);
router.get('/funding-groups-snapshot/:schoolID/:collectionID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_SCHOOL_PERMISSION), extendSession, permUtils.isValidUUIDParam('collectionID'), permUtils.isValidUUIDParam('schoolID'), getSnapshotFundingDataForSchool);
router.get('/collection/active', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, getActiveCollection);

//collection
router.get('/collection/:collectionID/sdcDistrictCollectionMonitoring', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('collectionID'), getSdcDistrictCollectionMonitoringByCollectionId);
router.get('/collection/:collectionID/indySdcSchoolCollectionMonitoring', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('collectionID'), getIndySdcSchoolCollectionMonitoringByCollectionId);
router.get('/collection/:collectionID/students-paginated', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('collectionID'), getSDCSchoolCollectionStudentPaginated);
router.get('/collection/:collectionID/students-paginated-slice', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('collectionID'), getSDCSchoolCollectionStudentPaginatedSlice);
router.get('/collection/:collectionID/duplicates', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('collectionID'), checkDuplicatesInCollection);
router.get('/collection/:collectionID/collection-closure-status', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('collectionID'), getCollectionClosureSagaStatus);

router.post('/collection/:collectionID/in-province-duplicates', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('collectionID'), postProvincialDuplicates);
router.post('/collection/:collectionID/resolve-duplicates', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('collectionID'), resolveRemainingDuplicates);
router.post('/collection/:collectionID/close-collection', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('collectionID'), closeCollection);

router.get('/collection/paginated', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, getCollectionPaginated);
router.get('/collection/:collectionID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('collectionID'), getCollectionByID);
router.get('/collection/:collectionID/sdcSchoolCollections', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('collectionID'), getSdcSchoolCollections);
router.get('/collection/:collectionID/sdcDistrictCollections', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('collectionID'), getSdcDistrictCollections);

//student
router.get('/sdcSchoolCollectionStudent/byAssignedStudentID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDQueryParam('assignedStudentID'), getSDCSchoolCollectionStudentSldHistoryPaginated);
router.get('/sdcSchoolCollectionStudent/:sdcSchoolCollectionStudentID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('sdcSchoolCollectionStudentID'), getSDCSchoolCollectionStudentDetail);

router.post('/sdcSchoolCollectionStudent/:sdcSchoolCollectionStudentID/update-pen/:penCode', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, updateStudentPEN);

//update student
router.post('/sdcSchoolCollectionStudent', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, updateAndValidateSdcSchoolCollectionStudent);
router.post('/move-sld', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_STUDENT_DATA_COLLECTION_PERMISSION), validate(moveSldSchema), extendSession, moveSld);
router.post('/sdcSchoolCollectionStudent/:sdcSchoolCollectionID/students/remove', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, removeSDCSchoolCollectionStudents);

//district collection
router.post('/sdcDistrictCollection/:sdcDistrictCollectionID/unsubmit', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('sdcDistrictCollectionID'), unsubmitSdcDistrictCollection);
router.post('/sdcDistrictCollection/resolve-district-duplicates/:sdcDuplicateID/:type', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('sdcDuplicateID'), resolveDuplicates);

router.get('/sdcDistrictCollection/:sdcDistrictCollectionID/report/:reportTypeCode/download', auth.refreshJWT, permUtils.checkUserHasPermission(PERMISSION.VIEW_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('sdcDistrictCollectionID'), downloadSdcReport);
router.get('/sdcSchoolCollectionStudent/getDistrictHeadcounts/:sdcDistrictCollectionID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('sdcDistrictCollectionID'), getDistrictHeadcounts);
router.get('/sdcDistrictCollection/:sdcDistrictCollectionID/sdcSchoolCollections', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('sdcDistrictCollectionID'), getSdcSchoolCollectionsFromSdcDistrictCollectionID);

//school collection
router.get('/sdcSchoolCollection/:sdcSchoolCollectionID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('sdcSchoolCollectionID'), getSDCSchoolCollectionDetail);
router.get('/sdcSchoolCollection/search/:schoolID', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_SCHOOL_PERMISSION), extendSession, permUtils.isValidUUIDParam('schoolID'), getAllCollectionsForSchool);

router.post('/sdcSchoolCollection/:sdcSchoolCollectionID/unsubmit', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('sdcSchoolCollectionID'), unsubmitSdcSchoolCollection);
router.post('/sdcSchoolCollection/:sdcSchoolCollectionID/resolve-duplicates/:sdcDuplicateID/:type', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.STUDENT_EDIT_STUDENT_DATA_COLLECTION_PERMISSIONDATA_COLLECTION), extendSession, permUtils.isValidUUIDParam('sdcDuplicateID'), resolveDuplicates);
router.post('/sdcSchoolCollection/:sdcSchoolCollectionID/reprocess', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.EDIT_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('sdcSchoolCollectionID'), reprocessSdcSchoolCollection);

router.get('/:sdcSchoolCollectionID/report/:reportTypeCode/download', auth.refreshJWT, permUtils.checkUserHasPermission(PERMISSION.VIEW_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('sdcSchoolCollectionID'), downloadSdcReport);

//duplciates
router.get('/collection/:collectionID/provincial-duplicates', passport.authenticate('jwt', {session: false}, undefined), permUtils.checkUserHasPermission(PERMISSION.VIEW_STUDENT_DATA_COLLECTION_PERMISSION), extendSession, permUtils.isValidUUIDParam('collectionID'), getInDistrictDuplicates);
module.exports = router;

