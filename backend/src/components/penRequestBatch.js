'use strict';
const { logApiError } = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const { getBackendToken, getData, errorResponse } = require('./utils');
const {FILTER_OPERATION, CONDITION, VALUE_TYPE} = require('../util/constants');

async function getPENBatchRequestStats(req, res) {
  const schoolGroupCodes = [
    {
      schoolGroupCode: 'K12'
    },
    {
      schoolGroupCode: 'PSI'
    }
  ];
  let promises = [];
  schoolGroupCodes.forEach((schoolGroupCode) => {
    const search = {
      searchCriteriaList: [
        {
          key: 'schoolGroupCode',
          operation: FILTER_OPERATION.EQUAL,
          value: schoolGroupCode.schoolGroupCode,
          valueType: VALUE_TYPE.STRING
        },
        {
          condition: CONDITION.AND,
          key: 'penRequestBatchStatusCode',
          operation: FILTER_OPERATION.IN,
          value: 'ACTIVE,UNARCHIVED',
          valueType: VALUE_TYPE.STRING
        }
      ]
    };
    promises.push(
      getData(getBackendToken(req), config.get('server:penRequestBatch:paginated') , {params: { pageSize: config.get('server:penRequestBatch:maxPaginatedElements'), searchCriteriaList: JSON.stringify(search) }}),
    );
  });
  return Promise.all(promises).then((response) => {
    let formattedResponse = {};
    schoolGroupCodes.forEach((schoolGroupCode, index) => {
      formattedResponse[schoolGroupCode.schoolGroupCode] = {
        pending: response[index].totalElements,
        fixable: response[index].content.reduce((a, b) => +a + (+b['fixableCount'] || 0), 0),
        repeats: response[index].content.reduce((a, b) => +a + (+b['repeatCount'] || 0), 0),
        unarchived: response[index].content.filter((obj) => obj.penRequestBatchStatusCode === 'UNARCHIVED').length
      };
    });
    return res.status(200).json(formattedResponse);
  }).catch(e => {
    logApiError(e, 'getPENBatchRequestStats', 'Error occurred while attempting to GET number of pen batch requests.');
    return errorResponse(res);
  });
}

async function getPenRequestFiles(req, res) {
  try {
    const token = getBackendToken(req);
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    const params = {
      params: {
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        sort: req.query.sort,
        searchCriteriaList: JSON.stringify(req.query.searchQueries.map((query) => JSON.parse(query)))
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
  getPENBatchRequestStats,
  getPenRequestFiles,
};
