'use strict';
const { FILTER_OPERATION, VALUE_TYPE, CONDITION} = require('../../util/constants');

function createMoreFiltersSearchCriteria(searchFilter = []) {
  let searchCriteriaList = [];

  let districtNameNumberFilter = [];
  let schoolNameNumberFilter = [];
  let assessmentCenterNameNumberFilter = [];

  for (const [key, filter] of Object.entries(searchFilter)) {
    let pValue = filter ? filter.map(filter => filter.value) : null;
    
    //Default Filter Begin
    if (key === 'schoolYear' && pValue) {
      searchCriteriaList.push({ key: 'assessmentEntity.sessionEntity.schoolYear', value: pValue[0].replace('-', '/'), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }  
    //Default Filter End
    
    if (key === 'surName' && pValue) {
      searchCriteriaList.push({ key: 'surName', value: pValue.toString(), operation: FILTER_OPERATION.CONTAINS_IGNORE_CASE, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }

    if (key === 'pen' && pValue) {
      searchCriteriaList.push({ key: 'pen', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }

    if (key === 'localID' && pValue) {
      searchCriteriaList.push({ key: 'localID', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }

    if (key === 'districtNameNumber' && pValue) {
      let districtNameNumberCriteria = createDistrictNameNumberSearchCriteria(pValue.toString());
      districtNameNumberFilter = [...districtNameNumberCriteria];
    }

    if (key === 'schoolNameNumber' && pValue) {
      let schoolNameNumberCriteria = createSchoolNameNumberSearchCriteria(pValue.toString());
      schoolNameNumberFilter = [...schoolNameNumberCriteria];
    }

    if (key === 'assessmentCenterNameNumber' && pValue) {
      let schoolNameNumberCriteria = createAssessmentCenterNameNumberSearchCriteria(pValue.toString());
      assessmentCenterNameNumberFilter = [...schoolNameNumberCriteria];
    }

    if (key === 'session' && pValue) {
      searchCriteriaList.push({ key: 'assessmentEntity.sessionEntity.sessionID', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND });
    }

    if (key === 'assessmentTypeCode' && pValue) {
      searchCriteriaList.push({ key: 'assessmentEntity.assessmentTypeCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }
    
    if (key === 'specialCaseCode' && pValue) {
      searchCriteriaList.push({ key: 'provincialSpecialCaseCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }

    if (key === 'proficienyScore' && pValue) {
      if(JSON.parse(pValue) === true) {
        searchCriteriaList.push({ key: 'proficiencyScore', value: 0, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.AND });        
      } else {
        searchCriteriaList.push({ key: 'proficiencyScore', value:0, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.AND });        
      }     
    }

    if (key === 'proficienyScoreValue' && pValue) {
      searchCriteriaList.push({ key: 'proficiencyScore', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.AND });
    }

  }
  const search = [];  
  if (districtNameNumberFilter.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: districtNameNumberFilter
    });
  }
  if (schoolNameNumberFilter.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: schoolNameNumberFilter
    });
  }
  if (assessmentCenterNameNumberFilter.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: assessmentCenterNameNumberFilter
    });
  }
  if (searchCriteriaList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: searchCriteriaList
    });
  }
  return search;
}

function createDistrictNameNumberSearchCriteria(value) {
  const searchDistrictCriteriaList = [];

  searchDistrictCriteriaList.push({
    key: 'districtID',
    operation: FILTER_OPERATION.EQUAL,
    value: value,
    valueType: VALUE_TYPE.UUID,
    condition: CONDITION.AND
  });

  return searchDistrictCriteriaList;
}

function createSchoolNameNumberSearchCriteria(value) {
  const searchSchoolCriteriaList = [];

  searchSchoolCriteriaList.push({
    key: 'schoolID',
    operation: FILTER_OPERATION.EQUAL,
    value: value,
    valueType: VALUE_TYPE.UUID,
    condition: CONDITION.AND
  });

  return searchSchoolCriteriaList;
}

function createAssessmentCenterNameNumberSearchCriteria(value) {
  const searchAssessmentCenterCriteriaList = [];

  searchAssessmentCenterCriteriaList.push({
    key: 'assessmentCenterID',
    operation: FILTER_OPERATION.EQUAL,
    value: value,
    valueType: VALUE_TYPE.UUID,
    condition: CONDITION.AND
  });

  return searchAssessmentCenterCriteriaList;
}


module.exports = {
  createMoreFiltersSearchCriteria
};
