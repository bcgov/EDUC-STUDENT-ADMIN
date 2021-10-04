'use strict';
const {getBackendToken, getData, errorResponse} = require('./utils');
const config = require('../config/index');
const HttpStatus = require('http-status-codes');
const { LocalDateTime } = require('@js-joda/core');
const { FILTER_OPERATION, VALUE_TYPE } = require('../util/constants');
const { logApiError } = require('../components/utils');
const logger = require('../components/logger');

function getLast12MonthsPaginatedStats(url) {
  return function (req, res) {
    try {
      let today = LocalDateTime.now();
      let requestPromises = [];
      let labels = [];
      for (let i = 11; i >= 0; i--) {
        let startDate = today.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        let endDate = today.minusMonths(i).withDayOfMonth(today.minusMonths(i).toLocalDate().lengthOfMonth()).withHour(23).withMinute(59).withSecond(59);
        labels.push(startDate.month());
        let params = {
          params: {
            pageNumber: 0,
            pageSize: 1,
            searchCriteriaList: JSON.stringify([{
              searchCriteriaList: [{
                key: 'createDate',
                operation: FILTER_OPERATION.BETWEEN,
                value: startDate + ',' + endDate,
                valueType: VALUE_TYPE.DATE_TIME
              }]
            }])
          }
        };
        requestPromises.push(getData(getBackendToken(req), url, params));
      }
      Promise.all(requestPromises)
        .then(responses => {
          let data = responses.map(x => x.totalElements);
          return res.status(HttpStatus.OK).json({labels: labels, data: data});
        })
        .catch(e => {
          logApiError(e, 'getLast12MonthsPaginatedStats', 'Error occurred while attempting to search student.');
          return errorResponse(res);
        });
    } catch(error) {
      logger.error('getLast12MonthsPaginatedStats:: Error occurred while attempting to search student.', error);
      return errorResponse(res);
    }
  };

}

function getStatsByStatsType(url) {
  return function(req, res) {
    const statsType = req.query.statsType;
    if (!statsType) {
      return res.status(HttpStatus.BAD_REQUEST).json({message: 'Missing required parameter statsType'});
    }
    getData(getBackendToken(req), url + '/stats?statsType=' + statsType)
      .then(dataResponse => {
        return res.status(HttpStatus.OK).json(dataResponse);
      })
      .catch(e => {
        logApiError(e, 'getStatsByStatsType', 'Error occurred while attempting to retrieve stats.');
        return errorResponse(res);
      });
  };
}
function getNumberOfMergesInLast12Month(req, res) {
  let today = LocalDateTime.now();
  let requestPromises = [];
  let labels = [];
  for (let i = 11; i >= 0; i--) {
    let startDate = today.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
    let endDate = today.minusMonths(i).withDayOfMonth(today.minusMonths(i).toLocalDate().lengthOfMonth()).withHour(23).withMinute(59).withSecond(59);
    labels.push(startDate.month());
    requestPromises.push(findMergesBetweenDates(req, startDate.toString(), endDate.toString()));
  }
  Promise.all(requestPromises)
    .then(responses => {
      let data = responses.map(x => x.length);
      return res.status(HttpStatus.OK).json({labels: labels, data: data});
    })
    .catch(e => {
      return errorResponse(res, e.data, e.status);
    });

}

function findMergesBetweenDates(req, createDateStart, createDateEnd) {
  const params = {params: {createDateStart, createDateEnd}};
  return getData(getBackendToken(req), config.get('server:penServices:rootURL')+'/merges/between-dates-created', params);
}

const getMergeStats = async (req, res) => {
  const statsType = req.query.statsType;
  if (statsType && statsType === 'MERGES_IN_LAST_12_MONTH') {
    return getNumberOfMergesInLast12Month(req, res);
  } else {
    // system will return map of students, each key value pair represents to two students in merge.
    const studentMap = new Map(); // this map will contain the student record as key value pair.
    const studentPromises = [];
    const createDateStart = req.query.createDateStart;
    const createDateEnd = req.query.createDateEnd;
    if (!createDateStart || !createDateEnd) {
      return res.status(HttpStatus.BAD_REQUEST).json({message: 'Missing required parameter createDate start or end'});
    }
    try {
      const results =  await findMergesBetweenDates(req, createDateStart, createDateEnd);
      results.map(el=> el.studentID);
      results.map(el=> el.mergeStudentID);
      return res.status(HttpStatus.OK).json(results);
    } catch (e) {
      return errorResponse(res, e.data, e.status);
    }
  }

};

module.exports = {
  getGMPStatsByStatsType: getStatsByStatsType(config.get('server:penRequest:rootURL')),
  getUMPStatsByStatsType: getStatsByStatsType(config.get('server:studentRequest:rootURL')),
  getNewPenStats: getLast12MonthsPaginatedStats(config.get('server:student:rootURL') + '/paginated'),
  getMergeStats
};
