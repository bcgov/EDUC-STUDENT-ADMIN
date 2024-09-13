'use strict';
const log = require('./logger');
const { FILTER_OPERATION, VALUE_TYPE, CONDITION, ENROLLED_PROGRAM_TYPE_CODE_MAP, STUDENT_TYPE_CODES} = require('../util/constants');
const cacheService = require('./cache-service');

function createMoreFiltersSearchCriteria(searchFilter = []) {
  let searchCriteriaList = [];
  let studentTypeFilterList = [];
  let fteFilterList = [];
  let supportBlockList = [];
  let careerProgramFundingList = [];
  let careerCodeList = [];
  let careerProgramsList = [];
  let frenchProgramsList = [];
  let englishProgramsList = [];
  let frenchProgramFundingList = [];
  let indigenousProgramList = [];
  let ancestryList = [];
  let indigenousProgramsFundingList = [];
  let bandCodeList = [];
  let spedCodeList = [];
  let spedFundingList = [];
  let ellList = [];
  let ellFunding = [];
  let refugeeFunding = [];
  let fundingTypeList = [];
  let courseRangeList = [];
  let penLocalIdNameFilter = [];
  let nameFilter = [];
  let penLocalIdFilter = [];
  let schoolNameNumberFilter = [];
  let districtNameNumberFilter = [];
  for (const [key, filter] of Object.entries(searchFilter)) {
    let pValue = filter ? filter.map(filter => filter.value) : null;
    if (key === 'studentType' && pValue) {
      studentTypeFilterList = createStudentTypeFilter(pValue);
    }
    if (key === 'fte' && pValue) {
      fteFilterList = createFteFilter(pValue);
    }
    if (key === 'careerCode' && pValue) {
      careerCodeList = careerCodeFilter(pValue);
    }
    if (key === 'careerPrograms' && pValue) {
      careerProgramsList = createCareerProgramFilter(pValue);
    }
    if (key === 'frenchProgram' && pValue) {
      frenchProgramsList = createFrenchProgramFilter(pValue);
    }
    if (key === 'englishProgram' && pValue) {
      englishProgramsList = createEnglishProgramFilter(pValue);
    }
    if( key === 'indigenousPrograms' && pValue) {
      indigenousProgramList = createIndigenousProgramFilter(pValue);
    }
    if (key === 'support' && pValue) {
      supportBlockList = createSupportBlockFilter(pValue);
    }
    if(key === 'careerProgramsFunding' && pValue) {
      careerProgramFundingList = createCareerProgramFundingfilter(pValue);
    }
    if(key === 'ancestry' && pValue) {
      ancestryList = createAncestryFilter(pValue);
    }
    if(key === 'indigenousProgramsFunding' && pValue) {
      indigenousProgramsFundingList = createIndigenousFundingFilter(pValue);
    }
    if(key === 'frenchFunding' && pValue) {
      frenchProgramFundingList = createFrenchFundingFilter(pValue);
    }
    if(key === 'sped' && pValue) {
      spedCodeList = createSpedFilter(pValue);
    }
    if(key === 'spedFunding' && pValue) {
      spedFundingList = createSpedFundingFilter(pValue);
    }
    if(key === 'ellYears' && pValue) {
      ellList = createEllYearsFilter(pValue);
    }
    if(key === 'ellFunding' && pValue) {
      ellFunding = createEllFundingFilter(pValue);
    }
    if(key === 'refugeeFunding' && pValue) {
      refugeeFunding = createRefugeeFundingFilter(pValue);
    }
    if (key === 'warnings' && pValue) {
      validateWarningFilter(pValue);
      searchCriteriaList.push({ key: 'sdcSchoolCollectionStudentStatusCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }
    if (key === 'grade' && pValue) {
      validateGradeFilter(pValue);
      searchCriteriaList.push({ key: 'enrolledGradeCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }
    if (key === 'fteZero' && pValue) {
      validateFteZeroFilter(pValue);
      searchCriteriaList.push({ key: 'fteZeroReasonCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }
    if (key === 'fundingType' && pValue) {
      fundingTypeList = createFundingTypeFilter(pValue);
    }
    if (key === 'bandResidence' && pValue) {
      bandCodeList.push({ key: 'bandCode', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
    }
    if (key === 'bandCode' && pValue) {
      if (pValue.toString() === 'true') {
        bandCodeList.push({ key: 'bandCode', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
      } else if (pValue.toString() === 'false') {
        bandCodeList.push({ key: 'bandCode', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
      }
    }
    if (key === 'numberOfCoursesDec' && pValue) {
      courseRangeList = createCourseRangeFilter(pValue);
    }
    if (key === 'penLocalIdName' && pValue) {
      if (/^\d+$/.test(pValue)) {
        // pValue consists only of numbers
        let penCriteria = createLocalIdPenSearchCriteria(pValue.toString());
        penLocalIdNameFilter.push(...penCriteria);
      } else if (/^[a-z\-.'\s]+$/i.test(pValue)) {
        // pValue consists only of alphabetical characters and allowed name characters
        let nameCriteria = createMultiFieldNameSearchCriteria(pValue.toString());
        penLocalIdNameFilter.push(...nameCriteria);
      } else {
        // pValue contains both numbers and alphabetical characters or unknown characters
        let nameCriteria = createMultiFieldNameSearchCriteria(pValue.toString());
        let penCriteria = createLocalIdPenSearchCriteria(pValue.toString());
        penLocalIdNameFilter.push(...nameCriteria, ...penCriteria);
      }
    }
    if (key === 'schoolNameNumber' && pValue) {
      let schoolNameNumberCriteria = createSchoolNameNumberSearchCriteria(pValue.toString());
      schoolNameNumberFilter = [...schoolNameNumberCriteria];
    }
    if (key === 'districtNameNumber' && pValue) {
      let districtNameNumberCriteria = createDistrictNameNumberSearchCriteria(pValue.toString());
      districtNameNumberFilter = [...districtNameNumberCriteria];
    }
    if (key === 'legalFirstName' && pValue) {
      let nameCriteria = createNameCriteria(key, pValue.toString());
      nameFilter = [...nameFilter, ...nameCriteria];
    }
    if (key === 'legalMiddleNames' && pValue) {
      let nameCriteria = createNameCriteria(key, pValue.toString());
      nameFilter = [...nameFilter, ...nameCriteria];
    }
    if (key === 'legalLastName' && pValue) {
      let nameCriteria = createNameCriteria(key, pValue.toString());
      nameFilter = [...nameFilter, ...nameCriteria];
    }
    if (key === 'usualFirstName' && pValue) {
      let nameCriteria = createNameCriteria(key, pValue.toString());
      nameFilter = [...nameFilter, ...nameCriteria];
    }
    if (key === 'usualMiddleNames' && pValue) {
      let nameCriteria = createNameCriteria(key, pValue.toString());
      nameFilter = [...nameFilter, ...nameCriteria];
    }
    if (key === 'usualLastName' && pValue) {
      let nameCriteria = createNameCriteria(key, pValue.toString());
      nameFilter = [...nameFilter, ...nameCriteria];
    }
    if (key === 'studentPen' && pValue) {
      let penLocalIdCriteria = createPenLocalIdCriteria(key, pValue.toString());
      penLocalIdFilter = [...penLocalIdFilter, ...penLocalIdCriteria];
    }
    if (key === 'assignedPen' && pValue) {
      let penLocalIdCriteria = createPenLocalIdCriteria(key, pValue.toString());
      penLocalIdFilter = [...penLocalIdFilter, ...penLocalIdCriteria];
    }
    if (key === 'localID' && pValue) {
      let penLocalIdCriteria = createPenLocalIdCriteria(key, pValue.toString());
      penLocalIdFilter = [...penLocalIdFilter, ...penLocalIdCriteria];
    }
  }
  const search = [];
  if (searchCriteriaList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: searchCriteriaList
    });
  }
  if (fundingTypeList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: fundingTypeList
    });
  }
  if (studentTypeFilterList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: studentTypeFilterList
    });
  }
  if (fteFilterList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: fteFilterList
    });
  }
  if (supportBlockList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: supportBlockList
    });
  }
  if (careerProgramFundingList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: careerProgramFundingList
    });
  }
  if (careerCodeList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: careerCodeList
    });
  }
  if (careerProgramsList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: careerProgramsList
    });
  }
  if (frenchProgramsList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: frenchProgramsList
    });
  }
  if (englishProgramsList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: englishProgramsList
    });
  }
  if (frenchProgramFundingList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: frenchProgramFundingList
    });
  }
  if(indigenousProgramList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: indigenousProgramList
    });
  }
  if(ancestryList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: ancestryList
    });
  }
  if(indigenousProgramsFundingList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: indigenousProgramsFundingList
    });
  }
  if(bandCodeList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: bandCodeList
    });
  }
  if(spedCodeList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: spedCodeList
    });
  }
  if(spedFundingList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: spedFundingList
    });
  }
  if(ellFunding.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: ellFunding
    });
  }
  if(refugeeFunding.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: refugeeFunding
    });
  }
  if(ellList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: ellList
    });
  }
  if(courseRangeList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: courseRangeList
    });
  }
  if (penLocalIdNameFilter.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: penLocalIdNameFilter
    });
  }
  if (schoolNameNumberFilter.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: schoolNameNumberFilter
    });
  }
  if (districtNameNumberFilter.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: districtNameNumberFilter
    });
  }
  if (nameFilter.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: nameFilter
    });
  }
  if (penLocalIdFilter.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: penLocalIdFilter
    });
  }
  return search;
}

