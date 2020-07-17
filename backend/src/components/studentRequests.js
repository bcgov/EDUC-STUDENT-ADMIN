'use strict';
const { LocalDateTime } = require('@js-joda/core');
const log = require('./logger');
const config = require('../config/index');
const utils = require('./utils');
const redisUtil = require('../util/redis/redis-utils');
const HttpStatus = require('http-status-codes');
function createStudentRequestApiServiceReq(studentRequest, req) {
  //studentRequest.pen = req.body.pen;
  studentRequest.studentRequestStatusCode = req.body.studentRequestStatusCode;
  studentRequest.reviewer = req.body.reviewer;
  studentRequest.failureReason = req.body.failureReason;
  studentRequest.completeComment = req.body.completeComment;
  if(req.body.statusUpdateDate) {
    studentRequest.statusUpdateDate = req.body.statusUpdateDate;
  }

  return studentRequest;
}

function unauthorizedError(res) {
  return res.status(HttpStatus.UNAUTHORIZED).json({
    message: 'No access token'
  });
}

function errorResponse(res, msg) {
  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    message: msg || 'INTERNAL SERVER ERROR'
  });
}

function updateForRejectAndReturn(studentRequest, userToken, req) {
  studentRequest.reviewer = req.body.reviewer;
  studentRequest.studentProfileRequestID = req.params.id || req.body.studentRequestID;
  studentRequest.staffMemberIDIRGUID = userToken['preferred_username'].toUpperCase();
  studentRequest.staffMemberName = userToken['idir_username'];
  studentRequest.email = req['session'].penRequest['email'];
  studentRequest.identityType = req['session'].identityType;
}

async function rejectProfileRequest(req, res) {
  let thisSession = req['session'];
  if (!thisSession.penRequest) {
    log.error('Error attempting to reject request.  There is no request stored in session.');
    return errorResponse(res);
  }
  const token = utils.getBackendToken(req);
  if (!token) {
    log.error('Error attempting to reject request.  Unable to get token.');
    return unauthorizedError(res);
  }
  try {
    const profileRequest = {};
    const userToken = utils.getUser(req);
    profileRequest.rejectionReason = req.body.failureReason;
    updateForRejectAndReturn(profileRequest, userToken, req);
    const url = `${config.get('server:profileSagaAPIURL')}/student-profile-reject-saga`;
    const sagaId = await utils.postData(token, url, profileRequest);
    const event = {
      sagaId: sagaId,
      studentRequestID: profileRequest.studentProfileRequestID, //DONT change the key it will break the check during getAllRequests or getRequestById in requests.js
      sagaStatus: 'INITIATED'
    };
    log.info('going to store event object in redis for reject student profile request :: ',event);
    await redisUtil.createSagaRecordInRedis(event);
    return res.status(200).json();
  } catch (e) {
    utils.logApiError(e, 'rejectPenRequest', 'Error occurred while attempting to reject a pen request.');
    if(e.status === HttpStatus.CONFLICT){
      return errorResponse(res,'Another saga is in progress');
    }
    return errorResponse(res);
  }
}
async function returnProfileRequest(req, res) {
  let thisSession = req['session'];
  if (!thisSession.penRequest) {
    log.error('Error attempting to return request.  There is no request stored in session.');
    return errorResponse(res);
  }
  const token = utils.getBackendToken(req);
  if (!token) {
    log.error('Error attempting to return request.  Unable to get token.');
    return unauthorizedError(res);
  }
  const userToken = utils.getUser(req);
  try {
    const profileRequest = {};

    profileRequest.commentContent = req.body.content;
    profileRequest.commentTimestamp = LocalDateTime.now().toString().substr(0, 19);
    updateForRejectAndReturn(profileRequest, userToken, req);
    const url = `${config.get('server:profileSagaAPIURL')}/student-profile-return-saga`;
    const sagaId = await utils.postData(token, url, profileRequest);
    const event = {
      sagaId: sagaId,
      studentRequestID: profileRequest.studentProfileRequestID, //DONT change the key it will break the check during getAllRequests or getRequestById in requests.js
      sagaStatus: 'INITIATED'
    };
    log.info('going to store event object in redis for return pen request :: ',event);
    await redisUtil.createSagaRecordInRedis(event);
    return res.status(200).json();
  } catch (e) {
    utils.logApiError(e, 'returnPenRequest', 'Error occurred while attempting to return a pen request.');
    if(e.status === HttpStatus.CONFLICT){
      return errorResponse(res,'Another saga is in progress');
    }
    return errorResponse(res);
  }
}
module.exports = {
  createStudentRequestApiServiceReq,
  rejectProfileRequest,
  returnProfileRequest
};
