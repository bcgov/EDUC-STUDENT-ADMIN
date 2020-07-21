'use strict';
const {getData, logApiError, postData} = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const utils = require('./utils');
const redisUtil = require('../util/redis/redis-utils');
const {ApiError} = require('./error');
const {LocalDateTime} = require('@js-joda/core');
const log = require('./logger');

function createPenRequestApiServiceReq(penRequest, req) {
  penRequest.pen = req.body.pen;
  penRequest.penRequestStatusCode = req.body.penRequestStatusCode;
  penRequest.reviewer = req.body.reviewer;
  penRequest.failureReason = req.body.failureReason;
  penRequest.completeComment = req.body.completeComment;
  penRequest.demogChanged = req.body.demogChanged;
  penRequest.bcscAutoMatchOutcome = req.body.bcscAutoMatchOutcome;
  penRequest.bcscAutoMatchDetails = req.body.bcscAutoMatchDetails;
  if (req.body.statusUpdateDate) {
    penRequest.statusUpdateDate = req.body.statusUpdateDate;
  }

  return penRequest;
}

async function findPenRequestsByPen(req, res) {
  try {
    const token = utils.getBackendToken(req);
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }
    const url = `${config.get('server:penRequest:rootURL')}/?pen=${req.query.pen}`;
    const response = await getData(token, url);
    return res.status(200).json(response.length);
  } catch (e) {
    logApiError(e, 'findPenRequestsByPen', 'Failed to get pen requests for the given pen.');
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, {message: 'API error'}, e);
  }
}

function createPenRequestCommentApiServiceReq(req, userToken) {
  return {
    penRetrievalRequestID: req.params.id,
    staffMemberIDIRGUID: userToken['preferred_username'].toUpperCase(),
    staffMemberName: userToken['idir_username'],
    commentContent: req.body.content,
    commentTimestamp: LocalDateTime.now().toString()
  };
}

function updateForRejectAndReturn(penRequest, userToken, req) {
  penRequest.reviewer = req.body.reviewer;
  penRequest.penRetrievalRequestID = req.params.id || req.body.penRequestID;
  penRequest.staffMemberIDIRGUID = userToken['preferred_username'].toUpperCase();
  penRequest.staffMemberName = userToken['idir_username'];
  penRequest.email = req['session'].penRequest['email'];
  penRequest.identityType = req['session'].identityType;
}

async function executePenReqSaga(token, url, penRequest, res, sagaType) {
  try {
    const sagaId = await postData(token, url, penRequest);
    const event = {
      sagaId: sagaId,
      penRequestID: penRequest.penRetrievalRequestID,
      sagaStatus: 'INITIATED'
    };
    log.info(`going to store event object in redis for ${sagaType} pen request :: `, event);
    await redisUtil.createSagaRecordInRedis(event);
    return res.status(200).json();
  } catch (e) {
    logApiError(e, `${sagaType}`, `Error occurred while attempting to ${sagaType} a pen request.`);
    if (e.status === HttpStatus.CONFLICT) {
      return errorResponse(res, 'Another saga in progress');
    }
    return errorResponse(res);
  }
}

async function returnPenRequest(req, res) {
  const userToken = utils.getUser(req);
  const penRequest = {};
  penRequest.penRequestStatusCode = 'RETURNED';
  penRequest.commentContent = req.body.content;
  penRequest.commentTimestamp = LocalDateTime.now().toString().substr(0, 19);
  updateForRejectAndReturn(penRequest, userToken, req);
  return await executePenReqSaga(utils.getBackendToken(req), `${config.get('server:profileSagaAPIURL')}/pen-request-return-saga`, penRequest, res,'return');
}

function errorResponse(res, msg) {
  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    message: msg || 'INTERNAL SERVER ERROR'
  });
}

async function unlinkRequest(req, res) {
  let request = req['session'].penRequest;
  delete request.dataSourceCode;
  request.reviewer = req.body.reviewer;
  request.digitalID = req['session'].penRequest.digitalID;
  request.penRetrievalRequestID = request.penRequestID;
  request.penRequestStatusCode = 'SUBSREV';
  return await executePenReqSaga(utils.getBackendToken(req), `${config.get('server:profileSagaAPIURL')}/pen-request-unlink-saga`, request, res, 'unlink');
}

async function rejectPenRequest(req, res) {
  const penRequest = {};
  const userToken = utils.getUser(req);
  penRequest.penRequestStatusCode = 'REJECTED';
  penRequest.rejectionReason = req.body.failureReason;
  updateForRejectAndReturn(penRequest, userToken, req);
  return await executePenReqSaga(utils.getBackendToken(req), `${config.get('server:profileSagaAPIURL')}/pen-request-reject-saga`, penRequest, res, 'reject');
}

async function completePenRequest(req, res) {
  let thisSession = req['session'];
  if (!thisSession.studentDemographics || !thisSession.studentDemographics['studGiven']) {
    log.error('Error attempting to complete request.  There are no student demographics in session.');
    return errorResponse(res);
  }

  if (req.body.pen !== thisSession.studentDemographics.pen) {
    log.error('Error attempting to complete request.  PEN in the request is different from the one in the session.');
    return errorResponse(res);
  }

  const penRequest = {};
  penRequest.penRequestStatusCode = 'MANUAL';
  penRequest.digitalID = thisSession.penRequest.digitalID;
  penRequest.penRequestID = req.body.penRequestID;
  penRequest.pen = req.body.pen;
  penRequest.legalFirstName = thisSession.studentDemographics['studGiven'];
  penRequest.legalMiddleNames = thisSession.studentDemographics['studMiddle'];
  penRequest.legalLastName = thisSession.studentDemographics['studSurname'];
  penRequest.dob = thisSession.studentDemographics['dob'];
  penRequest.sexCode = thisSession.studentDemographics['studSex'];
  penRequest.genderCode = thisSession.studentDemographics['studSex'];
  penRequest.usualFirstName = thisSession.studentDemographics['usualGiven'];
  penRequest.usualMiddleNames = thisSession.studentDemographics['usualMiddle'];
  penRequest.usualLastName = thisSession.studentDemographics['usualSurname'];
  penRequest.localID = thisSession.studentDemographics['localID'];
  penRequest.postalCode = thisSession.studentDemographics['postalCode'];
  penRequest.gradeCode = thisSession.studentDemographics['grade'];
  penRequest.mincode = thisSession.studentDemographics['mincode'];
  penRequest.email = thisSession.penRequest.email;
  penRequest.emailVerified = thisSession.penRequest.emailVerified;
  penRequest.reviewer = req.body.reviewer;
  penRequest.completeComment = req.body.completeComment;
  penRequest.demogChanged = req.body.demogChanged;
  penRequest.bcscAutoMatchOutcome = req.body.bcscAutoMatchOutcome;
  penRequest.bcscAutoMatchDetails = req.body.bcscAutoMatchDetails;
  penRequest.identityType = thisSession.identityType;
  return await executePenReqSaga(utils.getBackendToken(req), `${config.get('server:profileSagaAPIURL')}/pen-request-complete-saga`, penRequest, res, 'complete');
}


module.exports = {
  findPenRequestsByPen,
  createPenRequestApiServiceReq,
  createPenRequestCommentApiServiceReq,
  returnPenRequest,
  unlinkRequest,
  rejectPenRequest,
  completePenRequest
};
