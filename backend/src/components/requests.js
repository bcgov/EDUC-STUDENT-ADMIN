'use strict';
const { getBackendToken, getData, postData, putData, logApiError } = require('./utils');
const HttpStatus = require('http-status-codes');
const log = require('./logger');
const config = require('../config/index');
const utils = require('./utils');
const redisUtil = require('../util/redis/redis-utils');
const {ApiError, ServiceError} = require('./error');
const {LocalDateTime} = require('@js-joda/core');

function completeRequest(requestType, createRequestApiServiceReq) {
  return async function completeRequestHandler(req, res) {
    try {
      const token = getBackendToken(req, res);
      if (!token) {
        return unauthorizedError(res);
      }
      req.body.statusUpdateDate = LocalDateTime.now();
      return Promise.all([
        updateRequest(req, res, requestType, createRequestApiServiceReq),
        sendRequestEmail(req, token, 'COMPLETE', requestType),
        updateStudentAndDigitalId(req)
      ])
        .then(async (response) => {
          return res.status(200).json(response[0]);
        })
        .catch(e => {
          logApiError(e, 'completeRequest', `Error occurred while attempting to PUT a ${requestType}.`);
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'INTERNAL SERVER ERROR'
          });
        });
    } catch (e) {
      logApiError(e, 'completeRequest', `Error occurred while attempting to PUT a ${requestType}.`);
      return errorResponse(res);
    }
  };
}

function completeStudentProfileRequest(requestType, createRequestApiServiceReq) {
  return async function completeRequestHandler(req, res) {
    try {
      const token = getBackendToken(req, res);
      if (!token) {
        return unauthorizedError(res);
      }
      req.body.statusUpdateDate = LocalDateTime.now();
      return Promise.all([
        updateRequest(req, res, requestType, createRequestApiServiceReq),
        sendRequestEmail(req, token, 'COMPLETE', requestType)
      ])
        .then(async (response) => {
          return res.status(200).json(response[0]);
        })
        .catch(e => {
          logApiError(e, 'completeRequest', `Error occurred while attempting to PUT a ${requestType}.`);
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'INTERNAL SERVER ERROR'
          });
        });
    } catch (e) {
      logApiError(e, 'completeRequest', `Error occurred while attempting to PUT a ${requestType}.`);
      return errorResponse(res);
    }
  };
}

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
        let filteredList = [];
        const eventsArrayFromRedis = await redisUtil.getPenRequestSagaEvents();
        dataResponse['content'].forEach((element, i) => {
          const penRequestID = element['penRequestID'];
          let sagaInProgress = false;
          if (penRequestID && eventsArrayFromRedis) {
            for (const eventString of eventsArrayFromRedis) {
              const event = JSON.parse(eventString);
              if (event && event.penRequestID && event.penRequestID === penRequestID) {
                sagaInProgress = true; // DO NOT show this record in frontend list.
                break;
              }
            }
          }
          if (!sagaInProgress) {
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
            filteredList.push(dataResponse['content'][i]);
          }
        });
        dataResponse['content'] = filteredList;
        return res.status(200).json(dataResponse);
      }).catch(e => {
        logApiError(e, 'getAllRequests', `Error occurred while attempting to GET all ${requestType} requests.`);
        return errorResponse(res);
      });
  };
}

