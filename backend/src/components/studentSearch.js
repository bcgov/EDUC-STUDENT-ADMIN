'use strict';
const { logApiError } = require('./utils');
const HttpStatus = require('http-status-codes');
const log = require('npmlog');
const config = require('../config/index');
const utils = require('./utils');
const util = require('util');

async function searchStudent(req, res) {
  const token = utils.getBackendToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }
  let searchListCriteria = [];

  log.info(util.inspect(req.query, {showHidden: false, depth: 3}));
  if(req.query.searchQueries) {
    let searchQueries = JSON.parse(req.query.searchQueries);
    Object.keys(searchQueries).forEach(element => {
      let operation = 'like_ignore_case';
      let valueType = 'STRING';
      searchListCriteria.push({key: element, operation: operation, value: searchQueries[element], valueType: valueType});
    });
  }

  const params = {
    params: {
      searchCriteriaList: JSON.stringify(searchListCriteria)
    }
  };
  //log.info(util.inspect(req, {showHidden: false, depth: 3}));
  // log.info('Query: ');
  // log.info(util.inspect(params, {showHidden: false, depth: null}));
  // log.info('Query2: ' + req._parsedUrl.query);
  // log.info(util.inspect(req._parsedUrl.query, {showHidden: false, depth: null}));
  // var uri_dec = decodeURIComponent(req._parsedUrl.query);
  // log.info('Query3: ' + uri_dec);

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

module.exports = {
  searchStudent
};
