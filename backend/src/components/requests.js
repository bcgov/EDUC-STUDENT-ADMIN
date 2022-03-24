'use strict';
const { getBackendToken, getData, putData, logApiError, errorResponse, unauthorizedError } = require('./utils');
const HttpStatus = require('http-status-codes');
const log = require('./logger');
const SAGAS = require('./saga');
const config = require('../config/index');
const utils = require('./utils');
const redisUtil = require('../util/redis/redis-utils');
const {ApiError, ServiceError} = require('./error');
const {LocalDateTime} = require('@js-joda/core');

function getAllRequests(requestType) {
  return async function getAllRequestsHandler(req, res) {
    const token = getBackendToken(req);
    if (!token) {
      return unauthorizedError(res);
    }
    //remove previous pen request from session
    delete req['session'].penRequest;
    delete req['session'].identityType;

    let searchListCriteria = [];
    const statusFilters = req.query.statusFilters;

    if (req.query.headerFilters) {
      let headerFilters = JSON.parse(req.query.headerFilters);
      Object.keys(headerFilters).forEach(element => {
        let operation = 'like_ignore_case';
        let valueType = 'STRING';
        if (element === 'initialSubmitDate') {
          headerFilters[element].forEach((date, index) => {
            headerFilters[element][index] = date + 'T00:00:01';
          });
          if (headerFilters[element].length === 1) {
            headerFilters[element].push(LocalDateTime.now().toString());
          }
          headerFilters[element] = headerFilters[element].join(',');
          operation = 'btn';
          valueType = 'DATE_TIME';
        }
        searchListCriteria.push({
          key: element,
          operation: operation,
          value: headerFilters[element],
          valueType: valueType
        });
      });
    }

    const statusCodeKeyName = `${requestType}StatusCode`;

    if (statusFilters) {
      const statusCodes = await utils.getCodeTable(token, `${requestType}StatusCodes`, config.get(`server:${requestType}:statusCodeURL`));
      statusFilters.forEach((element, index) => {
        statusFilters[index] = utils.getCodeFromLabel(statusCodes, statusCodeKeyName, element);
      });
      searchListCriteria.push({
        key: statusCodeKeyName,
        operation: 'in',
        value: statusFilters.join(','),
        valueType: 'STRING'
      });
    }
    const params = {
      params: {
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        sort: req.query.sort,
        searchCriteriaList: JSON.stringify(searchListCriteria)
      }
    };

    return Promise.all([
      utils.getCodeTable(token, `${requestType}StatusCodes`, config.get(`server:${requestType}:statusCodeURL`)),
      getData(token, config.get(`server:${requestType}:rootURL`) + '/paginated', params)
    ])
      .then(async ([statusCodeResponse, dataResponse]) => {
        const eventsArrayFromRedis = await redisUtil.getSagaEventsByRedisKey(SAGAS.GMP_UMP.sagaEventRedisKey);
        dataResponse['content'].forEach((element, i) => {
          const penRequestID = element['penRequestID'];
          const studentRequestID = element['studentRequestID'];
          let sagaInProgress = false;
          if ((penRequestID && eventsArrayFromRedis) || (studentRequestID && eventsArrayFromRedis) ){
            for (const eventString of eventsArrayFromRedis) {
              const event = JSON.parse(eventString);
              if ((event && event.penRequestID && event.penRequestID === penRequestID) ||(event && event.studentRequestID && event.studentRequestID === studentRequestID)){
                sagaInProgress = true; // DO NOT show this record in frontend list.
                break;
              }
            }
          }
          element.sagaInProgress = sagaInProgress;
          //replace status code with label
          if (element[statusCodeKeyName]) {
            let temp = statusCodeResponse.find(codeStatus => codeStatus[statusCodeKeyName] === element[statusCodeKeyName]);
            if (temp) {
              element[statusCodeKeyName] = temp;
            }
          }
          //dont send digital id or audit columns to frontend
          delete element['digitalID'];
          dataResponse['content'][i] = utils.stripAuditColumns(element);
        });
        return res.status(200).json(dataResponse);
      }).catch(e => {
        logApiError(e, 'getAllRequests', `Error occurred while attempting to GET all ${requestType} requests.`);
        return errorResponse(res);
      });
  };
}

