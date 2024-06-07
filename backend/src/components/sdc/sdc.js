'use strict';
const { logApiError, getData, errorResponse, postData} = require('../utils');
const HttpStatus = require('http-status-codes');
const config = require('../../config');
const utils = require('../utils');

async function getSnapshotFundingDataForSchool(req, res) {
  try {
    const data = await getData(`${config.get('sdc:schoolFundingCodesSnapshotURL')}/${req.params.schoolID}/${req.params.collectionID}`);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    await logApiError(e, 'getSnapshotFundingDataForSchool', 'Error getting funding snapshot data for this school');
    return errorResponse(res);
  }
}

async function getAllCollectionsForSchool(req, res) {
  try {
    const data = await getData(`${config.get('sdc:schoolCollectionURL')}/searchAll?schoolID=${req.params.schoolID}`);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    await logApiError(e, 'getAllCollectionsForSchool', 'Error getting collections for this school');
    return errorResponse(res);
  }
}

async function getActiveCollection(req, res) {
  try {
    const data = await getData(`${config.get('sdc:activeCollectionURL')}`);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    await logApiError(e, 'getActiveCollection', 'Error getting active collection');
    return errorResponse(res);
  }
}

async function getSdcDistrictCollectionMonitoringByCollectionId(req, res) {
  try {
    const data = await getData(`${config.get('sdc:collectionURL')}/${req.params.collectionID}/monitorSdcDistrictCollections`);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    await logApiError(e, 'Error retrieving the district collection monitoring stats');
    return errorResponse(res);
  }
}

async function getIndySdcSchoolCollectionMonitoringByCollectionId(req, res) {
  try {
    const data = await getData(`${config.get('sdc:collectionURL')}/${req.params.collectionID}/monitorIndySdcSchoolCollections`);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    await logApiError(e, 'Error retrieving the district collection monitoring stats');
    return errorResponse(res);
  }
}

async function unsubmitSdcDistrictCollection(req, res) {
  try {
    const userInfo = utils.getUser(req);
    const payload = {
      'updateUser': userInfo.idir_username,
      'districtOrSchoolCollectionID': req.params.sdcDistrictCollectionID
    };
    const data = await postData(`${config.get('sdc:districtCollectionURL')}/unsubmit`, payload);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    await logApiError(e,'Error unsubmitting the district collection record');
    return errorResponse(res);
  }
}

async function unsubmitSdcSchoolCollection(req, res) {
  try {
    const userInfo = utils.getUser(req);
    const payload = {
      'updateUser': userInfo.idir_username,
      'districtOrSchoolCollectionID': req.params.sdcSchoolCollectionID
    };
    const data = await postData(`${config.get('sdc:schoolCollectionURL')}/unsubmit`, payload);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    await logApiError(e,'Error unsubmitting the school collection record');
    return errorResponse(res);
  }
}

module.exports = {
  getSnapshotFundingDataForSchool,
  getAllCollectionsForSchool,
  getActiveCollection,
  getSdcDistrictCollectionMonitoringByCollectionId,
  getIndySdcSchoolCollectionMonitoringByCollectionId,
  unsubmitSdcDistrictCollection,
  unsubmitSdcSchoolCollection
};
