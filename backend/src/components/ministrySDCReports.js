'use strict';
const { logApiError, errorResponse, getData } = require('./utils');
const config = require('../config/index');
const HttpStatus = require('http-status-codes');
let reportTypes = ['school-enrollment-headcounts', 'school-address-report', 'fsa-registration-report', 'offshore-enrollment-headcounts'];

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

async function downloadMinistrySDCReport(req, res) {
  try {
    if(!reportTypes.includes(req.params.reportType)){
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Invalid report type provided.'
      });
    }
    const url = `${config.get('sdc:ministrySDCReportsURL')}/${req.params.collectionID}/${req.params.reportType}/download`;
    const data = await getData(url);
    const fileDetails = getFileDetails(req.params.reportType);
    setResponseHeaders(res, fileDetails);
    const buffer = Buffer.from(data.documentData, 'base64');
    return res.status(200).send(buffer);
  } catch (e) {
    await logApiError(e, 'downloadMinistrySDCReport', 'Error occurred while attempting to download ministry SDC report.');
    return errorResponse(res);
  }
}

function getFileDetails(reportType) {
  const mappings = {
    'school-enrollment-headcounts': { filename: 'AllSchoolsHeadcounts.csv', contentType: 'text/csv' },
    'school-address-report': { filename: 'SchoolPhysicalAddressReport.csv', contentType: 'text/csv' },
    'fsa-registration-report': { filename: 'FsaRegistrationReport.csv', contentType: 'text/csv' },
    'offshore-enrollment-headcounts': { filename: 'OffshoreSchoolsHeadcounts.csv', contentType: 'text/csv' },
    'DEFAULT': { filename: 'download.pdf', contentType: 'application/pdf' }
  };
  return mappings[reportType] || mappings['DEFAULT'];
}

function setResponseHeaders(res, { filename, contentType }) {
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.setHeader('Content-Type', contentType);
}

module.exports = {
  getMinistrySDCReport,
  downloadMinistrySDCReport
};
