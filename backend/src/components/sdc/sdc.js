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
    const data = await getData(accessToken, `${config.get('sdc:fundingGroupDataURL')}/snapshot/${req.params.schoolID}/${req.params.collectionID}`);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    logApiError(e, 'getSnapshotFundingDataForSchool', 'Error getting funding snapshot data for this school');
    return errorResponse(res);
  }
}

async function deleteFundingDataForSchool(req, res) {
  try {
    const accessToken = getBackendToken(req);
    validateAccessToken(accessToken, res);

    let school = cacheService.getSchoolBySchoolID(req.params.schoolID);
    if(!school){
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'School not found'
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
   
    if(school?.schoolCategoryCode !== 'INDEPEND' && school?.schoolCategoryCode !== 'INDP_FNS') {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Unable to update funding code for this school category'
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

    if(school?.schoolCategoryCode !== 'INDEPEND' && school?.schoolCategoryCode !== 'INDP_FNS') {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Unable to add funding code for this school category'
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
    const data = await getData(accessToken, `${config.get('sdc:schoolCollectionURL')}/searchAll/${req.params.schoolID}`);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    logApiError(e, 'getFundingGroupDataForSchool', 'Error getting funding data for this school');
    return errorResponse(res);
  }
}

module.exports = {
  getFundingGroupDataForSchool,
  deleteFundingDataForSchool,
  updateFundingDataForSchool,
  getSnapshotFundingDataForSchool,
  addNewFundingForSchool,
  getAllCollectionsForSchool
};