function getRequestCommentById(requestType) {
  return async function getRequestCommentByIdHandler(req, res) {
    try {
      const token = utils.getBackendToken(req);
      if (!token) {
        return unauthorizedError(res);
      }
      const dataResponse = await getData(token, config.get(`server:${requestType}:rootURL`) + '/' + req.params.id + '/comments');

      let response = {
        messages: []
      };
      //sorting comments by date
      dataResponse.sort((a, b) => (a.commentTimestamp > b.commentTimestamp) ? 1 : ((b.commentTimestamp > a.commentTimestamp) ? -1 : 0));

      dataResponse.forEach(element => {
        const readableTime = utils.formatCommentTimestamp(element.commentTimestamp);
        response.messages.push({
          content: element.commentContent,
          participantId: (element.staffMemberIDIRGUID ? element.staffMemberIDIRGUID : '1'),
          name: (element.staffMemberName ? element.staffMemberName : 'Student'),
          timestamp: readableTime,
          color: (element.staffMemberIDIRGUID ? 'adminGreen' : 'studentBlue'),
          icon: (element.staffMemberIDIRGUID ? '$question' : '$info')
        });
      });
      return res.status(200).json(response);
    } catch (e) {
      logApiError(e, 'getRequestCommentById', 'Error occurred while attempting to GET all comments.');
      return errorResponse(res);
    }
  };
}

function getRequestById(requestType) {
  return async function getRequestByIdHandler(req, res) {
    try {
      const token = getBackendToken(req, res);
      if (!token) {
        return unauthorizedError(res);
      }
      return Promise.all([
        getData(token, config.get(`server:${requestType}:rootURL`) + '/' + req.params.id),
        utils.getCodeTable(token, 'identityTypeCodes', config.get('server:digitalIdIdentityTypeCodesURL')),
        utils.getCodeTable(token, `${requestType}StatusCodes`, config.get(`server:${requestType}:statusCodeURL`))
      ])
        .then(async ([dataResponse, digitalIdIdentityTypeCodesResponse, statusCodesResponse]) => {
          const response = await getData(token, config.get('server:digitalIdURL') + '/' + dataResponse['digitalID']);
          req['session'].identityType = response['identityTypeCode']; // add this to session for next use while triggering email.
          if (!digitalIdIdentityTypeCodesResponse) {
            log.error('Failed to get digitalId identity type codes. Using code value instead of label.');
            dataResponse['dataSourceCode'] = response['identityTypeCode'];
          } else {
            let label = utils.getCodeLabel(digitalIdIdentityTypeCodesResponse, 'identityTypeCode', response['identityTypeCode']);
            if (label) {
              dataResponse['dataSourceCode'] = label;
            } else {
              log.error('Failed to get digitalId identity type codes. Using code value instead of label.');
              dataResponse['dataSourceCode'] = response['identityTypeCode'];
            }
          }
          if (!statusCodesResponse) {
            log.error(`Failed to get ${requestType} status codes.  Using code value instead of label.`);
          } else {
            dataResponse[`${requestType}StatusCodeLabel`] = utils.getCodeLabel(statusCodesResponse, `${requestType}StatusCode`, dataResponse[`${requestType}StatusCode`]);
          }
          const id = dataResponse[`${requestType}ID`];
          const eventsArrayFromRedis = await redisUtil.getSagaEventsByRedisKey(SAGAS.GMP_UMP.sagaEventRedisKey);
          if (id && eventsArrayFromRedis) {
            for (const eventString of eventsArrayFromRedis) {
              const event = JSON.parse(eventString);
              if (event && event[`${requestType}ID`] && event[`${requestType}ID`] === id) {
                dataResponse['sagaInProgress'] = true; // send saga in progress, so that details page can have the value in frontend.
                break;
              }
            }
          }
          utils.saveSession(req, res, dataResponse);
          log.debug('stored request details in session is', req.session.penRequest);
          //dont send digital id or audit columns to vue
          dataResponse = utils.stripAuditColumns(dataResponse);
          delete dataResponse['digitalID'];
          return res.status(200).json(dataResponse);
        })
        .catch(e => {
          logApiError(e, 'getRequestById', `Error occurred while attempting to GET ${requestType}.`);
          return errorResponse(res);
        });
    } catch (e) {
      logApiError(e, 'getRequestById', `Error occurred while attempting to GET ${requestType}.`);
      return errorResponse(res);
    }
  };
}

