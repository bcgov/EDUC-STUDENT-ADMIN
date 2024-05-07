'use strict';
const { logApiError, getData, errorResponse} = require('../utils');
const HttpStatus = require('http-status-codes');
const config = require('../../config');

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

module.exports = {
  getSnapshotFundingDataForSchool,
  getAllCollectionsForSchool,
  getActiveCollection
};
