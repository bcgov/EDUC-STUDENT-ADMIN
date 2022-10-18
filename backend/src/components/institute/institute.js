'use strict';
const { logApiError, getData, errorResponse, getBackendToken, validateAccessToken} = require('../utils');
const HttpStatus = require('http-status-codes');
const cacheService = require('../cache-service');
const {FILTER_OPERATION, VALUE_TYPE, CONDITION} = require('../../util/constants');
const config = require('../../config');
const {LocalDateTime} = require('@js-joda/core');
const utils = require('../utils');

async function getCachedDistricts(req, res) {
  try {
    if (req.query.refreshCache === 'true') {
      await cacheService.loadAllDistrictsToMap();
    }
    const districts = req.query.active === 'true' ? cacheService.getAllActiveDistrictsJSON() : cacheService.getAllDistrictsJSON();
    return res.status(HttpStatus.OK).json(districts);
  } catch (e) {
    logApiError(e, 'getDistricts', 'Error occurred while attempting to GET district entity.');
    return errorResponse(res);
  }
}

async function getDistricts(req, res) {
  const token = getBackendToken(req);
  try {
    const url = `${config.get('server:institute:instituteDistrictURL')}`;
    const data = await getData(token, url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getDistricts', 'Error occurred while attempting to GET all districts.');
    return errorResponse(res);
  }
}

async function getCachedDistrictByDistrictId(req, res) {
  try {
    const districtId = req.params.districtId;
    return res.status(HttpStatus.OK).json(cacheService.getDistrictJSONByDistrictId(districtId));
  } catch (e) {
    logApiError(e, 'getCachedDistrictByDistrictId', 'Error occurred while attempting to GET District entity.');
    return errorResponse(res);
  }
}

async function getDistrictByDistrictID(req, res) {
  const token = getBackendToken(req);
  try {
    const url = `${config.get('server:institute:rootURL')}/district/${req.params.districtId}`;
    const data = await getData(token, url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getDistrictByID', 'Error occurred while attempting to GET district entity.');
    return errorResponse(res);
  }
}

async function getSchools(req, res) {
  const token = getBackendToken(req);
  try {
    const url = `${config.get('server:institute:instituteSchoolURL')}`;
    const data = await getData(token, url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getSchools', 'Error occurred while attempting to GET all schools.');
    return errorResponse(res);
  }
}

async function getCachedSchools(req, res) {
  if (req.query.refreshCache === 'true') {
    await cacheService.loadAllSchoolsToMap();
  }
  try {
    let schools = req.query.active === 'true' ? cacheService.getAllActiveSchoolsJSON() : cacheService.getAllSchoolsJSON();
    return res.status(HttpStatus.OK).json(schools);
  } catch (e) {
    logApiError(e, 'getSchools', 'Error occurred while attempting to GET school entity.');
    return errorResponse(res);
  }
}

async function getCachedSchoolBySchoolID(req, res) {
  try {
    const schoolID = req.params.schoolID;
    return res.status(HttpStatus.OK).json(cacheService.getSchoolBySchoolID(schoolID));
  } catch (e) {
    logApiError(e, 'getCachedSchoolBySchoolID', 'Error occurred while attempting to GET School entity.');
    return errorResponse(res);
  }
}

async function addNewSchoolNote(req, res) {
  try {
    const token = getBackendToken(req);

    let school = cacheService.getSchoolBySchoolID(req.body.schoolID);
    if(!school || !hasSchoolAdminRole(req, school)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }

    const params = {
      content: req.body.noteContent,
      schoolId: req.body.schoolID
    };
    const result = await utils.postData(token, config.get('server:institute:instituteSchoolURL') + '/' + req.body.schoolID + '/note', params, null, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'addNewSchoolNote', 'Error occurred while attempting to add a new school note.');
    return errorResponse(res);
  }
}

async function editSchoolContact(req, res) {
  try {
    const token = getBackendToken(req);

    let school = cacheService.getSchoolBySchoolID(req.body.schoolId);
    if(!school || !hasSchoolAdminRole(req, school)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }

    const params = req.body;
    const result = await utils.putData(token, config.get('server:institute:instituteSchoolURL') + '/' + req.body.schoolId + '/contact/'+ req.body.schoolContactId , params, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'editSchoolContact', 'Error occurred while attempting to edit a school contact.');
    return errorResponse(res);
  }
}

function hasSchoolAdminRole(req, school){
  if(school.schoolCategoryCode === 'OFFSHORE' || school.schoolCategoryCode === 'INDEPEND'){
    return req.session.roles.includes('SCHOOL_ADMIN') || req.session.roles.includes('SCHOOL_INDEPENDENT_OFFSHORE_ADMIN');
  }
  return req.session.roles.includes('SCHOOL_ADMIN');
}

async function getSchoolByID(req, res) {
  const token = getBackendToken(req);
  try {
    const url = `${config.get('server:institute:rootURL')}/school/${req.params.id}`;
    const data = await getData(token, url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getSchoolByID', 'Error occurred while attempting to GET school entity.');
    return errorResponse(res);
  }
}

async function getSchoolsPaginated(req, res){
  try {
    const accessToken = getBackendToken(req);
    validateAccessToken(accessToken, res);

    let parsedParams = '';
    if (req.query.searchParams) {
      parsedParams = JSON.parse(req.query.searchParams);
    }

    const schoolSearchCriteria = [{
      condition: null,
      searchCriteriaList: createSchoolSearchCriteria(parsedParams),
    }];

    const schoolSearchParam = {
      params: {
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        sort: req.query.sort,
        searchCriteriaList: JSON.stringify(schoolSearchCriteria)
      }
    };
    let response = await getData(accessToken, config.get('server:institute:rootURL') + '/school/paginated', schoolSearchParam);
    return res.status(HttpStatus.OK).json(response);
  } catch (e) {
    logApiError(e, 'getSchoolsPaginated', 'Error occurred while attempting to GET schools paginated.');
    return errorResponse(res);
  }
}

function createSchoolSearchCriteria(searchParams){

  let searchCriteriaList = [];

  Object.keys(searchParams).forEach(function(key){
    let pValue = searchParams[key];
    if(key === 'status'){
      let currentDate = LocalDateTime.now();

      if(pValue === 'Open'){
        searchCriteriaList.push({key: 'openedDate', operation: FILTER_OPERATION.LESS_THAN_OR_EQUAL_TO, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.AND});
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.EQUAL, value: null, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
      } else if (pValue === 'Opening'){
        searchCriteriaList.push({key: 'openedDate', operation: FILTER_OPERATION.GREATER_THAN, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.AND});
      } else if (pValue === 'Closing'){
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.GREATER_THAN, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.AND});
      } else if (pValue === 'Closed'){
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.LESS_THAN_OR_EQUAL_TO, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.AND});
      } else if (pValue === 'NeverOpened'){
        searchCriteriaList.push({key: 'openedDate', operation: FILTER_OPERATION.EQUAL, value: null, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.EQUAL, value: null, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
      } else if (pValue === 'NotClosed'){
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.GREATER_THAN, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.OR});
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.EQUAL, value: null, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR});
      }
    }
    if(key === 'pubEarlyLearning'){
      searchCriteriaList.push({key: 'schoolCategoryCode', operation: FILTER_OPERATION.IN, value: 'EAR_LEARN,PUBLIC', valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
    }
    if(key === 'schoolID'){
      searchCriteriaList.push({key: 'schoolId', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND});
    }
    if(key === 'districtID'){
      searchCriteriaList.push({key: 'districtID', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND});
    }
    if(key === 'authorityID'){
      searchCriteriaList.push({key: 'independentAuthorityId', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND});
    }
    if(key === 'type'){
      searchCriteriaList.push({key: 'facilityTypeCode', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
    }
    if(key === 'category'){
      searchCriteriaList.push({key: 'schoolCategoryCode', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
    }
  });

  return searchCriteriaList;
}

async function getAuthorities(req, res) {
  const token = getBackendToken(req);
  try {
    const url = `${config.get('server:institute:instituteAuthorityURL')}`;
    const data = await getData(token, url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getAuthorities', 'Error occurred while attempting to GET all authorities.');
    return errorResponse(res);
  }
}

async function getCachedAuthorities(req, res) {
  try {
    if (req.query.refreshCache === 'true') {
      await cacheService.loadAllAuthoritiesToMap();
    }
    const authorities = req.query.active === 'true' ? cacheService.getAllActiveAuthoritiesJSON() : cacheService.getAllAuthoritiesJSON();
    return res.status(HttpStatus.OK).json(authorities);
  } catch (e) {
    logApiError(e, 'getCachedAuthorities', 'Error occurred while attempting to GET all authorities cached.');
    return errorResponse(res);
  }
}

async function getAuthorityByID(req, res) {
  const token = getBackendToken(req);
  try {
    const url = `${config.get('server:institute:rootURL')}/authority/${req.params.id}`;
    const data = await getData(token, url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getAuthorityByID', 'Error occurred while attempting to GET authority entity.');
    return errorResponse(res);
  }
}

async function getCachedAuthorityByAuthorityID(req, res) {
  try {
    const authorityID = req.params.authorityID;
    return res.status(HttpStatus.OK).json(cacheService.getAuthorityJSONByAuthorityId(authorityID));
  } catch (e) {
    logApiError(e, 'getCachedAuthorityByAuthorityID', 'Error occurred while attempting to GET Authority entity.');
    return errorResponse(res);
  }
}

async function getAuthoritiesPaginated(req, res){
  const accessToken = getBackendToken(req);
  validateAccessToken(accessToken, res);

  let parsedParams = '';
  if (req.query.searchParams) {
    parsedParams = JSON.parse(req.query.searchParams);
  }

  const authoritySearchCriteria = [{
    condition: null,
    searchCriteriaList: createAuthoritySearchCriteria(parsedParams),
  }];

  const authoritySearchParam = {
    params: {
      pageNumber: req.query.pageNumber,
      pageSize: req.query.pageSize,
      sort: req.query.sort,
      searchCriteriaList: JSON.stringify(authoritySearchCriteria)
    }
  };
  let response = await getData(accessToken, config.get('server:institute:rootURL') + '/authority/paginated', authoritySearchParam);
  return res.status(HttpStatus.OK).json(response);
}

function createAuthoritySearchCriteria(searchParams){
  let searchCriteriaList = [];

  Object.keys(searchParams).forEach(function(key){
    let pValue = searchParams[key];
    if(key === 'status'){
      let currentDate = LocalDateTime.now();

      if(pValue === 'Open'){
        searchCriteriaList.push({key: 'openedDate', operation: FILTER_OPERATION.LESS_THAN_OR_EQUAL_TO, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.AND});
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.EQUAL, value: null, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
      } else if (pValue === 'Closing'){
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.GREATER_THAN, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.AND});
      } else if (pValue === 'Closed'){
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.LESS_THAN_OR_EQUAL_TO, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.AND});
      }
    }
    if(key === 'authorityID'){
      searchCriteriaList.push({key: 'independentAuthorityId', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND});
    }
    if(key === 'type'){
      searchCriteriaList.push({key: 'authorityTypeCode', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
    }
  });

  return searchCriteriaList;
}

module.exports = {
  getCachedDistricts,
  getCachedDistrictByDistrictId,
  getDistrictByDistrictID,
  getSchools,
  getDistricts,
  getSchoolsPaginated,
  getAuthorities,
  getAuthoritiesPaginated,
  getAuthorityByID,
  getSchoolByID,
  getCachedSchools,
  getCachedSchoolBySchoolID,
  getCachedAuthorityByAuthorityID,
  getCachedAuthorities,
  addNewSchoolNote,
  editSchoolContact
};