async function getStudentById(req, res) {
  const token = utils.getBackendToken(req);
  if (!token) {
    return unauthorizedError(res);
  }
  const id = req.params.id;
  return Promise.all([
    utils.getData(token, config.get('server:student:rootURL'), {params: {pen: id}}),
    utils.getCodeTable(token, 'genderCodes', config.get('server:student:genderCodesURL'))
  ])
    .then(async ([dataResponse, genderCodesResponse]) => {
      if (Array.isArray(dataResponse) && dataResponse.length === 1) {
        const formattedResponse = {
          legalFirstName: dataResponse[0].legalFirstName,
          legalMiddleNames: dataResponse[0].legalMiddleNames,
          legalLastName: dataResponse[0].legalLastName,
          usualFirstName: dataResponse[0].usualFirstName,
          usualMiddleNames: dataResponse[0].usualMiddleNames,
          usualLastName: dataResponse[0].usualLastName,
          dob: dataResponse[0].dob,
          genderCode: utils.getCodeLabel(genderCodesResponse, 'genderCode', dataResponse[0].genderCode)
        };
        return res.status(200).json(formattedResponse);
      } else {
        log.error('An invalid number of students was returned from the student api.  There should be exactly one result returned.');
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'INTERNAL SERVER ERROR'
        });
      }
    }).catch((e) => {
      logApiError(e, 'getStudentById', 'Error occurred while attempting to GET student.');
      return errorResponse(res);
    });
}

async function getStudentDemographicsById(req, res) {
  try {
    const token = utils.getBackendToken(req);
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    let statusCode;
    if(config.get('server:enablePrrStudentDemographics')) {
      const response = await utils.getData(token, config.get('server:student:rootURL') + '/', {params: {pen: req.params.id}});
      if(response.length === 0) {
        const message = `No student record was found for pen :: ${req.params.id}`;
        log.error(message);
        return errorResponse(res, message, HttpStatus.NOT_FOUND);
      }
      req['session'].studentDemographics = {
        pen: response[0]['pen'],
        studGiven: response[0]['legalFirstName'],
        studMiddle: response[0]['legalMiddleNames'],
        studSurname: response[0]['legalLastName'],
        dob: response[0]['dob'],
        studGender: response[0]['genderCode'],
        usualGiven: response[0]['usualFirstName'],
        usualMiddle: response[0]['usualMiddleNames'],
        usualSurname: response[0]['usualLastName'],
        localID: response[0]['localID'],
        postalCode: response[0]['postalCode'],
        grade: response[0]['gradeCode'],
        mincode: response[0]['mincode']
      };
      statusCode = response[0]['statusCode'];
    } else {
      const response = await utils.getData(token, config.get('server:demographicsURL') + '/' + req.params.id);
      const birthDate = utils.formatDate(response['studBirth']);
      req['session'].studentDemographics = response;
      req['session'].studentDemographics.dob = birthDate;
    }
    
    const formattedResponse = {
      legalFirst: req['session'].studentDemographics['studGiven'],
      legalMiddle: req['session'].studentDemographics['studMiddle'],
      legalLast: req['session'].studentDemographics['studSurname'],
      usualFirst: req['session'].studentDemographics['usualGiven'],
      usualMiddle: req['session'].studentDemographics['usualMiddle'],
      usualLast: req['session'].studentDemographics['usualSurname'],
      dob: req['session'].studentDemographics['dob'],
      gender: req['session'].studentDemographics['studGender'],
      statusCode,
    };
    return res.status(200).json(formattedResponse);
  } catch (e) {
    if (e.status === HttpStatus.NOT_FOUND) {
      const message = `No demographics data was found for pen :: ${req.params.id}`;
      logApiError(e, 'getStudentDemographicsById', message);
      return errorResponse(res, message, HttpStatus.NOT_FOUND);
    }
    logApiError(e, 'getStudentDemographicsById', 'Error occurred while attempting to GET pen demographics.');
    return errorResponse(res);
  }
}

function putRequest(requestType, createRequestApiServiceReq) {
  return async function putRequestHandler(req, res) {
    try {
      const dataResponse = await updateRequest(req, res, requestType, createRequestApiServiceReq);
      return res.status(200).json(utils.stripAuditColumns(dataResponse));
    } catch (e) {
      logApiError(e, 'putRequest', `Error occurred while attempting a PUT to ${requestType}.`);
      return errorResponse(res);
    }
  };
}

