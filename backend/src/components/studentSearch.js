'use strict';
const { logApiError } = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const utils = require('./utils');
const { FILTER_OPERATION, VALUE_TYPE, CONDITION } = require('../util/constants');

async function searchStudent(req, res) {
  const token = utils.getBackendToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }
  let searchListCriteria = [];

  if(req.query.searchQueries) {
    let searchQueries = JSON.parse(req.query.searchQueries);
    Object.keys(searchQueries).forEach(element => {
      let operation = FILTER_OPERATION.STARTS_WITH;
      let valueType = VALUE_TYPE.STRING;
      if (element === 'dob') {
        if (!searchQueries[element].endDate) {
          searchQueries[element].endDate = searchQueries[element].startDate;
        }
        searchQueries[element].endDate = searchQueries[element].endDate.replace(/\//g, '-');
        searchQueries[element].startDate = searchQueries[element].startDate.replace(/\//g, '-');
        searchQueries[element] = searchQueries[element].startDate +',' + searchQueries[element].endDate;

        operation = FILTER_OPERATION.BETWEEN;
        valueType = VALUE_TYPE.DATE;
      }else if (element.includes('Name')) {
        operation = FILTER_OPERATION.EQUAL;
        if(searchQueries[element]) {
          searchQueries[element] = searchQueries[element].toUpperCase();
          if(searchQueries[element][0] === '*' && searchQueries[element][searchQueries[element].length - 1] === '*') {
            operation = FILTER_OPERATION.CONTAINS;
            searchQueries[element] = searchQueries[element].substring(1, searchQueries[element].length - 1);
          } else if(searchQueries[element][searchQueries[element].length - 1] === '*') {
            operation = FILTER_OPERATION.STARTS_WITH;
            searchQueries[element] = searchQueries[element].substring(0, searchQueries[element].length - 1);
          } else if(searchQueries[element][0] === '*') {
            operation = FILTER_OPERATION.ENDS_WITH;
            searchQueries[element] = searchQueries[element].substring(1);
          } 
        }
      }else if (element === 'memo') {
        operation = FILTER_OPERATION.CONTAINS_IGNORE_CASE;
      } else if (element === 'postalCode') {
        searchQueries[element] = searchQueries[element].replace(/ +/g, '');
      }

      searchListCriteria.push({key: element, condition: CONDITION.AND, operation: operation, value: searchQueries[element], valueType: valueType});
    });
  }
  const search = [
    {
      searchCriteriaList: searchListCriteria
    }
  ];
  const params = {
    params: {
      pageNumber: req.query.pageNumber,
      sort: req.query.sort,
      searchCriteriaList: JSON.stringify(search)
    }
  };

  return Promise.all([
    utils.getData(token, config.get('server:student:rootURL') + '/paginated', params),
  ]).then(([dataResponse]) => {
    return res.status(200).json(dataResponse);
  }).catch((e) => {
    logApiError(e, 'getStudentById', 'Error occurred while attempting to search student.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  });
}

module.exports = {
  searchStudent,
};
