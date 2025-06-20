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
      searchCriteriaList.push({ key: 'assessmentEntity.assessmentSessionEntity.schoolYear', value: pValue[0].replace('-', '/'), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }  
    //Default Filter End
    
    if (key === 'givenName' && pValue) {
      searchCriteriaList.push({ key: 'givenName', value: pValue.toString(), operation: FILTER_OPERATION.CONTAINS_IGNORE_CASE, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }

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
      searchCriteriaList.push({ key: 'districtID', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND });
    }

    if (key === 'schoolNameNumber' && pValue) {
      searchCriteriaList.push({ key: 'schoolID', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND });
    }

    if (key === 'assessmentCenterNameNumber' && pValue) {
      searchCriteriaList.push({ key: 'assessmentCenterID', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND });
    }

    if (key === 'session' && pValue) {
      searchCriteriaList.push({ key: 'assessmentEntity.assessmentSessionEntity.sessionID', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND });
    }

    if (key === 'assessmentTypeCode' && pValue) {
      searchCriteriaList.push({ key: 'assessmentEntity.assessmentTypeCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }
    
    if (key === 'specialCaseCode' && pValue) {
      searchCriteriaList.push({ key: 'provincialSpecialCaseCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }

    if (key === 'proficiencyScore' && pValue) {
      if(JSON.parse(pValue) === true) {
        searchCriteriaList.push({ key: 'proficiencyScore', value: 0, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.AND });        
      } else {
        searchCriteriaList.push({ key: 'proficiencyScore', value:0, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.AND });        
      }     
    }

    if (key === 'proficiencyScoreValue' && pValue) {
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


module.exports = {
  createMoreFiltersSearchCriteria
};