async function updateRequest(req, res, requestType, createApiServiceReq) {
  let thisSession = req['session'];
  if (!thisSession.penRequest) {
    log.error('Error attempting to update request.  There is no request stored in session.');
    throw new ServiceError('updateRequest', {message: 'Empty session'});
  }
  const token = utils.getBackendToken(req);
  if (!token) {
    log.error('Error attempting to update request.  Unable to get token.');
    throw new ServiceError('updateRequest', {message: 'No access token'});
  }
  let request = thisSession.penRequest;
  const dataSourceCode = request.dataSourceCode;
  delete request.dataSourceCode;

  request = createApiServiceReq(request, req);

  return Promise.all([
    putData(token, config.get(`server:${requestType}:rootURL`), request, utils.getUser(req).idir_username),
    utils.getCodeTable(token, `${requestType}StatusCodes`, config.get(`server:${requestType}:statusCodeURL`))
  ])
    .then(async ([dataResponse, statusCodesResponse]) => {
      dataResponse.dataSourceCode = dataSourceCode;
      if (!statusCodesResponse) {
        log.error('Failed to get request status codes.  Using code value instead of label.');
        dataResponse[`${requestType}StatusCodeLabel`] = request[`${requestType}StatusCode`];
      } else {
        dataResponse[`${requestType}StatusCodeLabel`] = utils.getCodeLabel(statusCodesResponse, `${requestType}StatusCode`, dataResponse[`${requestType}StatusCode`]);
      }
      utils.saveSession(req, res, dataResponse);
      //dont return digitalid or audit columns to frontend
      dataResponse = utils.stripAuditColumns(dataResponse);
      delete dataResponse['digitalID'];
      return dataResponse;
    })
    .catch(e => {
      logApiError(e, 'updateRequest', 'Error updating a request.');
      const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new ApiError(status, {message: 'API PUT error'}, e);
    });
}

/**
 * Common function to be used between pen request and profile request to reduce duplication.
 * @param request
 * @param req
 * @param userToken
 */
function setDefaultsInRequestForRejectAndReturn(request, req, userToken) {
  request.reviewer = req.body.reviewer;
  request.staffMemberIDIRGUID = userToken['idir_guid'].toUpperCase();
  request.staffMemberName = userToken['idir_username'];
  request.email = req['session'].penRequest['email'];
  request.identityType = req['session'].identityType;
}

function setDefaultsInRequestForComplete(request, thisSession, req) {
  request.digitalID = thisSession.penRequest.digitalID;
  request.legalFirstName = thisSession.studentDemographics['studGiven'];
  request.legalMiddleNames = thisSession.studentDemographics['studMiddle'];
  request.legalLastName = thisSession.studentDemographics['studSurname'];
  request.dob = thisSession.studentDemographics['dob'];
  request.genderCode = thisSession.studentDemographics['studGender'];
  request.sexCode = thisSession.studentDemographics['studGender'];
  request.usualFirstName = thisSession.studentDemographics['usualGiven'];
  request.usualMiddleNames = thisSession.studentDemographics['usualMiddle'];
  request.usualLastName = thisSession.studentDemographics['usualSurname'];
  request.email = thisSession.penRequest.email;
  request.emailVerified = 'Y'; // no request will reach the admins to complete, without email verification.
  request.reviewer = req.body.reviewer;
  request.completeComment = req.body.completeComment;
  request.identityType = thisSession.identityType;
  request.historyActivityCode = 'PEN';
  request.localID = thisSession.studentDemographics['localID'];
  request.postalCode = thisSession.studentDemographics['postalCode'];
  request.gradeCode = thisSession.studentDemographics['grade'];
  request.mincode = thisSession.studentDemographics['mincode'];
}
function setDefaultsForCreateApiReq(request, req) {
  request.reviewer = req.body.reviewer;
  request.failureReason = req.body.failureReason;
  request.completeComment = req.body.completeComment;
  if (req.body.statusUpdateDate) {
    request.statusUpdateDate = req.body.statusUpdateDate;
  }
}

module.exports = {
  getAllRequests,
  getRequestCommentById,
  getRequestById,
  getStudentById,
  getStudentDemographicsById,
  putRequest,
  updateRequest,
  setDefaultsInRequestForRejectAndReturn,
  setDefaultsInRequestForComplete,
  setDefaultsForCreateApiReq
};
