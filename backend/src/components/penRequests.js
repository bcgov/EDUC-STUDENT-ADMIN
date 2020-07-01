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

    penRequest.penRequestStatusCode = 'RETURNED';
    penRequest.reviewer = req.body.reviewer;
    penRequest.penRetrievalRequestID = req.params.id;
    penRequest.staffMemberIDIRGUID = userToken['preferred_username'].toUpperCase();
    penRequest.staffMemberName = userToken['idir_username'];
    penRequest.commentContent = req.body.content;
    penRequest.commentTimestamp = LocalDateTime.now().toString().substr(0, 19);
    penRequest.email = req['session'].penRequest['email'];
    penRequest.identityType = req['session'].identityType;
    const url = `${config.get('server:profileSagaAPIURL')}/pen-request-return-saga`;
    const sagaId = await utils.postData(token, url, penRequest);
    const event = {
      sagaId: sagaId,
      penRequestID: penRequest.penRetrievalRequestID,
      sagaStatus: 'INITIATED'
    };
    await redisUtil.createOrUpdatePenRequestSagaRecordInRedis(event);
    return res.status(200).json();
  } catch (e) {
    logApiError(e, 'returnPenRequest', 'Error occurred while attempting to return a pen request.');
    return errorResponse(res);
  }
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

async function unlinkRequest(req, res) {
  try {
    let thisSession = req['session'];
    if (!thisSession.penRequest) {
      log.error('Error attempting to unlink request.  There is no request stored in session.');
      return errorResponse(res);
    }
    const token = utils.getBackendToken(req);
    if (!token) {
      log.error('Error attempting to unlink request.  Unable to get token.');
      return unauthorizedError(res);
    }
    let request = thisSession.penRequest;
    delete request.dataSourceCode;
    request.reviewer = req.body.reviewer;
    request.digitalID = req['session'].penRequest.digitalID;
    request.penRetrievalRequestID = request.penRequestID;
    request.penRequestStatusCode = 'SUBSREV';
    const response = await postData(token, `${config.get('server:profileSagaAPIURL')}/pen-request-unlink-saga`, request);
    const event = {
      sagaId: response,
      penRequestID: request.penRequestID,
      sagaStatus: 'INITIATED'
    };
    await redisUtil.createOrUpdatePenRequestSagaRecordInRedis(event);
    return res.status(200).json({sagaId: response});
  } catch (e) {
    logApiError(e, 'unlinkRequest', 'Error occurred while attempting to unlink a pen request.');
    return errorResponse(res);
  }
}

module.exports = {
  findPenRequestsByPen,
  createPenRequestApiServiceReq,
  createPenRequestCommentApiServiceReq,
  returnPenRequest,
  unlinkRequest
};