function validateFteZeroFilter(filters) {
  let fteZeroCategories = [
    'OUTOFPROV',
    'NOMROLL',
    'TOOYOUNG',
    'INDYADULT',
    'INACTIVE',
    'DISTDUP',
    'AUTHDUP'
  ];
  if (filters.length > 0) {
    if (!filters.every(value => fteZeroCategories.includes(value))) {
      log.error('Invalid zero fte reason code.');
      throw new Error('400');
    }
  }
}

function validateGradeFilter(filterGrades = []) {
  const activeGradeCodes = cacheService.getActiveEnrolledGradeCodes().map(grade => grade.enrolledGradeCode);
  if (filterGrades.length > 0) {
    if (!filterGrades.every(value => activeGradeCodes.includes(value))) {
      log.error('Invalid grade filter.');
      throw new Error('400');
    }
  }
}

function validateFundingTypeFilter(filterFunding = []) {
  const activeFundingCodes = cacheService.getActiveSchoolFundingCodes();
  if (filterFunding.length > 0) {
    if (filterFunding.every(value => activeFundingCodes.includes(code => code !== 'No Funding' && value === code.schoolFundingCode))) {
      log.error('Invalid funding code filter.');
      throw new Error('400');
    }
  }
}

function validateCareerCodeFilter(filterCareerCodes = []) {
  const activeFundingCodes = cacheService.getActiveCareerProgramCodes();
  if (filterCareerCodes.length > 0) {
    if (filterCareerCodes.every(value => activeFundingCodes.includes(code => value === code.careerProgramCode))) {
      log.error('Invalid career code filter.');
      throw new Error('400');
    }
  }
}

