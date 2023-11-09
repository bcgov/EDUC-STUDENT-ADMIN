'use strict';
const {logApiError, logInfo} = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const utils = require('./utils');
const { FILTER_OPERATION, VALUE_TYPE, CONDITION } = require('../util/constants');

async function searchStudent(req, res) {
  let searchListCriteria = [];
  let legalNicknames = [];
  let usualNicknames = [];
  let isAuditHistorySearch = 'false';

  if(req.query.searchQueries) {
    let searchQueries = req.query.searchQueries;
    isAuditHistorySearch = searchQueries['isAuditHistorySearch'];
    const useNameVariants = searchQueries['useNameVariants'];
    if (useNameVariants) {
      if (searchQueries['legalFirstName']) {
        legalNicknames = await getNicknames(searchQueries['legalFirstName']);
      }
      if (searchQueries['usualFirstName']) {
        usualNicknames = await getNicknames(searchQueries['usualFirstName']);
      }
    }
    Object.keys(searchQueries).forEach(element => {
      let operation = FILTER_OPERATION.STARTS_WITH;
      let valueType = VALUE_TYPE.STRING;
      if (element === 'useNameVariants' || element === 'isAuditHistorySearch') {
        return;
      } else if (element === 'dob' || element === 'createDate') {
        if (!searchQueries[element].endDate) {
          searchQueries[element].endDate = searchQueries[element].startDate;
        }
        searchQueries[element].endDate = searchQueries[element].endDate.replace(/\//g, '-');
        searchQueries[element].startDate = searchQueries[element].startDate.replace(/\//g, '-');
        searchQueries[element] = searchQueries[element].startDate +',' + searchQueries[element].endDate;

        operation = FILTER_OPERATION.BETWEEN;
        valueType = VALUE_TYPE.DATE;

        if(element === 'createDate'){
          valueType = VALUE_TYPE.DATE_TIME;
        }
      } else if (element.includes('Name')) {
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

          if (useNameVariants) {
            if (element === 'legalFirstName') {
              operation = FILTER_OPERATION.IN;
              legalNicknames.push(searchQueries[element].toUpperCase());
              searchQueries[element] = legalNicknames.join(',');
            }
            if (element === 'usualFirstName') {
              operation = FILTER_OPERATION.IN;
              usualNicknames.push(searchQueries[element].toUpperCase());
              searchQueries[element] = usualNicknames.join(',');
            }
          }
        }
      } else if (element === 'gradeCode' || element === 'genderCode') {
        operation = FILTER_OPERATION.EQUAL;
      } else if (element === 'memo') {
        operation = FILTER_OPERATION.CONTAINS_IGNORE_CASE;
      } else if (element === 'postalCode') {
        searchQueries[element] = searchQueries[element].replace(/ +/g, '');
      } else if (element === 'statusCode') {
        operation = FILTER_OPERATION.IN;
        searchQueries[element] = searchQueries[element].join(',');
      } else if (element === 'mincode') {
        if(searchQueries[element].notstartswith){
          operation = FILTER_OPERATION.NOT_STARTS_WITH;
          searchQueries[element] = searchQueries[element].notstartswith;
        }
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

  const baseUrl = config.get('server:student:rootURL');
  try {
    const dataResponse = await utils.getData(isAuditHistorySearch === 'true' ? baseUrl + '/history/paginated/distinct/students' : baseUrl + '/paginated', params);
    if (dataResponse?.totalElements > 2000000) {
      logInfo(`Search Criteria produced ${dataResponse?.totalElements} records`, params?.params);
      return res.status(400).json({
        message: 'Search criteria produced more than 2 million results, Please narrow down the search criteria.'
      });
    }
    return res.status(200).json(dataResponse);
  } catch (e) {
    logApiError(e, 'getStudentById', 'Error occurred while attempting to search student.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }

}

async function getNicknames(givenName) {
  return utils.getData(config.get('server:penMatch:rootURL') + '/nicknames/' + givenName
  ).then((dataResponse) => {
    return dataResponse;
  }).catch((e) => {
    logApiError(e, 'getNicknames', 'Error occurred while attempting to retrieve nicknames.');
    throw e;
  });
}

async function getStudentHistoryByStudentID(req, res) {
  const params = {
    params: {
      pageSize: req.query.pageSize <= 20 ? req.query.pageSize : 20,
      pageNumber: req.query.pageNumber,
      sort: req.query.sort,
    }
  };

  try {
    const dataResponse = await utils.getData(`${config.get('server:student:rootURL')}/${req.params.id}/history/paginated`, params);
    const dataWithTrueStudentID = dataResponse.content.filter(item => item.trueStudentID);
    const trueStudentIDs = dataWithTrueStudentID.map(item => item.trueStudentID).join();
    if(trueStudentIDs.length > 0) {
      const students = await utils.getStudentsFromStudentAPIByTheirIds(trueStudentIDs);
      dataWithTrueStudentID.forEach(item => {
        item.truePen = students.content.find(student => student.studentID === item.trueStudentID)?.pen;
      });
    }
    return res.status(200).json(dataResponse);
  } catch (e) {
    logApiError(e, 'getStudentHistoryByStudentID', 'Error occurred while attempting to get student history.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}

module.exports = {
  searchStudent,
  getStudentHistoryByStudentID
};
