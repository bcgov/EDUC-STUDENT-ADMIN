'use strict';
const { logApiError } = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const { getBackendToken, getData } = require('./utils');

async function getPenRequestFiles(req, res) {
  try {
    const token = getBackendToken(req);
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }
    let searchListCriteria = [];

    if(req.query.searchQueries) {
      let searchQueries = JSON.parse(req.query.searchQueries);
      Object.keys(searchQueries).forEach(element => {
        let operation = 'gt';
        let valueType = 'LONG';
        if (element === 'schoolGroupCode') {
          operation = 'starts_with_ignore_case';
          valueType = 'STRING';
        } else if (element === 'penRequestBatchStatusCode') {
          operation = 'in';
          valueType = 'STRING';
        }
        searchListCriteria.push({key: element, operation: operation, value: searchQueries[element], valueType: valueType});
      });
    }

    const params = {
      params: {
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        sort: req.query.sort,
        searchCriteriaList: JSON.stringify(searchListCriteria)
      }
    };

    const dataResponse = await getData(token, config.get('server:penRequestBatch:rootURL') + '/pen-request-batch/paginated', params);
    return res.status(200).json(dataResponse);

  } catch (e) {
    logApiError(e, 'getPenRequestFiles', 'Error occurred while attempting to get pen rquest files.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}

module.exports = {
  getPenRequestFiles,
};
