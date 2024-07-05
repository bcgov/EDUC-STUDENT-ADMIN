'use strict';
const { logApiError, getData, errorResponse, postData, stripNumberFormattingNumberOfCourses, formatNumberOfCourses, handleExceptionResponse} = require('../utils');
const HttpStatus = require('http-status-codes');
const config = require('../../config');
const utils = require('../utils');
const cacheService = require('../cache-service');
const { FILTER_OPERATION, VALUE_TYPE, CONDITION, ENROLLED_PROGRAM_TYPE_CODE_MAP, DUPLICATE_TYPE_CODES} = require('../../util/constants');
const {createMoreFiltersSearchCriteria} = require('../studentFilters');

async function getSnapshotFundingDataForSchool(req, res) {
  try {
    const data = await getData(`${config.get('sdc:schoolFundingCodesSnapshotURL')}/${req.params.schoolID}/${req.params.collectionID}`);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    await logApiError(e, 'getSnapshotFundingDataForSchool', 'Error getting funding snapshot data for this school');
    return errorResponse(res);
  }
}

async function getAllCollectionsForSchool(req, res) {
  try {
    const data = await getData(`${config.get('sdc:schoolCollectionURL')}/searchAll?schoolID=${req.params.schoolID}`);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    await logApiError(e, 'getAllCollectionsForSchool', 'Error getting collections for this school');
    return errorResponse(res);
  }
}

async function getActiveCollection(req, res) {
  try {
    const data = await getData(`${config.get('sdc:activeCollectionURL')}`);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    await logApiError(e, 'getActiveCollection', 'Error getting active collection');
    return errorResponse(res);
  }
}

async function getSdcDistrictCollectionMonitoringByCollectionId(req, res) {
  try {
    const data = await getData(`${config.get('sdc:collectionURL')}/${req.params.collectionID}/monitorSdcDistrictCollections`);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    await logApiError(e, 'Error retrieving the district collection monitoring stats');
    return errorResponse(res);
  }
}

async function getIndySdcSchoolCollectionMonitoringByCollectionId(req, res) {
  try {
    const data = await getData(`${config.get('sdc:collectionURL')}/${req.params.collectionID}/monitorIndySdcSchoolCollections`);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    await logApiError(e, 'Error retrieving the district collection monitoring stats');
    return errorResponse(res);
  }
}

async function unsubmitSdcDistrictCollection(req, res) {
  try {
    const userInfo = utils.getUser(req);
    const payload = {
      'updateUser': userInfo.idir_username,
      'sdcDistrictCollectionID': req.params.sdcDistrictCollectionID
    };
    const data = await postData(`${config.get('sdc:districtCollectionURL')}/unsubmit`, payload);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    await logApiError(e,'Error unsubmitting the district collection record');
    return errorResponse(res);
  }
}

async function unsubmitSdcSchoolCollection(req, res) {
  try {
    const userInfo = utils.getUser(req);
    const payload = {
      'updateUser': userInfo.idir_username,
      'sdcSchoolCollectionID': req.params.sdcSchoolCollectionID
    };
    const data = await postData(`${config.get('sdc:schoolCollectionURL')}/unsubmit`, payload);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    await logApiError(e,'Error unsubmitting the school collection record');
  }
}

