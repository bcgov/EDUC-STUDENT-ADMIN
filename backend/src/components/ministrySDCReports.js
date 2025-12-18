'use strict';
const { logApiError, errorResponse, getData } = require('./utils');
const config = require('../config/index');
const HttpStatus = require('http-status-codes');
let reportTypes = ['indy-inclusive-ed-enrollment-headcounts', 'school-enrollment-headcounts', 'indy-school-enrollment-headcounts', 'school-address-report', 'fsa-registration-report',
  'offshore-enrollment-headcounts', 'offshore-languages-headcounts', 'indy-inclusive-ed-funding-headcounts', 'indy-funding-report-all', 'isfs-prelim-report', 'inclusive-education-variances-all', 'indy-funding-report-funded', 'online-indy-funding-report', 'non-graduated-adult-indy-funding-report',
  'inclusive-education-variance-headcounts','enrolled-fte-headcounts', 'refugee-enrolment-fte-headcounts','posted-duplicates', 'indy-school-grade-funding-group-enrolled-programs-headcounts', 'ell-students-fall-csv'];

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

    const collection = await getData(`${config.get('sdc:collectionURL')}/${req.params.collectionID}`);

    const fileDetails = getFileDetails(req.params.reportType, collection);
    setResponseHeaders(res, fileDetails);
    const buffer = Buffer.from(data.documentData, 'base64');
    return res.status(200).send(buffer);
  } catch (e) {
    await logApiError(e, 'downloadMinistrySDCReport', 'Error occurred while attempting to download ministry SDC report.');
    return errorResponse(res);
  }
}

function getFileDetails(reportType, collection) {
  const mappings = {
    'school-enrollment-headcounts': { filename: 'AllSchoolsHeadcounts.csv', contentType: 'text/csv' },
    'indy-school-enrollment-headcounts': { filename: 'IndependentSchoolsHeadcounts.csv', contentType: 'text/csv' },
    'indy-inclusive-ed-enrollment-headcounts': { filename: 'IndependentSchoolsInclusiveEdHeadcounts.csv', contentType: 'text/csv' },
    'school-address-report': { filename: 'SchoolPhysicalAddressReport.csv', contentType: 'text/csv' },
    'fsa-registration-report': { filename: 'FsaRegistrationReport.csv', contentType: 'text/csv' },
    'offshore-enrollment-headcounts': { filename: 'OffshoreSchoolsHeadcounts.csv', contentType: 'text/csv' },
    'offshore-languages-headcounts': { filename: 'OffshoreSpokenLanguageHeadcounts.csv', contentType: 'text/csv' },
    'indy-inclusive-ed-funding-headcounts': { filename: 'IndependentSchoolsInclusiveEdFundingHeadcounts.csv', contentType: 'text/csv' },
    'indy-funding-report-all': { filename: 'IndependentSchoolsFundingReportStandardStudentAll.csv', contentType: 'text/csv' },
    'isfs-prelim-report': { filename: 'IndependentSchoolsFundingSystemReport_' + collection.snapshotDate + '.csv', contentType: 'text/csv' },
    'inclusive-education-variances-all': { filename: 'InclusiveEducationVariancesAllDistricts.csv', contentType: 'text/csv' },
    'indy-funding-report-funded': { filename: 'IndependentSchoolsFundingReportStandardStudentFunded.csv', contentType: 'text/csv' },
    'online-indy-funding-report': { filename: 'IndependentSchoolsFundingReportOnlineLearning.csv', contentType: 'text/csv' },
    'non-graduated-adult-indy-funding-report': { filename: 'IndependentSchoolsFundingReportNonGraduatedAdult.csv', contentType: 'text/csv' },
    'enrolled-fte-headcounts': { filename: 'EnroledHeadcountsAndFteReport.csv', contentType: 'text/csv' },
    'refugee-enrolment-fte-headcounts': { filename: 'RefugeeEnroledHeadcountsAndFteReport.csv', contentType: 'text/csv' },
    'posted-duplicates': { filename: 'PostedDuplicatesReport.csv', contentType: 'text/csv' },
    'indy-school-grade-funding-group-enrolled-programs-headcounts': { filename: 'IndependentSchoolsGradeFundingGroupEnrolmentHeadcounts.csv', contentType: 'text/csv' },
    'ell-students-fall-csv': { filename: 'ELLStudentsFallReport.csv', contentType: 'text/csv' },
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
