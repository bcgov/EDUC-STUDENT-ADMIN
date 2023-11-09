'use strict';
const {getData, errorResponse} = require('./utils');
const config = require('../config/index');
const log = require('./logger');
const HttpStatus = require('http-status-codes');
const {LocalDateTime} = require('@js-joda/core');
const {FILTER_OPERATION, VALUE_TYPE} = require('../util/constants');
const {logApiError} = require('../components/utils');
const logger = require('../components/logger');
const utils = require('./utils');

function getLast13MonthsPaginatedStats(url) {
  return function (req, res) {
    try {
      let today = LocalDateTime.now();
      let requestPromises = [];
      let labels = [];
      for (let i = 12; i >= 0; i--) {
        let startDate = today.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        let endDate = today.minusMonths(i).withDayOfMonth(today.minusMonths(i).toLocalDate().lengthOfMonth()).withHour(23).withMinute(59).withSecond(59);
        labels.push((i === 0) ? 'CURRENT' : startDate.month());
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
        requestPromises.push(getData(url, params));
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
    } catch (error) {
      logger.error('getLast12MonthsPaginatedStats:: Error occurred while attempting to search student.', error);
      return errorResponse(res);
    }
  };

}

function getStatsByStatsType(url) {
  return function (req, res) {
    const statsType = req.query.statsType;
    if (!statsType) {
      return res.status(HttpStatus.BAD_REQUEST).json({message: 'Missing required parameter statsType'});
    }
    getData(url + '/stats?statsType=' + statsType)
      .then(dataResponse => {
        return res.status(HttpStatus.OK).json(dataResponse);
      })
      .catch(e => {
        logApiError(e, 'getStatsByStatsType', 'Error occurred while attempting to retrieve stats.');
        return errorResponse(res);
      });
  };
}

function getNumberOfMergesInLast13Month(req, res) {
  getData(config.get('server:penServices:rootURL') + '/merges/stats?statsType=NUMBER_OF_MERGES_IN_LAST_13_MONTH')
    .then(response => {
      return res.status(HttpStatus.OK).json({
        labels: Object.keys(response.numberOfMergesInLastMonths),
        data: Object.values(response.numberOfMergesInLastMonths)
      });
    }).catch(e => {
      return errorResponse(res, e.data, e.status);
    });
}

function findMergesBetweenDates(req, createDateStart, createDateEnd) {
  const params = {params: {createDateStart, createDateEnd}};
  return getData(config.get('server:penServices:rootURL') + '/merges/between-dates-created', params);
}

async function findMergeDetailsBetween(req, res, createDateStart, createDateEnd) {
  try {
    const studentMerges = await findMergesBetweenDates(req, createDateStart, createDateEnd);
    if (!studentMerges || studentMerges.length === 0) {
      log.debug('no record found');
      return res.status(HttpStatus.OK).json([]);
    }else if(studentMerges.length > 1000){
      log.warn('more than 1000 merges found for the time period');
      return res.status(HttpStatus.BAD_REQUEST).json();
    }
    const studentIDs = [];
    const studentsMapList = []; // this Array  will contain the student records as pair {mergedStudent, trueStudent}.
    for (const studentMerge of studentMerges) {
      studentIDs.push(studentMerge.studentID);
      studentIDs.push(studentMerge.mergeStudentID);
    }
    const studentsPage = await utils.getStudentsFromStudentAPIByTheirIds(studentIDs.join());
    const students = studentsPage.content;
    let groupIndex = 0;
    studentMerges.forEach((studentMerge) => {
      const trueStudent = students.find((student) => student.studentID === studentMerge.mergeStudentID);
      const mergedStudent = students.find((student) => student.studentID === studentMerge.studentID);
      if (trueStudent && mergedStudent) {
        studentsMapList.push({...trueStudent, groupIndex});
        studentsMapList.push({...mergedStudent, groupIndex});
        groupIndex++;
      } else {
        log.warn('student records could not be found for this merge data', studentMerge);
      }
    });
    return res.status(HttpStatus.OK).json(studentsMapList);
  } catch (e) {
    return errorResponse(res, e.data, e.status);
  }
}

const getMergeStats = async (req, res) => {
  const statsType = req.query.statsType;
  if (!statsType) {
    return res.status(HttpStatus.BAD_REQUEST).json({message: 'Missing required parameter statsType'});
  }
  let today = LocalDateTime.now();
  let backMidnight = today.withHour(0).withMinute(0).withSecond(0).withNano(0);
  let yesterday;
  switch (statsType) {
  case 'MERGES_IN_LAST_13_MONTH':
    return getNumberOfMergesInLast13Month(req, res);
  case 'MERGE_DETAILS_TODAY':
    yesterday = backMidnight;
    return findMergeDetailsBetween(req, res, yesterday.toString(), today.toString());
  case 'MERGE_DETAILS_LAST_2_WEEKS':
    yesterday = backMidnight.minusWeeks(2);
    return findMergeDetailsBetween(req, res, yesterday.toString(), today.toString());
  case 'MERGE_DETAILS_LAST_MONTH':
    yesterday = backMidnight.minusMonths(1);
    return findMergeDetailsBetween(req, res, yesterday.toString(), today.toString());
  }


};

module.exports = {
  getGMPStatsByStatsType: getStatsByStatsType(config.get('server:penRequest:rootURL')),
  getUMPStatsByStatsType: getStatsByStatsType(config.get('server:studentRequest:rootURL')),
  getNewPenStats: getLast13MonthsPaginatedStats(config.get('server:student:rootURL') + '/paginated'),
  getMergeStats
};