async function getSDCSchoolCollectionStudentPaginated(req, res) {
  try {
    const search = [];

    search.push({
      condition: null,
      searchCriteriaList: [{ key: 'sdcSchoolCollection.collectionEntity.collectionID', value: req.params.collectionID, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID }]
    });

    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: createSearchCriteria(req.query.searchParams)
    });

    if(req.query.searchParams['tabFilter']) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: createTabFilter(req.query.searchParams['tabFilter'])
      });
    }

    if (req.query.searchParams['multiFieldName']) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: createMultiFieldNameSearchCriteria(req.query.searchParams['multiFieldName'])
      });
    }
    if (req.query.searchParams['penLocalIdNumber']) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: createLocalIdPenSearchCriteria(req.query.searchParams['penLocalIdNumber'])
      });
    }

    if (req.query.searchParams['moreFilters']) {
      let criteriaArray = createMoreFiltersSearchCriteria(req.query.searchParams['moreFilters']);
      criteriaArray.forEach(criteria => {
        search.push(criteria);
      });
    }

    if(req.query.searchParams['assignedPen']) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: createAssignedPENSearchCriteria(req.query.searchParams['assignedPen'])
      });
    }


    const params = {
      params: {
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        sort: req.query.sort,
        searchCriteriaList: JSON.stringify(search),
      }
    };

    let data = await getData(`${config.get('sdc:schoolCollectionStudentURL')}/paginated`, params);
    if (req?.query?.returnKey) {
      let result = data?.content.map((student) => student[req?.query?.returnKey]);
      return res.status(HttpStatus.OK).json(result);
    }

    if(req?.query?.tableFormat){
      data.content = data?.content.map(toTableRow);
    }


    data?.content.forEach(value => {
      let school = cacheService.getSchoolBySchoolID(value.schoolID);
      value.schoolName = getSchoolName(school);
      value.districtName = getDistrictName(cacheService.getDistrictJSONByDistrictId(school.districtID));
    });

    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    if (e?.status === 404) {
      res.status(HttpStatus.OK).json(null);
    } else {
      await logApiError(e, 'Error getting sdc school collection student paginated list');
      return errorResponse(res);
    }
  }
}

