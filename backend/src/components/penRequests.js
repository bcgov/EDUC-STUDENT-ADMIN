'use strict';
const {getData, logApiError, postData} = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const utils = require('./utils');
const redisUtil = require('../util/redis/redis-utils');
const {ApiError} = require('./error');
const {LocalDateTime} = require('@js-joda/core');
const log = require('./logger');
const commonRequest = require('./requests');

function createPenRequestApiServiceReq(penRequest, req) {
  penRequest.pen = req.body.pen;
  penRequest.penRequestStatusCode = req.body.penRequestStatusCode;
  penRequest.demogChanged = req.body.demogChanged;
  penRequest.bcscAutoMatchOutcome = req.body.bcscAutoMatchOutcome;
  penRequest.bcscAutoMatchDetails = req.body.bcscAutoMatchDetails;
  commonRequest.setDefaultsForCreateApiReq(penRequest, req);
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
  penRequest.penRetrievalRequestID = req.params.id || req.body.penRequestID;
  commonRequest.setDefaultsInRequestForRejectAndReturn(penRequest, req, userToken);
}

async function executePenReqSaga(token, url, penRequest, res, sagaType, user) {
  try {
    const sagaId = await postData(token, url, penRequest,null, user);
    const event = {
      sagaId: sagaId,
      penRequestID: penRequest.penRetrievalRequestID || penRequest.penRequestID,
      sagaStatus: 'INITIATED'
    };
    log.info(`going to store event object in redis for ${sagaType} pen request :: `, event);
    await redisUtil.createSagaRecordInRedis(event);
    return res.status(200).json();
  } catch (e) {
    logApiError(e, `${sagaType}`, `Error occurred while attempting to ${sagaType} a pen request.`);
    if (e.status === HttpStatus.CONFLICT) {
      return utils.errorResponse(res, 'Another saga in progress', HttpStatus.CONFLICT);
    }
    return utils.errorResponse(res);
  }
}

async function returnPenRequest(req, res) {
  const userToken = utils.getUser(req);
  const penRequest = {};
  penRequest.penRequestStatusCode = 'RETURNED';
  penRequest.commentContent = req.body.content;
  penRequest.commentTimestamp = LocalDateTime.now().toString().substr(0, 19);
  updateForRejectAndReturn(penRequest, userToken, req);
  return await executePenReqSaga(utils.getBackendToken(req), `${config.get('server:profileSagaAPIURL')}/pen-request-return-saga`, penRequest, res, 'return', req.body.reviewer);
}


async function unlinkRequest(req, res) {
  let request = req['session'].penRequest;
  delete request.dataSourceCode;
  request.reviewer = req.body.reviewer;
  request.digitalID = req['session'].penRequest.digitalID;
  request.penRetrievalRequestID = request.penRequestID;
  request.penRequestStatusCode = 'SUBSREV';
  return await executePenReqSaga(utils.getBackendToken(req), `${config.get('server:profileSagaAPIURL')}/pen-request-unlink-saga`, request, res, 'unlink', req.body.reviewer);
}

async function rejectPenRequest(req, res) {
  const penRequest = {};
  const userToken = utils.getUser(req);
  penRequest.penRequestStatusCode = 'REJECTED';
  penRequest.rejectionReason = req.body.failureReason;
  updateForRejectAndReturn(penRequest, userToken, req);
  return await executePenReqSaga(utils.getBackendToken(req), `${config.get('server:profileSagaAPIURL')}/pen-request-reject-saga`, penRequest, res, 'reject', req.body.reviewer);
}

async function completePenRequest(req, res) {
  let thisSession = req['session'];
  if (!thisSession.studentDemographics || !thisSession.studentDemographics['studGiven']) {
    log.error('Error attempting to complete request.  There are no student demographics in session.');
    return utils.errorResponse(res);
  }

  if (req.body.pen !== thisSession.studentDemographics.pen) {
    log.error('Error attempting to complete request.  PEN in the request is different from the one in the session.');
    return utils.errorResponse(res);
  }

  const penRequest = {};
  penRequest.penRequestStatusCode = 'MANUAL';
  penRequest.penRequestID = req.body.penRequestID;
  penRequest.pen = req.body.pen;
  penRequest.localID = thisSession.studentDemographics['localID'];
  penRequest.postalCode = thisSession.studentDemographics['postalCode'];
  penRequest.gradeCode = thisSession.studentDemographics['grade'];
  penRequest.mincode = thisSession.studentDemographics['mincode'];
  penRequest.demogChanged = req.body.demogChanged;
  penRequest.bcscAutoMatchOutcome = req.body.bcscAutoMatchOutcome;
  penRequest.bcscAutoMatchDetails = req.body.bcscAutoMatchDetails;
  commonRequest.setDefaultsInRequestForComplete(penRequest, thisSession, req);
  return await executePenReqSaga(utils.getBackendToken(req), `${config.get('server:profileSagaAPIURL')}/pen-request-complete-saga`, penRequest, res, 'complete', req.body.reviewer);
}

async function getPENRequestStats(req, res) {
  let initRevSearchCriteriaList = [{
    key: 'penRequestStatusCode',
    operation: 'like',
    value: 'INITREV',
    valueType: 'STRING'
  }];
  let subsRevSearchCriteriaList = [{
    key: 'penRequestStatusCode',
    operation: 'like',
    value: 'SUBSREV',
    valueType: 'STRING'
  }];
  return Promise.all([
    getData(utils.getBackendToken(req), config.get('server:penRequest:paginated'), {
      params: {
        pageSize: 1,
        searchCriteriaList: JSON.stringify(initRevSearchCriteriaList)
      }
    }),
    getData(utils.getBackendToken(req), config.get('server:penRequest:paginated'), {
      params: {
        pageSize: 1,
        searchCriteriaList: JSON.stringify(subsRevSearchCriteriaList)
      }
    }),
  ]).then(([initRevResponse, subsRevResponse]) => {
    return res.status(200).json({numInitRev: initRevResponse.totalElements, numSubsRev: subsRevResponse.totalElements});
  }).catch(e => {
    logApiError(e, 'getPENRequestStats', 'Error occurred while attempting to GET number of pen requests.');
    return utils.errorResponse(res);
  });
}


module.exports = {
  findPenRequestsByPen,
  createPenRequestApiServiceReq,
  createPenRequestCommentApiServiceReq,
  returnPenRequest,
  unlinkRequest,
  rejectPenRequest,
  completePenRequest,
  getPENRequestStats
};
