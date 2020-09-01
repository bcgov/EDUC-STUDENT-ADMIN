'use strict';
const { logApiError } = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const utils = require('./utils');

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
      let operation = 'starts_with_ignore_case';
      let valueType = 'STRING';
      if (element === 'dob') {
        if (!searchQueries[element].endDate) {
          searchQueries[element].endDate = searchQueries[element].startDate;
        }
        searchQueries[element].endDate = searchQueries[element].endDate.replace(/\//g, '-');
        searchQueries[element].startDate = searchQueries[element].startDate.replace(/\//g, '-');
        searchQueries[element] = searchQueries[element].startDate +',' + searchQueries[element].endDate;

        operation = 'btn';
        valueType = 'DATE';
      }else if (element.includes('Name')) {
        operation = 'starts_with_ignore_case';
      }else if (element === 'memo') {
        operation = 'like_ignore_case';
      } else if (element === 'postalCode') {
        searchQueries[element] = searchQueries[element].replace(/ +/g, '');
      }

      searchListCriteria.push({key: element, operation: operation, value: searchQueries[element], valueType: valueType});
    });
  }

  const params = {
    params: {
      pageNumber: req.query.pageNumber,
      sort: req.query.sort,
      searchCriteriaList: JSON.stringify(searchListCriteria)
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
