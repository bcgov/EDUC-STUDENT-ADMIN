'use strict';
const { logApiError, getData, putData, handleExceptionResponse } = require('./utils');
const config = require('../config');
const utils = require('./utils');
const cacheService = require('./cache-service');
const {FILTER_OPERATION, VALUE_TYPE, CONDITION} = require('../util/constants');

async function getGradSchool(req, res) {
  try {
    const url = `${config.get('server:gradSchool:rootURL')}/search/${req.params.schoolID}`;
    const data = await getData(url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getGradSchool', 'Error occurred while attempting to GET grad school.');
    return handleExceptionResponse(e, res);
  }
}

async function updateGradSchool(req, res) {
  try {
    req.body.createDate = null;
    req.body.updateDate = null;
    const url = `${config.get('server:gradSchool:rootURL')}/${req.body.gradSchoolID}`;
    const data = await putData(url, req.body, utils.getUser(req).idir_username);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'updateGradSchool', 'Error occurred while attempting to update grad school.');
    return handleExceptionResponse(e, res);
  }
}

function getGradSchools(req, res) {
  try {
    let schools = cacheService.getGradSchoolsList();
    return res.status(200).json(schools);
  } catch (e) {
    logApiError(e, 'getGradSchools', 'Error occurred while attempting to GET grad school.');
    return handleExceptionResponse(e, res);
  }
}

async function getGradSchoolHistoryPaginated(req, res) {
  try {
    let parsedParams = '';
    if (req.query.searchParams) {
      parsedParams = req.query.searchParams;
    }

    const historySearchCriteria = [{
      condition: null,
      searchCriteriaList: createGradSchoolSearchCriteria(parsedParams),
    }];

    const schoolHistorySearchParam = {
      params: {
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        sort: JSON.stringify(req.query.sort),
        searchCriteriaList: JSON.stringify(historySearchCriteria)
      }
    };
    Promise.all([
      getData(config.get('server:edx:edxUsersURL')),
      getData(config.get('server:gradSchool:rootURL') + '/history/paginated', schoolHistorySearchParam)
    ])
      .then(async ([edxUserResponse, schoolHistoryResponse]) => {
        if (edxUserResponse && schoolHistoryResponse) {
          schoolHistoryResponse.content.forEach((element) => {
            if(element.updateUser?.length > 10){
              let val = edxUserResponse.find(user => user.edxUserID === element.updateUser.replace('EDX/', ''));
              if(val){
                element.updateUser = (val.firstName + ' ' + val.lastName).trim();
              }
            }
          });

          return res.status(200).json(schoolHistoryResponse);
        }
      }).catch(async e => {
        await logApiError(e, 'getGradSchoolsPaginated', 'Error occurred while attempting to GET grad schools history paginated.');
        return handleExceptionResponse(res);
      });
  } catch (e) {
    logApiError(e, 'getGradSchoolsPaginated', 'Error occurred while attempting to GET grad schools history paginated.');
    return handleExceptionResponse(res);
  }
}

function createGradSchoolSearchCriteria(searchParams){
  let searchCriteriaList = [];

  Object.keys(searchParams).forEach(function(key){
    let pValue = searchParams[key];
    if(key === 'schoolID'){
      searchCriteriaList.push({key: 'schoolID', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND});
    }
    if(key === 'issueTranscripts'){
      searchCriteriaList.push({key: 'canIssueTranscripts', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.BOOLEAN, condition: CONDITION.AND});
    }
    if(key === 'issueCertificates'){
      searchCriteriaList.push({key: 'canIssueCertificates', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.BOOLEAN, condition: CONDITION.AND});
    }
  });

  return searchCriteriaList;
}

module.exports = {
  getGradSchool,
  updateGradSchool,
  getGradSchools,
  getGradSchoolHistoryPaginated
};
