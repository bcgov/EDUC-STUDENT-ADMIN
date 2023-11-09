'use strict';
const { LocalDateTime } = require('@js-joda/core');
const log = require('./logger');
const SAGAS = require('./saga');
const config = require('../config/index');
const utils = require('./utils');
const redisUtil = require('../util/redis/redis-utils');
const HttpStatus = require('http-status-codes');
const commonRequest = require('./requests');



function createStudentRequestApiServiceReq(studentRequest, req) {
  studentRequest.studentRequestStatusCode = req.body.studentRequestStatusCode;
  commonRequest.setDefaultsForCreateApiReq(studentRequest, req);
  return studentRequest;
}

async function getUMPRequestStats(req, res) {
  let initRevSearchCriteriaList = [{
    key: 'studentRequestStatusCode',
    operation: 'like',
    value: 'INITREV',
    valueType: 'STRING'
  }];
  let subsRevSearchCriteriaList = [{
    key: 'studentRequestStatusCode',
    operation: 'like',
    value: 'SUBSREV',
    valueType: 'STRING'
  }];
  return Promise.all([
    utils.getData(config.get('server:studentRequest:paginated'), {params: { pageSize: 1, searchCriteriaList: JSON.stringify(initRevSearchCriteriaList) }}),
    utils.getData(config.get('server:studentRequest:paginated'), {params: { pageSize: 1, searchCriteriaList: JSON.stringify(subsRevSearchCriteriaList) }}),
  ]).then(([initRevResponse, subsRevResponse]) => {
    return res.status(200).json({ numInitRev: initRevResponse.totalElements, numSubsRev: subsRevResponse.totalElements });
  }).catch(e => {
    utils.logApiError(e, 'getStudentRequestStats', 'Error occurred while attempting to GET number of student profile requests.');
    return utils.errorResponse(res);
  });
}

function updateForRejectAndReturn(studentRequest, userToken, req) {
  studentRequest.studentProfileRequestID = req.params.id || req.body.studentRequestID;
  commonRequest.setDefaultsInRequestForRejectAndReturn(studentRequest, req, userToken);
}

async function rejectProfileRequest(req, res) {
  const profileRequest = {};
  const userToken = utils.getUser(req);
  profileRequest.rejectionReason = req.body.failureReason;
  updateForRejectAndReturn(profileRequest, userToken, req);
  const url = `${config.get('server:profileSagaAPIURL')}/student-profile-reject-saga`;
  return await executeProfReqSaga(url, profileRequest, res, 'reject', userToken['idir_username']);
}

async function executeProfReqSaga(url, profileRequest, res, sagaType, user) {
  try {
    const sagaId = await utils.postData(url, profileRequest, null, user);
    const event = {
      sagaId: sagaId,
      studentRequestID: profileRequest.studentProfileRequestID, //DONT change the key it will break the check during getAllRequests or getRequestById in requests.js
      sagaStatus: 'INITIATED'
    };
    log.info(`going to store event object in redis for ${sagaType} profile request :: `, event);
    await redisUtil.createSagaRecord(event, SAGAS.GMP_UMP.sagaEventRedisKey);
    return res.status(200).json();
  } catch (e) {
    utils.logApiError(e, `${sagaType}ProfileRequest`, `Error occurred while attempting to ${sagaType} a profile request.`);
    if (e.status === HttpStatus.CONFLICT) {
      return utils.errorResponse(res, 'Another saga in progress', HttpStatus.CONFLICT);
    }
    return utils.errorResponse(res);
  }
}

async function returnProfileRequest(req, res) {
  const userToken = utils.getUser(req);
  const profileRequest = {};
  profileRequest.commentContent = req.body.content;
  profileRequest.commentTimestamp = LocalDateTime.now().toString().substr(0, 19);
  updateForRejectAndReturn(profileRequest, userToken, req);
  const url = `${config.get('server:profileSagaAPIURL')}/student-profile-return-saga`;
  return await executeProfReqSaga(url, profileRequest, res, 'return', userToken['idir_username']);
}



async function completeProfileRequest(req, res) {
  let thisSession = req['session'];
  if (!thisSession.studentDemographics || !thisSession.studentDemographics['studSurname']) {
    log.error('Error attempting to complete profile request.  There are no student demographics in session.');
    return utils.errorResponse(res);
  }

  const profileRequest = {};
  profileRequest.studentProfileRequestID = req.body.studentRequestID;
  profileRequest.pen = thisSession.studentDemographics.pen;
  commonRequest.setDefaultsInRequestForComplete(profileRequest, thisSession, req);
  const url = `${config.get('server:profileSagaAPIURL')}/student-profile-complete-saga`;
  return await executeProfReqSaga(url, profileRequest, res, 'complete', req.body.reviewer);
}
module.exports = {
  createStudentRequestApiServiceReq,
  getUMPRequestStats,
  rejectProfileRequest,
  returnProfileRequest,
  completeProfileRequest
};