function createTabFilter(searchParams) {
  let searchCriteriaList = [];
  let tableKey = 'sdcStudentEnrolledProgramEntities.enrolledProgramCode';

  if (searchParams.label === 'FRENCH_PR') {
    searchCriteriaList.push({ key: tableKey, operation: FILTER_OPERATION.IN, value: '05,08,11,14', valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  }
  if (searchParams.label === 'CAREER_PR') {
    searchCriteriaList.push({ key: tableKey, operation: FILTER_OPERATION.IN, value: '40,41,42,43', valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  }
  if (searchParams.label === 'ELL_PR') {
    searchCriteriaList.push({ key: tableKey, operation: FILTER_OPERATION.IN, value: '17', valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  }
  if(searchParams.label === 'INDSUPPORT_PR') {
    searchCriteriaList.push({ key: 'bandCode', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
    searchCriteriaList.push({ key: 'nativeAncestryInd', value: 'Y', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
    searchCriteriaList.push({ key: tableKey, operation: FILTER_OPERATION.IN_LEFT_JOIN, value: '29,33,36', valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
  }
  if (searchParams.label === 'SPECIALED_PR') {
    searchCriteriaList.push({ key: 'specialEducationCategoryCode', operation: FILTER_OPERATION.IN, value: 'A,B,C,D,E,F,G,H,K,P,Q,R', valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  }
  if (searchParams.label === 'REFUGEE') {
    searchCriteriaList.push({ key: 'schoolFundingCode', operation: FILTER_OPERATION.IN, value: '16', valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  }

  return searchCriteriaList;

}

function toTableRow(student) {
  let bandCodesMap = cacheService.getAllActiveBandCodesMap();
  let careerProgramCodesMap = cacheService.getActiveCareerProgramCodesMap();
  let schoolFundingCodesMap = cacheService.getActiveSchoolFundingCodesMap();
  let specialEducationCodesMap = cacheService.getActiveSpecialEducationCodesMap();
  let homeLanguageSpokenCodesMap = cacheService.getHomeLanguageSpokenCodesMap();
  student.mappedSpedCode = student.specialEducationCategoryCode !== '' && specialEducationCodesMap.get(student.specialEducationCategoryCode) !== undefined ? `${specialEducationCodesMap.get(student.specialEducationCategoryCode)?.description} (${specialEducationCodesMap.get(student.specialEducationCategoryCode)?.specialEducationCategoryCode})` : null;
  student.mappedAncestryIndicator = student.nativeAncestryInd === null ? null : nativeAncestryInd(student);
  student.mappedFrenchEnrolledProgram = enrolledProgramMapping(student, ENROLLED_PROGRAM_TYPE_CODE_MAP.FRENCH_ENROLLED_PROGRAM_CODES);
  student.mappedEllEnrolledProgram = enrolledProgramMapping(student, ENROLLED_PROGRAM_TYPE_CODE_MAP.ENGLISH_ENROLLED_PROGRAM_CODES);
  student.mappedLanguageEnrolledProgram = enrolledProgramMapping(student, [...ENROLLED_PROGRAM_TYPE_CODE_MAP.ENGLISH_ENROLLED_PROGRAM_CODES, ...ENROLLED_PROGRAM_TYPE_CODE_MAP.FRENCH_ENROLLED_PROGRAM_CODES]);
  student.mappedCareerProgram = enrolledProgramMapping(student, ENROLLED_PROGRAM_TYPE_CODE_MAP.CAREER_ENROLLED_PROGRAM_CODES);
  student.mappedIndigenousEnrolledProgram = enrolledProgramMapping(student, ENROLLED_PROGRAM_TYPE_CODE_MAP.INDIGENOUS_ENROLLED_PROGRAM_CODES);
  student.mappedBandCode = student.bandCode !== '' && bandCodesMap.get(student.bandCode) !== undefined ? `${bandCodesMap.get(student.bandCode)?.description} (${bandCodesMap.get(student.bandCode)?.bandCode})` : null;
  student.mappedCareerProgramCode = student.careerProgramCode !== '' && careerProgramCodesMap.get(student.careerProgramCode) !== undefined ? `${careerProgramCodesMap.get(student.careerProgramCode)?.description} (${careerProgramCodesMap.get(student.careerProgramCode)?.careerProgramCode})` : null;
  student.mappedSchoolFunding = student.schoolFundingCode !== '' && schoolFundingCodesMap.get(student.schoolFundingCode) !== undefined ? `${schoolFundingCodesMap.get(student.schoolFundingCode)?.description} (${schoolFundingCodesMap.get(student.schoolFundingCode)?.schoolFundingCode})` : null;
  student.indProgramEligible = student.indigenousSupportProgramNonEligReasonCode !== null ? 'No' : 'Yes';
  student.frenchProgramEligible = student.frenchProgramNonEligReasonCode !== null ? 'No' : 'Yes';
  student.ellProgramEligible = student.ellNonEligReasonCode !== null ? 'No' : 'Yes';
  student.careerProgramEligible = student.careerProgramNonEligReasonCode !== null ? 'No' : 'Yes';
  student.spedProgramEligible = student.specialEducationNonEligReasonCode !== null ? 'No' : 'Yes';
  student.mappedNoOfCourses = student.numberOfCoursesDec ? student.numberOfCoursesDec.toFixed(2) : '0';
  student.mappedHomelanguageCode = student.homeLanguageSpokenCode !== '' && homeLanguageSpokenCodesMap.get(student.homeLanguageSpokenCode) !== undefined ? `${homeLanguageSpokenCodesMap.get(student.homeLanguageSpokenCode)?.description} (${homeLanguageSpokenCodesMap.get(student.homeLanguageSpokenCode)?.homeLanguageSpokenCode})` : null;
  student.mappedPenMatchResult = mapPenMatchResult(student?.penMatchResult);
  return student;
}

function mapPenMatchResult(penMatchResult) {
  switch(penMatchResult) {
    case 'INREVIEW':
      return 'Review Requested';
    case 'MULTI':
      return 'Multiple PEN Matches';
    default:
      return penMatchResult;
  }
}

function enrolledProgramMapping(student, enrolledProgramFilter) {
  let enrolledProgramCodesMap = cacheService.getEnrolledProgramCodesMap();
  if(!student.enrolledProgramCodes) {
    return '';
  }
  return student.enrolledProgramCodes
    .match(/.{1,2}/g)
    .filter(programCode => enrolledProgramFilter.includes(programCode))
    .map(programCode => {
      const enrolledProgram = enrolledProgramCodesMap.get(programCode);
      return enrolledProgram ? `${enrolledProgram.description} (${programCode})` : programCode;
    })
    .join(',');
}

function nativeAncestryInd(student) {
  return student.nativeAncestryInd === 'Y' ? 'Yes' : 'No';
}

function getSchoolName(school) {
  return school.mincode + ' - ' + school.schoolName;
}

function getDistrictName(district) {
  return district.districtNumber + ' - ' + district.name;
}

/**
 * Returns an object that has the following properties key, value, operation, valueType
 * Helper function when building search params for querying SDC API
 *
 * @param searchParams key value pair of what we are searching for
 */
function createSearchCriteria(searchParams = []) {
  let searchCriteriaList = [];

  Object.keys(searchParams).forEach(function(key) {
    let pValue = searchParams[key];
    if (key === 'sdcSchoolCollectionStudentStatusCode') {
      searchCriteriaList.push({ key: key, operation: FILTER_OPERATION.IN, value: pValue, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }
  });
  return searchCriteriaList;
}

function createAssignedPENSearchCriteria(searchParams) {
  let searchCriteriaList = [];

  if(searchParams.label === 'REVIEW_PEN') {
    searchCriteriaList.push({ key: 'penMatchResult', operation: FILTER_OPERATION.IN, value: 'MULTI,INREVIEW', valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  } else if(searchParams.label === 'NEW_PEN') {
    searchCriteriaList.push({ key: 'penMatchResult', operation: FILTER_OPERATION.IN, value: 'NEW', valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  }
  return searchCriteriaList;
}

function createMultiFieldNameSearchCriteria(nameString) {
  const nameParts = nameString.split(/\s+/);
  const fieldNames = [
    'legalFirstName',
    'legalMiddleNames',
    'legalLastName',
    'usualFirstName',
    'usualMiddleNames',
    'usualLastName'
  ];

  const searchCriteriaList = [];
  for (const part of nameParts) {
    for (const fieldName of fieldNames) {
      searchCriteriaList.push({
        key: fieldName,
        operation: FILTER_OPERATION.CONTAINS_IGNORE_CASE,
        value: `%${part}%`,
        valueType: VALUE_TYPE.STRING,
        condition: CONDITION.OR
      });
    }
  }
  return searchCriteriaList;
}

function createLocalIdPenSearchCriteria(value) {
  let searchCriteriaList = [];
  searchCriteriaList.push({
    key: 'studentPen',
    operation: FILTER_OPERATION.EQUAL,
    value: value,
    valueType: VALUE_TYPE.STRING,
    condition: CONDITION.OR
  });
  searchCriteriaList.push({
    key: 'localID',
    operation: FILTER_OPERATION.EQUAL,
    value: value,
    valueType: VALUE_TYPE.STRING,
    condition: CONDITION.OR
  });
  return searchCriteriaList;
}

async function getSDCSchoolCollectionStudentDetail(req, res) {
  try {
    let sdcSchoolCollectionStudentData = await getData(`${config.get('sdc:schoolCollectionStudentURL')}/${req.params.sdcSchoolCollectionStudentID}`);
    if (sdcSchoolCollectionStudentData?.enrolledProgramCodes) {
      sdcSchoolCollectionStudentData.enrolledProgramCodes = sdcSchoolCollectionStudentData?.enrolledProgramCodes.match(/.{1,2}/g);
    }

    let school = cacheService.getSchoolBySchoolID(sdcSchoolCollectionStudentData.schoolID);
    sdcSchoolCollectionStudentData.schoolName = getSchoolName(school);
    sdcSchoolCollectionStudentData.mincode = school.mincode;

    return res.status(HttpStatus.OK).json(sdcSchoolCollectionStudentData);
  } catch (e) {
    logApiError(e, 'Error getting sdc school collection student detail');
    return errorResponse(res);
  }
}

async function getInDistrictDuplicates(req, res) {
  try {
    let sdcDuplicates = await getData(`${config.get('sdc:collectionURL')}/${req.params.collectionID}/in-province-duplicates`);

    const result = {
      enrollmentDuplicates: {
        NON_ALLOW: [],
        ALLOWABLE: [],
        RESOLVED: []
      },
      programDuplicates: {
        NON_ALLOW: [],
        RESOLVED: []
      }
    };
    sdcDuplicates.forEach(sdcDuplicate => {
      const school1 = cacheService.getSchoolBySchoolID(sdcDuplicate.sdcSchoolCollectionStudent1Entity?.schoolID);
      const school2 = cacheService.getSchoolBySchoolID(sdcDuplicate.sdcSchoolCollectionStudent2Entity?.schoolID);
      sdcDuplicate.sdcSchoolCollectionStudent1Entity.schoolName = getSchoolName(school1);
      sdcDuplicate.sdcSchoolCollectionStudent2Entity.schoolName = getSchoolName(school2);

      const district1 = cacheService.getDistrictJSONByDistrictId(school1.districtID);
      const district2 = cacheService.getDistrictJSONByDistrictId(school2.districtID);
      sdcDuplicate.sdcSchoolCollectionStudent1Entity.districtName = getDistrictName(district1);
      sdcDuplicate.sdcSchoolCollectionStudent2Entity.districtName = getDistrictName(district2);

      toTableRow(sdcDuplicate.sdcSchoolCollectionStudent1Entity);
      toTableRow(sdcDuplicate.sdcSchoolCollectionStudent2Entity);

      if (sdcDuplicate?.duplicateTypeCode === DUPLICATE_TYPE_CODES.ENROLLMENT && sdcDuplicate.duplicateResolutionCode) {
        setStudentResolvedMessage(sdcDuplicate);
        result.enrollmentDuplicates.RESOLVED.push(sdcDuplicate);
      } else if (sdcDuplicate?.duplicateTypeCode === DUPLICATE_TYPE_CODES.ENROLLMENT) {
        setIfOnlineStudentAndCanChangeGrade(sdcDuplicate, school1, school2);
        setCanMoveToCrossEnrollment(sdcDuplicate);
        result.enrollmentDuplicates[sdcDuplicate.duplicateSeverityCode].push(sdcDuplicate);
      } else if (sdcDuplicate?.duplicateTypeCode === DUPLICATE_TYPE_CODES.PROGRAM && sdcDuplicate.duplicateResolutionCode) {
        result.programDuplicates.RESOLVED.push(sdcDuplicate);
      } else if (sdcDuplicate?.duplicateTypeCode === DUPLICATE_TYPE_CODES.PROGRAM) {
        setProgramDuplicateTypeMessage(sdcDuplicate);
        result.programDuplicates.NON_ALLOW.push(sdcDuplicate);
      }
    });
    res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'Error retrieving the in district duplicates');
  }
}
    
async function updateStudentPEN(req, res) {
  try {
    const payload = req.body;
    payload.createDate = null;
    payload.createUser = null;
    payload.updateDate = null;
    payload.updateUser = utils.getUser(req).idir_username;
    payload.enrolledProgramCodes = null;
    payload.penMatchResult = null;

    const data = await postData(`${config.get('sdc:schoolCollectionStudentURL')}/update-pen/type/${req.params.penCode}`, payload);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    logApiError(e, 'Error updating student PEN');
    return errorResponse(res);
  }
}

function setStudentResolvedMessage(sdcDuplicate) {
  const resolutionCodes = cacheService.getAllDuplicateResolutionCodesMap();
  const retainedId = sdcDuplicate.retainedSdcSchoolCollectionStudentEntity?.sdcSchoolCollectionStudentID;
  if (sdcDuplicate.sdcSchoolCollectionStudent1Entity.sdcSchoolCollectionStudentID === retainedId) {
    sdcDuplicate.sdcSchoolCollectionStudent1Entity.resolution = resolutionCodes.get(sdcDuplicate.duplicateResolutionCode) !== undefined ? resolutionCodes.get(sdcDuplicate.duplicateResolutionCode)?.message : null;
  }
  else if (sdcDuplicate.sdcSchoolCollectionStudent2Entity.sdcSchoolCollectionStudentID === retainedId) {
    sdcDuplicate.sdcSchoolCollectionStudent2Entity.resolution = resolutionCodes.get(sdcDuplicate.duplicateResolutionCode) !== undefined ? resolutionCodes.get(sdcDuplicate.duplicateResolutionCode)?.message : null;
  }
}

function setIfOnlineStudentAndCanChangeGrade(sdcDuplicate, school1, school2) {
  if(['DIST_LEARN', 'DISTONLINE'].includes(school1.facilityTypeCode) && ['08', '09'].includes(sdcDuplicate.sdcSchoolCollectionStudent1Entity.enrolledGradeCode)) {
    sdcDuplicate.sdcSchoolCollectionStudent1Entity.canChangeGrade = true;
  }
  if(['DIST_LEARN', 'DISTONLINE'].includes(school2.facilityTypeCode) && ['08', '09'].includes(sdcDuplicate.sdcSchoolCollectionStudent2Entity.enrolledGradeCode)) {
    sdcDuplicate.sdcSchoolCollectionStudent2Entity.canChangeGrade = true;
  }
}

function setCanMoveToCrossEnrollment(sdcDuplicate) {
  if (['08', '09'].includes(sdcDuplicate.sdcSchoolCollectionStudent1Entity.enrolledGradeCode)) {
    sdcDuplicate.sdcSchoolCollectionStudent1Entity.canMoveToCrossEnrollment = true;
  }
  if (['08', '09'].includes(sdcDuplicate.sdcSchoolCollectionStudent2Entity.enrolledGradeCode)) {
    sdcDuplicate.sdcSchoolCollectionStudent1Entity.canMoveToCrossEnrollment = true;
  }
}

function setProgramDuplicateTypeMessage(sdcDuplicate) {
  const programDuplicateTypeCodes = cacheService.getAllProgramDuplicateTypeCodesMap();
  sdcDuplicate.programDuplicateTypeCodeDescription = programDuplicateTypeCodes.get(sdcDuplicate.programDuplicateTypeCode)?.label;
}

async function checkDuplicatesInCollection(req, res) {
  try {
    const params = {
      params: {
        matchedAssignedIDs: req.query.matchedAssignedIDs
      }
    };
    const data = await getData(`${config.get('sdc:collectionURL')}/${req.params.collectionID}/duplicates`, params);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    logApiError(e, 'Error finding duplicates in the collection');
    return errorResponse(res);
  }
}

async function updateAndValidateSdcSchoolCollectionStudent(req, res) {
  try {
    if(req.body.sdcSchoolCollectionStudentID) {
      let sdcSchoolCollectionStudentID = req.body.sdcSchoolCollectionStudentID;
      let currentStudent = await getData(`${config.get('sdc:schoolCollectionStudentURL')}/${sdcSchoolCollectionStudentID}`);
      if (req.body.updateDate !== currentStudent.updateDate) {
        throw new Error(HttpStatus.CONFLICT.toString());
      }
    }

    const payload = req.body;
    payload.createDate = null;
    payload.createUser = null;
    payload.updateDate = null;
    payload.updateUser = 'ADMIN/' + req.session.passport.user.id;

    if (payload?.enrolledProgramCodes) {
      payload.enrolledProgramCodes = payload.enrolledProgramCodes.join('');
    }

    if (payload?.numberOfCourses) {
      payload.numberOfCourses = stripNumberFormattingNumberOfCourses(payload.numberOfCourses);
    }

    payload.sdcSchoolCollectionStudentValidationIssues = null;
    payload.sdcSchoolCollectionStudentEnrolledPrograms = null;

    const data = await postData(config.get('sdc:schoolCollectionStudentURL'), payload);

    if (data?.enrolledProgramCodes) {
      data.enrolledProgramCodes = data?.enrolledProgramCodes.match(/.{1,2}/g);
    }

    if (data?.numberOfCourses) {
      data.numberOfCourses = formatNumberOfCourses(data?.numberOfCourses);
    }
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    if (e.message === '409' || e.status === '409' || e.status === 409) {
      return res.status(HttpStatus.CONFLICT).json({
        status: HttpStatus.CONFLICT,
        message: 'The student you are attempting to update is already being saved by another user. Please refresh your screen and try again.'
      });
    } else if (e.status === 400 && e.data.message === 'SdcSchoolCollectionStudent was not saved to the database because it would create provincial duplicate.') {
      return res.status(HttpStatus.CONFLICT).json({
        status: HttpStatus.CONFLICT,
        message: 'Saving this student would result in a duplicate record and is not allowed. Please check the student details and try again.'
      });
    }
    return handleExceptionResponse(e, res);
  }

}

async function resolveDuplicates(req, res) {
  try {
    let sdcDuplicateID = req.body.duplicate.sdcDuplicateID;
    let currentDuplicate = await getData(`${config.get('sdc:schoolCollectionURL')}/duplicate/${sdcDuplicateID}`);
    if(req.body.duplicate.updateDate !== currentDuplicate.updateDate){
      throw new Error(HttpStatus.CONFLICT.toString());
    }

    const payload = req.body.students;
    payload.forEach(student => {
      student.createDate = null;
      student.createUser = null;
      student.updateDate = null;
      student.updateUser = utils.getUser(req).idir_username;

      if (student?.enrolledProgramCodes && Array.isArray(student?.enrolledProgramCodes)) {
        student.enrolledProgramCodes = student.enrolledProgramCodes.join('');
      }

      if (student?.numberOfCourses) {
        student.numberOfCourses = utils.stripNumberFormattingNumberOfCourses(student.numberOfCourses);
      }

      student.sdcSchoolCollectionStudentValidationIssues = null;
      student.sdcSchoolCollectionStudentEnrolledPrograms = null;
    });

    const data = await postData(`${config.get('sdc:districtCollectionURL')}/in-district-duplicates/${req.params.sdcDuplicateID}/type/${req.params.type}`, payload);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    if (e.message === '409' || e.status === '409' || e.status === 409) {
      return res.status(HttpStatus.CONFLICT).json({
        status: HttpStatus.CONFLICT,
        message: 'The duplicate you are attempting to update is already being saved by another user. Please refresh your screen and try again.'
      });
    }
    logApiError(e, 'Error resolving district duplicates.');
    return errorResponse(res);
  }
}

module.exports = {
  getSnapshotFundingDataForSchool,
  getAllCollectionsForSchool,
  getActiveCollection,
  getSdcDistrictCollectionMonitoringByCollectionId,
  getIndySdcSchoolCollectionMonitoringByCollectionId,
  unsubmitSdcDistrictCollection,
  unsubmitSdcSchoolCollection,
  getSDCSchoolCollectionStudentPaginated,
  getSDCSchoolCollectionStudentDetail,
  getInDistrictDuplicates,
  updateStudentPEN,
  updateAndValidateSdcSchoolCollectionStudent,
  checkDuplicatesInCollection,
  resolveDuplicates
};
