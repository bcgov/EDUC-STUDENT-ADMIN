'use strict';
const { FILTER_OPERATION, VALUE_TYPE, CONDITION} = require('../../util/constants');


function createMoreFiltersSearchCriteria(searchFilter = []) {
  let searchCriteriaList = [];
  for (const [key, filter] of Object.entries(searchFilter)) {
    let pValue = filter ? filter.map(filter => filter.value) : null;
    if (key === 'specialCaseCode' && pValue) {
      searchCriteriaList.push({ key: 'provincialSpecialCaseCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }
    if (key === 'sessionID' && pValue) {
      searchCriteriaList.push({ key: 'assessmentEntity.sessionEntity.sessionID', value: pValue[0], operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND });
    }
    
    if (key === 'schoolYear' && pValue) {
      searchCriteriaList.push({ key: 'assessmentEntity.sessionEntity.schoolYear', value: pValue[0].replace('-', '/'), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }
  }
  const search = [];
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
