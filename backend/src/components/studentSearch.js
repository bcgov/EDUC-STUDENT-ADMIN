'use strict';
const { logApiError } = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const utils = require('./utils');
const log = require('./logger');
const { getBackendToken, getData } = require('./utils');
const util = require('util');

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
      let operation = 'like_ignore_case';
      let valueType = 'STRING';

      if (element === 'dob') {
        searchQueries[element] = searchQueries[element].replace(/\//g, '-');
        operation = 'eq';
        valueType = 'DATE';
      }

      searchListCriteria.push({key: element, operation: operation, value: searchQueries[element], valueType: valueType});
    });
  }

  const params = {
    params: {
      pageNumber: req.query.pageNumber,
      searchCriteriaList: JSON.stringify(searchListCriteria)
    }
  };

  log.info(util.inspect(params, {showHidden: false, depth: null}));

  return Promise.all([
    utils.getData(token, config.get('server:studentURL') + '/paginated', params),
  ])
    .then(async ([dataResponse]) =>
    {
      let filteredList = [];
      dataResponse['content'].forEach((element, i) => {
        filteredList.push(dataResponse['content'][i]);
      });
      dataResponse['content'] = filteredList;
      return res.status(200).json(dataResponse);
    }).catch((e) => {
      logApiError(e, 'getStudentById', 'Error occurred while attempting to GET student.');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'INTERNAL SERVER ERROR'
      });
    });
}

async function getStudentGender(req, res) {
  try {
    const accessToken = getBackendToken(req);
    if (!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    const codeUrls = [
      `${config.get('server:studentGenderCodesURL')}`
    ];

    const [genderCodes] = await Promise.all(codeUrls.map(url => getData(accessToken, url)));
    if (genderCodes) {
      // forcing sort if API did not return in sorted order.
      genderCodes.sort((a, b) => a.displayOrder - b.displayOrder);
    }
    return res.status(HttpStatus.OK).json({genderCodes});
  } catch (e) {
    log.error('getCodes Error', e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Get codes error'
    });
  }
}

module.exports = {
  searchStudent,
  getStudentGender
};
