'use strict';
const {getData, logApiError} = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const utils = require('./utils');
const redisUtil = require('../util/redis/redis-utils');
const {ApiError} = require('./error');
const {LocalDateTime} = require('@js-joda/core');

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
  const request = {
    penRetrievalRequestID: req.params.id,
    staffMemberIDIRGUID: userToken['preferred_username'].toUpperCase(),
    staffMemberName: userToken['idir_username'],
    commentContent: req.body.content,
    commentTimestamp: LocalDateTime.now().toString()
  };
  return request;
}

async function returnPenRequest(req, res) {
  const token = utils.getBackendToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }
  const userToken = utils.getUser(req);
  try {
    const penRequest = {};

    penRequest.penRequestStatusCode = req.body.penRequestStatusCode;
    penRequest.reviewer = req.body.reviewer;
    if (req.body.statusUpdateDate) {
      penRequest.statusUpdateDate = req.body.statusUpdateDate;
    }
    penRequest.penRetrievalRequestID = req.params.id;
    penRequest.staffMemberIDIRGUID = userToken['preferred_username'].toUpperCase();
    penRequest.staffMemberName = userToken['idir_username'];
    penRequest.commentContent = req.body.content;
    penRequest.commentTimestamp = LocalDateTime.now().toString().substr(0,19);
    penRequest.createUser = 'STUDENT-ADMIN';
    penRequest.updateUser = 'STUDENT-ADMIN';
    penRequest.email = req['session'].penRequest['email'];
    penRequest.identityType = req['session'].identityType;
    const url = `${config.get('server:penRequest:saga')}/pen-request-return-saga`;
    const sagaId = await utils.postData(token, url, penRequest);
    const event ={
      sagaId:sagaId,
      penRequestID: penRequest.penRetrievalRequestID,
      sagaStatus:'INITIATED'
    };
    await redisUtil.createOrUpdatePenRequestSagaRecordInRedis(event);
    return res.status(200).json();
  } catch (e) {
    logApiError(e, 'returnPenRequest', 'Failed to post pen requests for the given pen.');
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, {message: 'API error'}, e);
  }
}

module.exports = {
  findPenRequestsByPen,
  createPenRequestApiServiceReq,
  createPenRequestCommentApiServiceReq,
  returnPenRequest
};
