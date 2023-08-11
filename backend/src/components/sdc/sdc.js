'use strict';
const { logApiError, getData, deleteData, errorResponse, getBackendToken, validateAccessToken, putData} = require('../utils');
const HttpStatus = require('http-status-codes');
const config = require('../../config');
const cacheService = require('../cache-service');
const utils = require('../utils');

async function getFundingGroupDataForSchool(req, res) {
  try {
    const accessToken = getBackendToken(req);
    validateAccessToken(accessToken, res);
    
    let school = cacheService.getSchoolBySchoolID(req.params.schoolID);
   
    if(!hasSchoolAdminRole(req, school)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }
    
    const data = await getData(accessToken, `${config.get('sdc:fundingGroupDataURL')}/search/${req.params.schoolID}`);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    logApiError(e, 'getFundingGroupDataForSchool', 'Error getting funding data for this school');
    return errorResponse(res);
  }
}

async function getSnapshotFundingDataForSchool(req, res) {
  try {
    const accessToken = getBackendToken(req);
    validateAccessToken(accessToken, res);
    
    let school = cacheService.getSchoolBySchoolID(req.params.schoolID);
   
    if(!hasSchoolAdminRole(req, school)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }
    
    const data = await getData(accessToken, `${config.get('sdc:fundingGroupDataURL')}/snapshot/${req.params.schoolID}/${req.params.collectionID}`);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    logApiError(e, 'getSnapshotFundingDataForSchool', 'Error getting funding snapshot data for this school');
    return errorResponse(res);
  }
}

async function getFundingGroupsForSchool(req, res) {
  try {
    const accessToken = getBackendToken(req);   
    validateAccessToken(accessToken, res);

    const data = await getData(accessToken, `${config.get('sdc:fundingGroupsURL')}`);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    logApiError(e, 'getFundingGroupsForSchool', 'Error getting funding groups');
    return errorResponse(res);
  }
}

async function deleteFundingDataForSchool(req, res) {
  try {
    const accessToken = getBackendToken(req);
    validateAccessToken(accessToken, res);

    let school = cacheService.getSchoolBySchoolID(req.params.schoolID);
   
    if(!hasSchoolAdminRole(req, school)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }

    const data = await deleteData(accessToken, `${config.get('sdc:fundingGroupDataURL')}/${req.params.schoolFundingGroupID}`);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    logApiError(e, 'deleteFundingDataForSchool', 'Error removing funding data for this school');
    return errorResponse(res);
  }
}

async function updateFundingDataForSchool(req, res) {
  try {
    const accessToken = getBackendToken(req);
    validateAccessToken(accessToken, res);

    let school = cacheService.getSchoolBySchoolID(req.params.schoolID);
   
    if(!hasSchoolAdminRole(req, school)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }

    const payload = req.body;
    payload.updateDate = null;
    payload.createDate = null;
    payload.updateUser = utils.getUser(req).idir_username;

    const data = await putData(accessToken, `${config.get('sdc:fundingGroupDataURL')}/${req.params.schoolFundingGroupID}`, payload);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    logApiError(e, 'updateFundingDataForSchool', 'Error updating funding data for this school');
    return errorResponse(res);
  }
}

async function addNewFundingForSchool(req, res) {
  try {
    const accessToken = getBackendToken(req);
    validateAccessToken(accessToken, res);

    let school = cacheService.getSchoolBySchoolID(req.params.schoolID);
   
    if(!hasSchoolAdminRole(req, school)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }

    const payload = req.body;
    payload.createUser = utils.getUser(req).idir_username;
    payload.schoolID = req.params.schoolID;

    const data = await utils.postData(accessToken, `${config.get('sdc:fundingGroupDataURL')}`, payload);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    logApiError(e, 'addNewFundingForSchool', 'Error adding funding data for this school');
    return errorResponse(res);
  }
}

async function getAllCollectionsForSchool(req, res) {
  try {
    const accessToken = getBackendToken(req);
    validateAccessToken(accessToken, res);

    let school = cacheService.getSchoolBySchoolID(req.params.schoolID);
   
    if(!hasSchoolAdminRole(req, school)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }
        
    const data = await getData(accessToken, `${config.get('sdc:schoolCollectionURL')}/searchAll/${req.params.schoolID}`);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    logApiError(e, 'getFundingGroupDataForSchool', 'Error getting funding data for this school');
    return errorResponse(res);
  }
}

function hasSchoolAdminRole(req, school){
  if(school.schoolCategoryCode === 'INDEPEND' || school.schoolCategoryCode === 'INDP_FNS'){
    return req.session.roles.includes('SCHOOL_ADMIN') || req.session.roles.includes('SCHOOL_INDEPENDENT_ADMIN');
  }

  return req.session.roles.includes('SCHOOL_ADMIN');
}


module.exports = {
  getFundingGroupsForSchool,
  getFundingGroupDataForSchool,
  deleteFundingDataForSchool,
  updateFundingDataForSchool,
  getSnapshotFundingDataForSchool,
  addNewFundingForSchool,
  getAllCollectionsForSchool
};
