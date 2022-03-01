'use strict';
const { logApiError, errorResponse, getBackendToken, getData, putData} = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const utils = require('./utils');
const retry = require('async-retry');

async function getDigitalIdentityByStudentID(req, res) {
  const token = getBackendToken(req);
  const studentID = req.query.studentID;
  const digitalIDPaths =  ['list'];
  return Promise.all(digitalIDPaths.map(path =>
    getData(token, `${config.get('server:digitalIdURL')}/${path}`, {params: {studentID: studentID}}))
  ).then(([digitalIDResult]) => {
    return res.status(200).json({digitalIDResult});
  }).catch(e => {
    logApiError(e, 'getTraxDataByPen', 'Error occurred while attempting to get a digital identity.');
    return errorResponse(res);
  });
}

async function unlinkDigitalIdentity(req, res) {
  try {
    const token = utils.getBackendToken(req);
    if (!req.params.digitalID) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'No digital ID for PUT operation.'
      });
    }
    const currentDigitalID = await getData(token, `${config.get('server:digitalIdURL')}/${req.params.digitalID}`);
    currentDigitalID.studentID = null;
    currentDigitalID.createDate = null;
    currentDigitalID.updateDate = null;

    await retry(async () => {
      const result = await putData(token, `${config.get('server:digitalIdURL')}/${req.params.digitalID}`, currentDigitalID, utils.getUser(req).idir_username);
      return res.status(HttpStatus.OK).json(result);
    },
    {
      retries: 3
    });
  } catch (e) {
    logApiError(e, 'unlinkDigitalIdentity', 'Error occurred while attempting to update a digital identity.');
    return errorResponse(res);
  }

}

module.exports = {
  getDigitalIdentityByStudentID,
  unlinkDigitalIdentity
};
