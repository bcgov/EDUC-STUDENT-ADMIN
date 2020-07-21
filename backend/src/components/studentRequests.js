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

function updateForRejectAndReturn(studentRequest, userToken, req) {
  studentRequest.reviewer = req.body.reviewer;
  studentRequest.studentProfileRequestID = req.params.id || req.body.studentRequestID;
  studentRequest.staffMemberIDIRGUID = userToken['preferred_username'].toUpperCase();
  studentRequest.staffMemberName = userToken['idir_username'];
  studentRequest.email = req['session'].penRequest['email'];
  studentRequest.identityType = req['session'].identityType;
}

async function rejectProfileRequest(req, res) {
  const profileRequest = {};
  const userToken = utils.getUser(req);
  profileRequest.rejectionReason = req.body.failureReason;
  updateForRejectAndReturn(profileRequest, userToken, req);
  const url = `${config.get('server:profileSagaAPIURL')}/student-profile-reject-saga`;
  return await executeProfReqSaga(utils.getBackendToken(req), url, profileRequest, res, 'reject');
}

async function executeProfReqSaga(token, url, profileRequest, res, sagaType) {
  try {
    const sagaId = await utils.postData(token, url, profileRequest);
    const event = {
      sagaId: sagaId,
      studentRequestID: profileRequest.studentProfileRequestID, //DONT change the key it will break the check during getAllRequests or getRequestById in requests.js
      sagaStatus: 'INITIATED'
    };
    log.info(`going to store event object in redis for ${sagaType} profile request :: `, event);
    await redisUtil.createSagaRecordInRedis(event);
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
  return await executeProfReqSaga(utils.getBackendToken(req), url, profileRequest, res, 'return');
}

async function completeProfileRequest(req, res) {
  let thisSession = req['session'];
  if (!thisSession.studentDemographics || !thisSession.studentDemographics['studGiven']) {
    log.error('Error attempting to complete profile request.  There are no student demographics in session.');
    return errorResponse(res);
  }

  const profileRequest = {};
  profileRequest.digitalID = thisSession.penRequest.digitalID;
  profileRequest.studentProfileRequestID = req.body.studentRequestID;
  profileRequest.pen = thisSession.studentDemographics.pen;
  profileRequest.legalFirstName = thisSession.studentDemographics['studGiven'];
  profileRequest.legalMiddleNames = thisSession.studentDemographics['studMiddle'];
  profileRequest.legalLastName = thisSession.studentDemographics['studSurname'];
  profileRequest.dob = thisSession.studentDemographics['dob'];
  profileRequest.sexCode = thisSession.studentDemographics['studSex'];
  profileRequest.genderCode = thisSession.studentDemographics['studSex'];
  profileRequest.usualFirstName = thisSession.studentDemographics['usualGiven'];
  profileRequest.usualMiddleNames = thisSession.studentDemographics['usualMiddle'];
  profileRequest.usualLastName = thisSession.studentDemographics['usualSurname'];
  profileRequest.email = thisSession.penRequest.email;
  profileRequest.emailVerified = thisSession.penRequest.emailVerified;
  profileRequest.reviewer = req.body.reviewer;
  profileRequest.completeComment = req.body.completeComment;
  profileRequest.identityType = thisSession.identityType;
  const url = `${config.get('server:profileSagaAPIURL')}/student-profile-complete-saga`;
  return await executeProfReqSaga(utils.getBackendToken(req), url, profileRequest, res, 'complete');
}
module.exports = {
  createStudentRequestApiServiceReq,
  rejectProfileRequest,
  returnProfileRequest,
  completeProfileRequest
};
