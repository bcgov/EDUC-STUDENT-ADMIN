'use strict';
const { handleExceptionResponse, getData, putData} = require('./utils');
const HttpStatus = require('http-status-codes');
const log = require('./logger');
const config = require('../config');
const utils = require('./utils');

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


function formatCompletionDate(rawDate) {
  const date = new Date(rawDate);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}/${month}/${day}`;
}

module.exports = {
  getActiveChallengeReportsPeriod,
  updateActiveChallengeReportsSession
};
