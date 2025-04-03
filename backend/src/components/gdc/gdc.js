'use strict';
const { logApiError, getData, handleExceptionResponse } = require('../utils');
const config = require('../../config');

async function getActiveReportingPeriod(req, res) {
  try {
    console.log('getActiveReportingPeriod');

    const url = `${config.get('server:gdc:activeReportingPeriodURL')}`;
    console.log(`getActiveReportingPeriod: ${url}`);
    const data = await getData(url);

    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getActiveReportingPeriod', 'Error occurred while attempting to GET GDC Active Reporting Period.');
    return handleExceptionResponse(e, res);
  }
}

module.exports = {
  getActiveReportingPeriod,
};
