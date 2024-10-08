'use strict';
const { logApiError, getData, errorResponse } = require('../utils');
const HttpStatus = require('http-status-codes');
const utils = require('../utils');

const config = require('../../config');

async function getAssessmentSessions(req, res) {
  try {
    const url = `${config.get('server:eas:assessmentSessionsURL')}`;
    const data = await getData(url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getAssessmentSessions', 'Error occurred while attempting to GET assessment sessions.');
    return errorResponse(res);
  }
}

async function updateAssessmentSession(req, res) {
  if (req.params.assessmentSessionID !== req.body.assessmentSessionID) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'The assessmentSessionID in the URL didn\'t match the assessmentSessionID in the request body.'
    });
  }
  try {
    const userInfo = utils.getUser(req);
    const payload = {
      assessmentSessionID: req.body.assessmentSessionID,
      activeFromDate: req.body.activeFromDate,
      activeUntilDate: req.body.activeUntilDate,
      updateUser: userInfo.idir_username
    };
    const result = await utils.putData(`${config.get('server:eas:assessmentSessionsURL')}/${req.body.assessmentSessionID}`, payload, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'updateAssessmentSession', 'Error occurred while attempting to save the changes to the assessment session.');
    return errorResponse(res);
  }
}
module.exports = {
  getAssessmentSessions,
  updateAssessmentSession
};
