'use strict';
const { logApiError, getData, handleExceptionResponse } = require('../utils');
const config = require('../../config');

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

async function getReportingSummary(req, res) {
  try {
    const params = {
      params: {
        type: req.query.type
      }
    };
    const url = `${config.get('server:gdc:rootURL')}/reporting-period/${req.params.reportingPeriodID}/summary`;
    const data = await getData(url, params);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getReportingSummary', 'Error occurred while attempting to GET GDC Reporting summary.');
    return handleExceptionResponse(e, res);
  }
}

module.exports = {
  getActiveReportingPeriod,
  getReportingSummary
};