function validateEnrolledProgramFilter(filterGrades = []) {
  const activeFundingCodes = cacheService.getActiveEnrolledProgramCodes();
  if (filterGrades.length > 0) {
    if (filterGrades.every(value => activeFundingCodes.includes(code => value === code.enrolledProgramCode))) {
      log.error('Invalid enrolled program filter.');
      throw new Error('400');
    }
  }
}

function validateWarningFilter(filters = []) {
  let allowedWarningValues = [
    'FUNDWARN',
    'INFOWARN',
    'ERROR',
    'DELETED'
  ];
  if (filters.length > 0) {
    if (!filters.every(value => allowedWarningValues.includes(value))) {
      log.error('Invalid warning filter.');
      throw new Error('400');
    }
  }
}

function validateSpedCodes(filters = []) {
  const activeSpedCodes = cacheService.getActiveSpecialEducationCodes();
  if (filters.length > 0) {
    if (filters.every(value => activeSpedCodes.includes(code => value === code.specialEducationCategoryCode))) {
      log.error('Invalid inclusive education filter.');
      throw new Error('400');
    }
  }
}

function createFundingTypeFilter(pValue) {
  let fundingTypeList = [];
  validateFundingTypeFilter(pValue);

  if (pValue.includes('14')) {
    fundingTypeList.push({ key: 'schoolFundingCode', value: '14', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
  }
  if (pValue.includes('20')) {
    fundingTypeList.push({ key: 'schoolFundingCode', value: '20', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
  }
  if (pValue.includes('16')) {
    fundingTypeList.push({ key: 'schoolFundingCode', value: '16', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
  }
  if (pValue.includes('No Funding')) {
    fundingTypeList.push({ key: 'schoolFundingCode', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
  }
  return fundingTypeList;
}

function createEllYearsFilter(pValue) {
  let ellList = [];
  if(pValue.includes('ell1Between5')) {
    ellList.push({ key: 'yearsInEll', value: 1, operation: FILTER_OPERATION.GREATER_THAN_OR_EQUAL_TO, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.AND });
    ellList.push({ key: 'yearsInEll', value: 5, operation: FILTER_OPERATION.LESS_THAN_OR_EQUAL_TO, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.AND });
  }
  if(pValue.includes('ellGtEq6')) {
    ellList.push({ key: 'yearsInEll', value: 6, operation: FILTER_OPERATION.GREATER_THAN_OR_EQUAL_TO, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.OR });
  }
  return ellList;
}

function createFrenchFundingFilter(pValue) {
  let frenchProgramFundingList = [];

  if (pValue.toString() === 'true') {
    frenchProgramFundingList.push({ key: 'frenchProgramNonEligReasonCode', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  } else if (pValue.toString() === 'false') {
    frenchProgramFundingList.push({ key: 'frenchProgramNonEligReasonCode', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  }

  return frenchProgramFundingList;
}

function createIndigenousFundingFilter(pValue) {
  let indigenousProgramsFundingList = [];

  if (pValue.toString() === 'true') {
    indigenousProgramsFundingList.push({ key: 'indigenousSupportProgramNonEligReasonCode', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  } else if (pValue.toString() === 'false') {
    indigenousProgramsFundingList.push({ key: 'indigenousSupportProgramNonEligReasonCode', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  }

  return indigenousProgramsFundingList;
}

function createSpedFundingFilter(pValue) {
  let spedFundingList = [];

  if (pValue.toString() === 'true') {
    spedFundingList.push({ key: 'specialEducationNonEligReasonCode', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  } else if (pValue.toString() === 'false') {
    spedFundingList.push({ key: 'specialEducationNonEligReasonCode', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  }

  return spedFundingList;
}

function createSpedFilter(pValue) {
  let spedCodeList = [];
  validateSpedCodes(pValue);
  if (pValue.includes('noSpedCode')) {
    const notInValues = cacheService.getActiveSpecialEducationCodes().map(x=>x.specialEducationCategoryCode).filter(value => !pValue.includes(value) && pValue!=='noSpedCode');
    if(notInValues?.length > 0) { //if all filters are selected then it is equivalent to no filters being selected
      spedCodeList.push({ key: 'specialEducationCategoryCode', value: notInValues.toString(), operation: FILTER_OPERATION.NOT_IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
    }
  } else {
    spedCodeList.push({ key: 'specialEducationCategoryCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
  }
  return spedCodeList;
}

function createEllFundingFilter(pValue) {
  let ellFundingList = [];

  if (pValue.toString() === 'true') {
    ellFundingList.push({ key: 'ellNonEligReasonCode', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  } else if (pValue.toString() === 'false') {
    ellFundingList.push({ key: 'ellNonEligReasonCode', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  }

  return ellFundingList;
}

function createRefugeeFundingFilter(pValue) {
  let refugeeFundingList = [];

  if (pValue.toString() === 'true') {
    refugeeFundingList.push({
      key: 'sdcStudentValidationIssueEntities.validationIssueCode',
      value: 'REFUGEEINPREVCOL',
      operation: FILTER_OPERATION.NONE_IN,
      valueType: VALUE_TYPE.STRING,
      condition: CONDITION.AND
    });
    refugeeFundingList.push({
      key: 'sdcStudentValidationIssueEntities.validationIssueCode',
      value: 'REFUGEEISADULT',
      operation: FILTER_OPERATION.NONE_IN,
      valueType: VALUE_TYPE.STRING,
      condition: CONDITION.AND
    });
  } else if (pValue.toString() === 'false') {
    refugeeFundingList.push({
      key: 'sdcStudentValidationIssueEntities.validationIssueCode',
      value: 'REFUGEEINPREVCOL',
      operation: FILTER_OPERATION.IN,
      valueType: VALUE_TYPE.STRING,
      condition: CONDITION.OR
    });
    refugeeFundingList.push({
      key: 'sdcStudentValidationIssueEntities.validationIssueCode',
      value: 'REFUGEEISADULT',
      operation: FILTER_OPERATION.IN,
      valueType: VALUE_TYPE.STRING,
      condition: CONDITION.OR
    });
  }

  return refugeeFundingList;
}

function createAncestryFilter(pValue) {
  let ancestryList = [];

  if (pValue.toString() === 'true') {
    ancestryList.push({ key: 'nativeAncestryInd', value: 'Y', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  } else if (pValue.toString() === 'false') {
    ancestryList.push({ key: 'nativeAncestryInd', value: 'N', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  }

  return ancestryList;
}

function createCareerProgramFundingfilter(pValue) {
  let careerProgramFundingList = [];
  if (pValue.toString() === 'isCareerFundingEligible') {
    careerProgramFundingList.push({ key: 'careerProgramNonEligReasonCode', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  } else if (pValue.toString() === 'isNotCareerFundingEligible') {
    careerProgramFundingList.push({ key: 'careerProgramNonEligReasonCode', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  }
  return careerProgramFundingList;
}

function createSupportBlockFilter(pValue) {
  let supportBlockList = [];

  if (pValue.toString() === 'hasSupportBlocks') {
    supportBlockList.push({ key: 'supportBlocks', value: '0', operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    supportBlockList.push({ key: 'supportBlocks', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  } else if (pValue.toString() === 'noSupportBlocks') {
    supportBlockList.push({ key: 'supportBlocks', value: '0', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
    supportBlockList.push({ key: 'supportBlocks', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
  }

  return supportBlockList;
}

function createIndigenousProgramFilter(pValue) {
  let indigenousProgramList = [];

  validateEnrolledProgramFilter(pValue);
  if (pValue.includes('noIndigenousPrograms')) {
    const notInValues = ENROLLED_PROGRAM_TYPE_CODE_MAP.INDIGENOUS_ENROLLED_PROGRAM_CODES.filter(value => !pValue.includes(value) && pValue!=='noIndigenousPrograms');
    if(notInValues?.length > 0) { //if all filters are selected then it is equivalent to no filters being selected
      indigenousProgramList.push({ key: 'sdcStudentEnrolledProgramEntities.enrolledProgramCode', value: notInValues.toString(), operation: FILTER_OPERATION.NONE_IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
    }
  } else {
    indigenousProgramList.push({ key: 'sdcStudentEnrolledProgramEntities.enrolledProgramCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
  }
  return indigenousProgramList;
}

function createFrenchProgramFilter(pValue) {
  let frenchProgramsList = [];

  validateEnrolledProgramFilter(pValue);
  if (pValue.includes('noFrenchPrograms')) {
    const notInValues = ENROLLED_PROGRAM_TYPE_CODE_MAP.FRENCH_ENROLLED_PROGRAM_CODES.filter(value => !pValue.includes(value) && pValue!=='noFrenchPrograms');
    if(notInValues?.length > 0) { //if all filters are selected then it is equivalent to no filters being selected
      frenchProgramsList.push({ key: 'sdcStudentEnrolledProgramEntities.enrolledProgramCode', value: notInValues.toString(), operation: FILTER_OPERATION.NONE_IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
    }
  } else {
    frenchProgramsList.push({ key: 'sdcStudentEnrolledProgramEntities.enrolledProgramCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
  }
  return frenchProgramsList;
}

function createEnglishProgramFilter(pValue) {
  let englishProgramsList = [];

  validateEnrolledProgramFilter(pValue);
  if (pValue.includes('noEnglish17')) {
    englishProgramsList.push({ key: 'sdcStudentEnrolledProgramEntities.enrolledProgramCode', value: ENROLLED_PROGRAM_TYPE_CODE_MAP.ENGLISH_ENROLLED_PROGRAM_CODES.toString(), operation: FILTER_OPERATION.NONE_IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
  } else {
    englishProgramsList.push({ key: 'sdcStudentEnrolledProgramEntities.enrolledProgramCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
  }
  return englishProgramsList;
}

function createCareerProgramFilter(pValue) {
  let careerProgramsList = [];

  validateEnrolledProgramFilter(pValue);
  if (pValue.includes('noCareerPrograms')) {
    const notInValues = ENROLLED_PROGRAM_TYPE_CODE_MAP.CAREER_ENROLLED_PROGRAM_CODES.filter(value => !pValue.includes(value) && pValue!=='noCareerPrograms');
    if(notInValues?.length > 0) { //if all filters are selected then it is equivalent to no filters being selected
      careerProgramsList.push({ key: 'sdcStudentEnrolledProgramEntities.enrolledProgramCode', value: notInValues.toString(), operation: FILTER_OPERATION.NONE_IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
    }
  } else {
    careerProgramsList.push({ key: 'sdcStudentEnrolledProgramEntities.enrolledProgramCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
  }
  return careerProgramsList;
}

function careerCodeFilter(pValue) {
  let careerCodeList = [];

  validateCareerCodeFilter(pValue);
  if (pValue.includes('noCareerCodes')) {
    const notInValues = cacheService.getActiveCareerProgramCodes().map(x=>x.careerProgramCode).filter(value => !pValue.includes(value) && pValue!=='noCareerCodes');
    if(notInValues?.length > 0) { //if all filters are selected then it is equivalent to no filters being selected
      careerCodeList.push({ key: 'careerProgramCode', value: notInValues.toString(), operation: FILTER_OPERATION.NOT_IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
    }
  } else {
    careerCodeList.push({ key: 'careerProgramCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
  }
  return careerCodeList;
}

function createFteFilter(pValue) {
  let fteFilterList = [];

  if (pValue.includes('fteEq0')) {
    fteFilterList.push({ key: 'fte', value: 0, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.OR });
  }
  if (pValue.includes('fteLt1')) {
    fteFilterList.push({ key: 'fte', value: 1, operation: FILTER_OPERATION.LESS_THAN, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.OR });
  }
  if (pValue.includes('fteGt0')) {
    fteFilterList.push({ key: 'fte', value: 0, operation: FILTER_OPERATION.GREATER_THAN, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.OR });
  }

  return fteFilterList;
}

function createCourseRangeFilter(pValue) {
  let courseRangeList = [];

  courseRangeList.push({key:'numberOfCoursesDec', value: pValue[0][1], operation: FILTER_OPERATION.LESS_THAN_OR_EQUAL_TO, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.AND});
  courseRangeList.push({key:'numberOfCoursesDec', value: pValue[0][0], operation: FILTER_OPERATION.GREATER_THAN_OR_EQUAL_TO, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.AND});
  if(pValue[0][0] === '0'){
    courseRangeList.push({key:'numberOfCoursesDec', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR});
  }
  return courseRangeList;
}

function createStudentTypeFilter(pValue) {
  let studentTypeFilterList = [];
  if(pValue.includes(STUDENT_TYPE_CODES.SCHOOL_AGED) && pValue.includes(STUDENT_TYPE_CODES.ADULT) && pValue.includes(STUDENT_TYPE_CODES.PRESCHOOL_AGED)){
    return studentTypeFilterList;
  }
  else if(pValue.includes(STUDENT_TYPE_CODES.SCHOOL_AGED) && pValue.includes(STUDENT_TYPE_CODES.ADULT)){
    studentTypeFilterList.push({ key: 'isSchoolAged', value: 'true', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.BOOLEAN, condition: CONDITION.OR });
    studentTypeFilterList.push({ key: 'isAdult', value: 'true', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.BOOLEAN, condition: CONDITION.OR });
  }
  else if(pValue.includes(STUDENT_TYPE_CODES.SCHOOL_AGED) && pValue.includes(STUDENT_TYPE_CODES.PRESCHOOL_AGED)){
    studentTypeFilterList.push({ key: 'isAdult', value: 'false', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.BOOLEAN, condition: CONDITION.OR });
  }
  else if(pValue.includes(STUDENT_TYPE_CODES.ADULT) && pValue.includes(STUDENT_TYPE_CODES.PRESCHOOL_AGED)){
    studentTypeFilterList.push({ key: 'isSchoolAged', value: 'false', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.BOOLEAN, condition: CONDITION.OR });
  }
  else if (pValue.includes('isSchoolAged')) {
    studentTypeFilterList.push({ key: 'isSchoolAged', value: 'true', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.BOOLEAN, condition: CONDITION.OR });
  }
  else if (pValue.includes('isAdult')) {
    studentTypeFilterList.push({ key: 'isAdult', value: 'true', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.BOOLEAN, condition: CONDITION.OR });
  }
  else if (pValue.includes('isUnderSchoolAged')) {
    studentTypeFilterList.push({ key: 'isSchoolAged', value: 'false', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.BOOLEAN, condition: CONDITION.OR });
    studentTypeFilterList.push({ key: 'isAdult', value: 'false', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.BOOLEAN, condition: CONDITION.AND });
  }
  return studentTypeFilterList;
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

function createNameCriteria(key, nameString) {
  const searchCriteriaList = [];
  if (key === 'usualMiddleNames' || key === 'legalMiddleNames') {
    const names = nameString.split(/\s+/);
    names.forEach(name => {
      searchCriteriaList.push({
        key: key,
        operation: FILTER_OPERATION.CONTAINS_IGNORE_CASE,
        value: `%${name}%`,
        valueType: VALUE_TYPE.STRING,
        condition: CONDITION.AND
      });
    });
  } else {
    searchCriteriaList.push({
      key: key,
      operation: FILTER_OPERATION.CONTAINS_IGNORE_CASE,
      value: `%${nameString}%`,
      valueType: VALUE_TYPE.STRING,
      condition: CONDITION.AND
    });
  }

  return searchCriteriaList;
}

function createPenLocalIdCriteria(key, idString) {
  const searchCriteriaList = [];
  searchCriteriaList.push({
    key: key,
    operation: FILTER_OPERATION.EQUAL,
    value: idString,
    valueType: VALUE_TYPE.STRING,
    condition: CONDITION.AND
  });
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
    key: 'assignedPen',
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

function createSchoolNameNumberSearchCriteria(value) {
  const searchSchoolCriteriaList = [];

  searchSchoolCriteriaList.push({
    key: 'sdcSchoolCollection.sdcSchoolCollectionID',
    operation: FILTER_OPERATION.EQUAL,
    value: value,
    valueType: VALUE_TYPE.UUID,
    condition: CONDITION.AND
  });

  return searchSchoolCriteriaList;
}

function createDistrictNameNumberSearchCriteria(value) {
  const searchDistrictCriteriaList = [];

  searchDistrictCriteriaList.push({
    key: 'sdcSchoolCollection.sdcDistrictCollectionID',
    operation: FILTER_OPERATION.EQUAL,
    value: value,
    valueType: VALUE_TYPE.UUID,
    condition: CONDITION.AND
  });

  return searchDistrictCriteriaList;
}

module.exports = {
  createMoreFiltersSearchCriteria,
  createSchoolNameNumberSearchCriteria,
  createDistrictNameNumberSearchCriteria
};
