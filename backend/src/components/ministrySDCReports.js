'use strict';
const { logApiError, errorResponse, getData } = require('./utils');
const config = require('../config/index');
const HttpStatus = require('http-status-codes');
let reportTypes = ['school-enrollment-headcounts'];

async function getMinistrySDCReport(req, res) {
  try {
    if(!reportTypes.includes(req.params.reportType)){
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Invalid report type provided.'
      });
    }
    const url = `${config.get('sdc:ministrySDCReportsURL')}/${req.params.collectionID}/${req.params.reportType}`;
    const data = await getData(url);
    return res.status(200).json(data);
  } catch (e) {
    await logApiError(e, 'getMinistrySDCReport', 'Error occurred while attempting to GET ministry SDC report.');
    return errorResponse(res);
  }
}

module.exports = {
  getMinistrySDCReport
};