function getMacros(requestType) {
  return async function getMacrosHandler(req, res) {
    const token = utils.getBackendToken(req);
    if (!token) {
      return unauthorizedError(res);
    }
    const url = config.get(`server:${requestType}:macrosURL`);
    return Promise.all([
      getData(token, url, {params: {macroTypeCode: 'MOREINFO'}}),
      getData(token, url, {params: {macroTypeCode: 'REJECT'}}),
      getData(token, url, {params: {macroTypeCode: 'COMPLETE'}})
    ]).then(([returnResponse, rejectResponse, completeResponse]) => {
      returnResponse.forEach((element, i) => {
        returnResponse[i] = utils.stripAuditColumns(element);
        delete returnResponse[i]['macroId'];
      });
      rejectResponse.forEach((element, i) => {
        rejectResponse[i] = utils.stripAuditColumns(element);
        delete rejectResponse[i]['macroId'];
      });
      completeResponse.forEach((element, i) => {
        completeResponse[i] = utils.stripAuditColumns(element);
        delete completeResponse[i]['macroId'];
      });
      return res.status(200).json({
        returnMacros: returnResponse,
        rejectMacros: rejectResponse,
        completeMacros: completeResponse
      });
    }).catch((e) => {
      logApiError(e, 'getMacros', 'Error occurred while attempting to GET macros.');
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

//keys = ['identityTypeCodes', 'penStatusCodes', 'studentRequestStatusCodes']
function getRequestCodes(urlKey, cacheKey) {
  return async function getRequestCodesHandler(req, res) {
    try {
      const token = getBackendToken(req);
      if (!token) {
        return unauthorizedError(res);
      }
      const url = config.get(urlKey);
      const statusCodes = await utils.getCodeTable(token, cacheKey, url);

      return res.status(HttpStatus.OK).json(statusCodes);

    } catch (e) {
      logApiError(e, 'getRequestCodes', 'Error occurred while attempting to GET request status codes.');
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
          utils.saveSession(req, res, dataResponse);
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

function unauthorizedError(res) {
  return res.status(HttpStatus.UNAUTHORIZED).json({
    message: 'No access token'
  });
}

async function getStudentById(req, res) {
  const token = utils.getBackendToken(req);
  if (!token) {
    return unauthorizedError(res);
  }
  const id = req.params.id;
  return Promise.all([
    utils.getData(token, config.get('server:studentURL'), {params: {pen: id}}),
    utils.getCodeTable(token, 'genderCodes', config.get('server:studentGenderCodesURL'))
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
    const response = await utils.getData(token, config.get('server:demographicsURL') + '/' + req.params.id);
    const birthDate = utils.formatDate(response['studBirth']);
    req['session'].studentDemographics = response;
    req['session'].studentDemographics.dob = birthDate;
    const formattedResponse = {
      legalFirst: response['studGiven'],
      legalMiddle: response['studMiddle'],
      legalLast: response['studSurname'],
      usualFirst: response['usualGiven'],
      usualMiddle: response['usualMiddle'],
      usualLast: response['usualSurname'],
      dob: birthDate,
      gender: response['studSex']
    };
    return res.status(200).json(formattedResponse);
  } catch (e) {
    logApiError(e, 'getStudentDemographicsById', 'Error occurred while attempting to GET pen demographics.');
    return errorResponse(res);
  }
}

async function sendRequestEmail(req, token, emailType, requestType) {
  const lowerCaseEmail = emailType.toLowerCase();
  const emailBody = {
    emailAddress: req['session'].penRequest['email'],
    identityType: req['session'].identityType
  };
  let params;
  if (lowerCaseEmail === 'reject') {
    if (!req.body.failureReason) {
      throw new ServiceError('400', 'EMAIL Error: Failure reason is required.');
    }
    emailBody.rejectionReason = req.body.failureReason;
  } else if (lowerCaseEmail === 'complete') {
    if (!req['session'].studentDemographics || !req['session'].studentDemographics['studGiven']) {
      throw new ServiceError('500', 'EMAIL Error: There are no student demographics in session.');
    }
    emailBody.firstName = req['session'].studentDemographics['studGiven'];
    if (req.body.demogChanged === 'Y') {
      params = {params: {demographicsChanged: true}};
    } else {
      params = {params: {demographicsChanged: false}};
    }
  }
  try {
    await postData(token, config.get(`server:${requestType}:emails`) + '/' + lowerCaseEmail, emailBody, params);
  } catch (e) {
    logApiError(e, 'sendRequestEmail', 'Error calling email service.');
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, {message: 'EMAIL error'}, e);
  }
}

async function postRequestComment(req, requestType, createCommentApiServiceReq) {
  const token = utils.getBackendToken(req);
  if (!token) {
    log.error('postRequestComment Error: No access token');
    throw new ServiceError('postRequestComment', {message: 'No access token'});
  }
  const userToken = utils.getUser(req);
  if (!userToken || !userToken['idir_username'] || !userToken['preferred_username']) {
    log.error('postRequestComment Error: could not get user info');
    throw new ServiceError('postRequestComment', {message: 'API Put error'});
  }
  try {
    //mapping from what comment widget needs to what the comments api needs
    const request = createCommentApiServiceReq(req, userToken);

    const commentResponse = await postData(token, config.get(`server:${requestType}:rootURL`) + '/' + req.params.id + '/comments', request);
    const readableTime = utils.formatCommentTimestamp(commentResponse.commentTimestamp);
    return {
      content: commentResponse.commentContent,
      participantId: (commentResponse.staffMemberIDIRGUID ? commentResponse.staffMemberIDIRGUID : '1'),
      name: (commentResponse.staffMemberName ? commentResponse.staffMemberName : 'Student'),
      timestamp: readableTime,
      color: (commentResponse.staffMemberIDIRGUID ? 'adminGreen' : 'studentBlue'),
      icon: (commentResponse.staffMemberIDIRGUID ? '$question' : '$info')
    };
  } catch (e) {
    logApiError(e, 'postRequestComment', `Error occurred while attempting to POST ${requestType} comment.`);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ServiceError(status, {message: 'API Put error'}, e);
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

function rejectRequest(requestType, createRequestApiServiceReq) {
  return async function rejectRequestHandler(req, res) {
    try {
      const token = getBackendToken(req, res);
      if (!token) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No access token'
        });
      }
      req.body.statusUpdateDate = LocalDateTime.now();
      const response = await updateRequest(req, res, requestType, createRequestApiServiceReq);
      try {
        await sendRequestEmail(req, token, 'REJECT', requestType);
        return res.status(200).json(response);
      } catch (e) {
        logApiError(e, 'rejectRequest', 'Error occurred while attempting to call the email service.');
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'INTERNAL SERVER ERROR calling email service'
        });
      }
    } catch (e) {
      logApiError(e, 'rejectRequest', `Error occurred while attempting to PUT a ${requestType}.`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'INTERNAL SERVER ERROR'
      });
    }
  };
}

function returnRequest(requestType, createRequestApiServiceReq, createCommentApiServiceReq) {
  return async function returnRequestHandler(req, res) {
    const token = getBackendToken(req, res);
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }
    req.body.statusUpdateDate = LocalDateTime.now();

    return Promise.all([
      updateRequest(req, res, requestType, createRequestApiServiceReq),
      postRequestComment(req, requestType, createCommentApiServiceReq),

    ]).then(async ([penResponse, commentResponse]) => {
      await sendRequestEmail(req, token, 'INFO', requestType);
      const formattedResponse = {
        penResponse: penResponse,
        commentResponse: commentResponse
      };
      return res.status(200).json(formattedResponse);
    }).catch(e => {
      logApiError(e, 'returnRequest', `Error occurred while attempting to PUT a ${requestType} and POST comment.`);
      let message = 'INTERNAL SERVER ERROR';
      if (e.data.message.includes('EMAIL')) {
        message = 'INTERNAL SERVER ERROR calling email service';
      }
      return errorResponse(res, message);
    });
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
    putData(token, config.get(`server:${requestType}:rootURL`), request),
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

async function updateStudentAndDigitalId(req) {
  const token = utils.getBackendToken(req);
  let studentResponse = null;
  const url = config.get('server:studentURL');
  const studentBody = {
    pen: req['session'].studentDemographics.pen,
    legalFirstName: req['session'].studentDemographics['studGiven'],
    legalMiddleNames: req['session'].studentDemographics['studMiddle'],
    legalLastName: req['session'].studentDemographics['studSurname'],
    dob: req['session'].studentDemographics['dob'],
    sexCode: req['session'].studentDemographics['studSex'],
    genderCode: req['session'].studentDemographics['studSex'],
    usualFirstName: req['session'].studentDemographics['usualGiven'],
    usualMiddleNames: req['session'].studentDemographics['usualMiddle'],
    usualLastName: req['session'].studentDemographics['usualSurname'],
    localID: req['session'].studentDemographics['localID'],
    postalCode: req['session'].studentDemographics['postalCode'],
    gradeCode: req['session'].studentDemographics['grade'],
    mincode: req['session'].studentDemographics['mincode'],
    email: req['session'].penRequest.email,
    emailVerified: req['session'].penRequest.emailVerified,
  };
  try {
    const studentAndDigitalIdResponse = await utils.getData(token, url, {params: {pen: studentBody.pen}});

    if (Array.isArray(studentAndDigitalIdResponse) && studentAndDigitalIdResponse.length === 1) {
      studentBody.studentID = studentAndDigitalIdResponse[0].studentID;
      studentResponse = await putData(token, config.get('server:studentURL'), studentBody);
    } else if (Array.isArray(studentAndDigitalIdResponse) && !studentAndDigitalIdResponse.length) {
      studentResponse = await postData(token, config.get('server:studentURL'), studentBody);
    } else {
      log.error('Failed to create student record. Invalid response data from student api, there should not be more than one student with the same pen. Complete pen transaction will be out of sync. Student record still needs to be created.');
    }
  } catch (e) {
    logApiError(e, 'updateStudentAndDigitalId', 'Failed to update student. Complete pen transaction will be out of sync. Student record still needs to be created.');
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, {message: 'API error'}, e);
  }
  if (!studentResponse) {
    log.error('Null response from student api. Complete pen transaction will be out of sync. StudentId in DigitalId record still needs to be updated.');
    throw new ApiError(500, {message: 'API error'});
  }
  try {
    const digitalIdResponse = await getData(token, config.get('server:digitalIdURL') + '/' + req['session'].penRequest.digitalID);
    if (digitalIdResponse && digitalIdResponse.studentID !== studentResponse['studentID']) {
      let digitalIdBody = digitalIdResponse;
      digitalIdBody.studentID = studentResponse['studentID'];
      delete digitalIdBody['updateUser'];
      delete digitalIdBody['updateDate'];
      delete digitalIdBody['createDate'];

      return await putData(token, config.get('server:digitalIdURL'), digitalIdBody);
    }
  } catch (e) {
    logApiError(e, 'updateStudentAndDigitalId', 'Failed to update digitalid. Complete pen transaction will be out of sync. StudentId in DigitalId record still needs to be updated.');
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, {message: 'API error'}, e);
  }


}

function errorResponse(res, msg) {
  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    message: msg || 'INTERNAL SERVER ERROR'
  });
}



module.exports = {
  completeRequest,
  completeStudentProfileRequest,
  getAllRequests,
  getMacros,
  getRequestCommentById,
  getRequestById,
  getStudentById,
  getStudentDemographicsById,
  postRequestComment,
  putRequest,
  rejectRequest,
  returnRequest,
  updateRequest,
  getRequestCodes,
  sendRequestEmail
};
