import {
  SEARCH_CONDITION,
  SEARCH_FILTER_OPERATION,
  SEARCH_VALUE_TYPE
} from '@/utils/constants';

export function getSearchParam(paramName, paramValue, namePrefix) {
  let operation = SEARCH_FILTER_OPERATION.EQUAL;
  let valueType = SEARCH_VALUE_TYPE.STRING;
  if (!paramValue) {
    return null;
  }
  if (paramName === 'dob') {
    paramValue = paramValue.replace(/\//g, '');
  } else if (paramName === 'schoolName') {
    operation = SEARCH_FILTER_OPERATION.STARTS_WITH_IGNORE_CASE;
  } else if (paramName.includes('Name')) {
    operation = SEARCH_FILTER_OPERATION.STARTS_WITH;
  } else if (paramName === 'postalCode') {
    paramValue = paramValue.replace(/ +/g, '');
  } else if (paramName === 'load') {
    if (!paramValue.startDate && !paramValue.endDate) {
      return null;
    }

    paramName = 'extractDate';
    valueType = SEARCH_VALUE_TYPE.DATE_TIME;
    let startDate;
    let endDate;
    if (paramValue.startDate && paramValue.startDate.length === 8) { // it has reached here means it is a valid date
      startDate = `${paramValue.startDate.substring(0, 4)}-${paramValue.startDate.substring(4, 6)}-${paramValue.startDate.substring(6, 8)}T00:00:00`;
    } else {
      startDate = paramValue.startDate && `${paramValue.startDate.replace(/\//g, '-')}T00:00:00`;
    }
    if (paramValue.endDate && paramValue.endDate.length === 8) { // it has reached here means it is a valid date
      endDate = `${paramValue.endDate.substring(0, 4)}-${paramValue.endDate.substring(4, 6)}-${paramValue.endDate.substring(6, 8)}T23:59:59`;
    } else {
      endDate = paramValue.endDate && `${paramValue.endDate.replace(/\//g, '-')}T23:59:59`;
    }

    if (startDate && !endDate) {
      operation = SEARCH_FILTER_OPERATION.GREATER_THAN_OR_EQUAL_TO;
      paramValue = startDate;
    } else if (!startDate && endDate) {
      operation = SEARCH_FILTER_OPERATION.LESS_THAN_OR_EQUAL_TO;
      paramValue = endDate;
    } else {
      operation = SEARCH_FILTER_OPERATION.BETWEEN;
      paramValue = `${startDate},${endDate}`;
    }
  } else if(paramName === 'mincode' || paramName === 'submissionNumber') {
    operation = SEARCH_FILTER_OPERATION.STARTS_WITH_IGNORE_CASE;
  }
  return ({key: namePrefix ? `${namePrefix}.${paramName}` : paramName, operation, value: paramValue, valueType, condition: SEARCH_CONDITION.AND});
}

