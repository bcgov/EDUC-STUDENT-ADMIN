'use strict';
const { logApiError, getData, putData, handleExceptionResponse } = require('../utils');
const config = require('../../config');
const utils = require('../utils');

async function getActiveReportingPeriod(req, res) {
  try {
    const url = `${config.get('server:gdc:activeReportingPeriodURL')}`;
    const data = await getData(url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getActiveReportingPeriod', 'Error occurred while attempting to GET GDC Active Reporting Period.');
    return handleExceptionResponse(e, res);
  }
}

async function updateReportingPeriod(req, res) {
  try {
    const url = `${config.get('server:gdc:reportingPeriodURL')}`;
    const params = req.body;
    params.updateDate = null;
    params.createDate = null;
    params.updateUser = utils.getUser(req).idir_username;
    const data = await putData(url, params, utils.getUser(req).idir_username);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'updateReportingPeriod', 'Error occurred while attempting to UPDATE GDC Reporting Period.');
    return handleExceptionResponse(e, res);
  }
}

module.exports = {
  getActiveReportingPeriod,
  updateReportingPeriod
};
