'use strict';
const { handleExceptionResponse, getData, putData, postData, logApiError, errorResponse} = require('./utils');
const HttpStatus = require('http-status-codes');
const log = require('./logger');
const config = require('../config');
const utils = require('./utils');
const {Year} = require("@js-joda/core");
let reportTypes = ['DISTRICT_FUNDING_REPORT', 'INDEPENDENT_SCHOOL_FUNDING_REPORT'];

async function getActiveChallengeReportsPeriod(req, res) {
  try {
    const url = `${config.get('server:challengeReports:rootURL')}/activeSession`;
    const data = await getData(url);

    const response = {
      challengeReportsSessionID: data.challengeReportsSessionID,
      fundingRate: data.fundingRate,
      schoolYear: data.schoolYear,
      challengeReportsSessionStatus: data.challengeReportsStatusCode,
      finalDateForChanges: data.finalDateForChanges ? formatCompletionDate(data.finalDateForChanges) : null,
      preliminaryCompletionDate: data.preliminaryCompletionDate ? formatCompletionDate(data.preliminaryCompletionDate) : null,
      finalCompletionDate: data.finalStageCompletionDate ? formatCompletionDate(data.finalStageCompletionDate) : null
    };

    return res.status(HttpStatus.OK).json(response);
  } catch (e) {
    log.error(e, 'getActiveChallengeReportPeriod', 'Error occurred while attempting to GET active Challenge Reports Period.');
    return handleExceptionResponse(e, res);
  }
}

async function updateActiveChallengeReportsSession(req, res) {
  try {
    const url = `${config.get('server:challengeReports:rootURL')}/activeSession`;
    const data = await getData(url);

    const urlPut = `${config.get('server:challengeReports:rootURL')}` + '/' + data.challengeReportsSessionID;
    data.updateDate = null;
    data.createDate = null;
    data.fundingRate = req.body.fundingRate;
    data.finalDateForChanges = req.body.finalDateForChanges;
    const dataPut = await putData(urlPut, data, utils.getUser(req).idir_username);

    const response = {
      challengeReportsSessionID: dataPut.challengeReportsSessionID,
      fundingRate: dataPut.fundingRate,
      schoolYear: dataPut.schoolYear,
      challengeReportsSessionStatus: dataPut.challengeReportsStatusCode,
      finalDateForChanges: data.finalDateForChanges ? formatCompletionDate(data.finalDateForChanges) : null,
      preliminaryCompletionDate: data.preliminaryCompletionDate ? formatCompletionDate(data.preliminaryCompletionDate) : null,
      finalCompletionDate: data.finalStageCompletionDate ? formatCompletionDate(data.finalStageCompletionDate) : null
    };

    return res.status(HttpStatus.OK).json(response);
  } catch (e) {
    log.error(e, 'getActiveChallengeReportPeriod', 'Error occurred while attempting to GET active Challenge Reports Period.');
    return handleExceptionResponse(e, res);
  }
}

async function startChallengeReportPhase(req, res) {
  try {
    const url = `${config.get('server:challengeReports:rootURL')}/activeSession`;
    const data = await getData(url);

    let urlPost = `${config.get('server:challengeReports:rootURL')}` + '/preliminaryStage/' + utils.getUser(req).idir_username;
    if(data.challengeReportsStatusCode === 'PRELIM'){
      urlPost = `${config.get('server:challengeReports:rootURL')}` + '/finalStage/' + utils.getUser(req).idir_username;
    }

    await postData(urlPost);

    return res.status(HttpStatus.OK).json('');
  } catch (e) {
    log.error(e, 'getActiveChallengeReportPeriod', 'Error occurred while attempting to GET active Challenge Reports Period.');
    return handleExceptionResponse(e, res);
  }
}

async function downloadMinistryChallengeReport(req, res) {
  try {
    if(!reportTypes.includes(req.params.reportType)){
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Invalid report type provided.'
      });
    }
    const url = `${config.get('server:challengeReports:rootURL')}/report/${req.params.reportType}/download`;
    const data = await getData(url);

    const urlSession = `${config.get('server:challengeReports:rootURL')}/activeSession`;
    const dataSession = await getData(urlSession);

    let yearString = dataSession.schoolYear;
    if(dataSession.schoolYear){
      const lastYear = Year.of(dataSession.schoolYear).minusYears(1).toString();
      yearString = lastYear + '/' + dataSession.schoolYear;
    }

    const fileDetails = getFileDetails(req.params.reportType, yearString);
    setResponseHeaders(res, fileDetails);
    const buffer = Buffer.from(data.documentData, 'base64');
    return res.status(200).send(buffer);
  } catch (e) {
    await logApiError(e, 'downloadMinistryChallengeReport', 'Error occurred while attempting to download ministry challenge report.');
    return errorResponse(res);
  }
}

function getFileDetails(reportType, schoolYear) {
  const mappings = {
    'DISTRICT_FUNDING_REPORT': { filename: 'District Funding Report for Course Challenges - ' + schoolYear + '.csv', contentType: 'text/csv' },
    'INDEPENDENT_SCHOOL_FUNDING_REPORT': { filename: 'Independent School Funding Report for Course Challenges - ' + schoolYear + '.csv', contentType: 'text/csv' },
    'DEFAULT': { filename: 'download.csv', contentType: 'text/csv' }
  };
  return mappings[reportType] || mappings['DEFAULT'];
}

function setResponseHeaders(res, { filename, contentType }) {
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.setHeader('Content-Type', contentType);
}

function formatCompletionDate(rawDate) {
  const date = new Date(rawDate);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}/${month}/${day}`;
}

module.exports = {
  getActiveChallengeReportsPeriod,
  updateActiveChallengeReportsSession,
  startChallengeReportPhase,
  downloadMinistryChallengeReport
};
