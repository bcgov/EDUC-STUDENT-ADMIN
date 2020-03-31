'use strict';
const { getBackendToken, getData, postData, putData, logApiError } = require('./utils');
const HttpStatus = require('http-status-codes');
const LocalDateTime = require('@js-joda/core').LocalDateTime;
const log = require('npmlog');
const config = require('../config/index');
const utils = require('../components/utils');
const { ApiError, ServiceError } = require('./error');
async function completePenRequest(req, res) {
  try {
    const token = getBackendToken(req, res);
    if(!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }
    req.body.statusUpdateDate = LocalDateTime.now();
    return Promise.all([
      updatePenRequest(req, res),
      sendPenRequestEmail(req, token, 'COMPLETE'),
      updateStudentAndDigitalId(req)
    ])
      .then(async (response) => {
        return res.status(200).json(response[0]);
      })
      .catch(e => {
        logApiError(e, 'completePenRequest', 'Error occurred while attempting to PUT a pen request.');
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'INTERNAL SERVER ERROR'
        });
      });
  } catch(e) {
    logApiError(e, 'completePenRequest', 'Error occurred while attempting to PUT a pen request.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}

async function getAllPenRequests(req, res) {
  const token = getBackendToken(req);
  if(!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }
  return Promise.all([
    utils.getCodeTable(token, 'penStatusCodes', config.get('server:statusCodeURL')),
    getData(token, config.get('server:penRequestURL'))
  ])
    .then(async ([statusCodeResponse, penRetrievalResponse]) => {
      penRetrievalResponse.forEach(element => {
        //replace status code with label
        if (element.penRequestStatusCode) {
          let temp = statusCodeResponse.find(codeStatus => codeStatus.penRequestStatusCode === element.penRequestStatusCode);
          if (temp) {
            element.penRequestStatusCode = temp;
          }
        }
        //dont send digital id to frontend
        delete element['digitalID'];
      });
      return res.status(200).json(penRetrievalResponse);
    }).catch(e => {
      logApiError(e, 'getAllPenRequests', 'Error occurred while attempting to GET all pen requests.');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'INTERNAL SERVER ERROR'
      });
    });
}

async function getPenRequestCommentById(req, res) {
  try{
    const token = await utils.getBackendToken(req);
    if(!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }
    const userToken = await utils.getUser(req);

    if(!userToken || !userToken['idir_username'] || !userToken['preferred_username']) {
      log.error('getPenRequestCommentById Error: could not get user info');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'INTERNAL SERVER ERROR'
      });
    }

    const penRetrievalResponse = await getData(token,config.get('server:penRequestURL') + '/' + req.params.id + '/comments');

    //setting response object to the format required by comments widget
    let response = {
      participants: [],
      myself: {
        name: userToken['idir_username'],
        id: userToken['preferred_username'].toUpperCase()
      },
      messages: []
    };
    //sorting comments by date
    penRetrievalResponse.sort((a,b) => (a.commentTimestamp > b.commentTimestamp) ? 1 : ((b.commentTimestamp > a.commentTimestamp) ? -1 : 0));

    //if staffMember fields are null then comment was made by the student
    penRetrievalResponse.forEach(element => {
      const participant = {
        name: (element.staffMemberName ? element.staffMemberName : 'Student'),
        id: (element.staffMemberIDIRGUID ? element.staffMemberIDIRGUID : '1')
      };
      //push all unique participants that are not myself
      if (participant.id.toUpperCase() !== response.myself.id.toUpperCase()) {
        const index = response.participants.findIndex((e) => e.id === participant.id);
        if (index === -1) {
          response.participants.push(participant);
        }
      }
      let timestamp = new Date(element.commentTimestamp);
      response.messages.push({
        content: element.commentContent,
        participantId: (element.staffMemberIDIRGUID ? element.staffMemberIDIRGUID : '1'),
        timestamp: {
          year: timestamp.getFullYear(),
          month: timestamp.getMonth() + 1,
          day: timestamp.getDate(),
          hour: timestamp.getHours(),
          minute: timestamp.getMinutes(),
          second: timestamp.getSeconds(),
          millisecond: timestamp.getMilliseconds()
        }
      });
    });
    return res.status(200).json(response);
  } catch(e) {
    logApiError(e, 'getPenRequestCommentById', 'Error occurred while attempting to GET all comments.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}

//keys = ['identityTypeCodes', 'penStatusCodes']
async function getPenRequestStatusCodes(req, res) {
  try{
    const token = getBackendToken(req);
    if(!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }
    const url = config.get('server:statusCodeURL');
    const statusCodes = await utils.getCodeTable(token,'penStatusCodes', url);

    return res.status(HttpStatus.OK).json(statusCodes);

  } catch (e) {
    logApiError(e, 'getPenRequestStatusCodes', 'Error occurred while attempting to GET pen request status codes.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}
async function getPenRequestById(req, res) {
  try{
    const token = getBackendToken(req, res);
    if(!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }
    return Promise.all([
      getData(token,config.get('server:penRequestURL') + '/' + req.params.id),
      utils.getCodeTable(token, 'identityTypeCodes', config.get('server:digitalIdIdentityTypeCodesURL')),
      utils.getCodeTable(token, 'penStatusCodes', config.get('server:statusCodeURL'))
    ])
      .then(async ([penRetrievalResponse, digitalIdIdentityTypeCodesResponse, statusCodesResponse]) => {
        const response = await getData(token,config.get('server:digitalIdURL') + '/' + penRetrievalResponse['digitalID']);
        if(!digitalIdIdentityTypeCodesResponse) {
          log.error('Failed to get digitalId identity type codes. Using code value instead of label.');
          penRetrievalResponse['dataSourceCode'] = response['identityTypeCode'];
        } else {
          let label = utils.getCodeLabel(digitalIdIdentityTypeCodesResponse, 'identityTypeCode', response['identityTypeCode']);
          if(label) {
            penRetrievalResponse['dataSourceCode'] = label;
          } else {
            log.error('Failed to get digitalId identity type codes. Using code value instead of label.');
            penRetrievalResponse['dataSourceCode'] = response['identityTypeCode'];
          }
        }
        if(!statusCodesResponse) {
          log.error('Failed to get pen request status codes.  Using code value instead of label.');
        } else {
          penRetrievalResponse['penRequestStatusCodeLabel'] = utils.getCodeLabel(statusCodesResponse, 'penRequestStatusCode', penRetrievalResponse['penRequestStatusCode']);
        }
        utils.saveSession(req, res, penRetrievalResponse);
        delete penRetrievalResponse['digitalID'];
        return res.status(200).json(penRetrievalResponse);
      })
      .catch(e => {
        logApiError(e, 'getPenRequestById', 'Error occurred while attempting to GET pen request.');
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'INTERNAL SERVER ERROR'
        });
      });
  } catch(e) {
    logApiError(e, 'getPenRequestById', 'Error occurred while attempting to GET pen request.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}

async function getStudentById(req, res) {
  const token = utils.getBackendToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }
  const id = req.params.id;
  return Promise.all([
    utils.getData(token, config.get('server:studentURL'), {params: {pen: id}}),
    utils.getCodeTable(token, 'genderCodes', config.get('server:studentGenderCodesURL'))
  ])
    .then(async ([dataResponse, genderCodesResponse]) => {
      if(Array.isArray(dataResponse) && dataResponse.length === 1) {
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
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'INTERNAL SERVER ERROR'
      });
    });
}

async function getStudentDemographicsById(req, res) {
  try{
    const token = utils.getBackendToken(req);
    const response = await getData(token,config.get('server:demographicsURL') + '/' + req.params.id);
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
  } catch(e) {
    logApiError(e, 'getPenRequestStatusCodes', 'Error occurred while attempting to GET pen demographics.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}

async function sendPenRequestEmail(req, token, emailType) {
  const lowerCaseEmail = emailType.toLowerCase();
  let emailBody = {emailAddress: req.body['email']};
  if (lowerCaseEmail === 'reject') {
    if (!req.body.failureReason) {
      throw new ServiceError('400', 'Failure reason is required.');
    }
    emailBody.rejectionReason = req.body.failureReason;
  } else if (lowerCaseEmail === 'complete') {
    if(!req['session'].studentDemographics || !req['session'].studentDemographics['studGiven']) {
      throw new ServiceError('500', 'There are no student demographics in session.');
    }
    emailBody.firstName = req['session'].studentDemographics['studGiven'];
  }
  try {
    await postData(token, config.get('server:penEmails') + '/' + lowerCaseEmail, emailBody);
  } catch(e) {
    logApiError(e, 'sendPenRequestEmail', 'Error calling email service.');
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, { message: 'API Post error'}, e);
  }
}

async function postPenRequestComment(req, res) {
  try{
    const token = utils.getBackendToken(req);
    const userToken = utils.getUser(req);

    //mapping from what comment widget needs to what the comments api needs
    const request = {
      penRetrievalRequestID: req.params.id,
      staffMemberIDIRGUID: userToken['preferred_username'].toUpperCase(),
      staffMemberName: userToken['idir_username'],
      commentContent: req.body.content,
      commentTimestamp: LocalDateTime.now().toString()
    };

    const penRetrievalResponse = await postData(token, config.get('server:penRequestURL') + '/' + req.params.id + '/comments', request);

    return res.status(200).json(penRetrievalResponse);
  } catch(e) {
    logApiError(e, 'postPenRequestComment', 'Error occurred while attempting to POST pen request comment.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}

async function putPenRequest(req, res) {
  try{
    const penRetrievalResponse = await updatePenRequest(req, res);
    return res.status(200).json(penRetrievalResponse);
  } catch(e) {
    logApiError(e, 'putPenRequest', 'Error occurred while attempting a PUT to pen request.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}

async function rejectPenRequest(req, res) {
  try {
    const token = getBackendToken(req, res);
    if(!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }
    req.body.statusUpdateDate = LocalDateTime.now();
    const penResponse = await updatePenRequest(req, res);
    try {
      await sendPenRequestEmail(req, token, 'REJECT');
      return res.status(200).json(penResponse);
    } catch(e) {
      logApiError(e, 'rejectPenRequest', 'Error occurred while attempting to call the email service.');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'INTERNAL SERVER ERROR calling email service'
      });
    }
  } catch(e) {
    logApiError(e, 'rejectPenRequest', 'Error occurred while attempting to PUT a pen request.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}

async function returnPenRequest(req, res) {
  try {
    const token = getBackendToken(req, res);
    if(!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }
    req.body.statusUpdateDate = LocalDateTime.now();
    const penResponse = await updatePenRequest(req, res);
    try {
      await sendPenRequestEmail(req, token, 'INFO');
      return res.status(200).json(penResponse);
    } catch(e) {
      logApiError(e, 'returnPenRequest', 'Error occurred while attempting to call the email service.');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'INTERNAL SERVER ERROR calling email service'
      });
    }
  } catch(e) {
    logApiError(e, 'returnPenRequest', 'Error occurred while attempting to PUT a pen request.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}

async function updatePenRequest(req, res) {
  let thisSession = req['session'];
  if (!thisSession.penRequest) {
    log.error('Error attempting to update pen request.  There is no pen request stored in session.');
    throw new ApiError();
  }
  try {
    const token = utils.getBackendToken(req);
    const penRequest = req.body;
    const dataSourceCode = req.body.dataSourceCode;
    delete penRequest.dataSourceCode;
    delete penRequest.penRequestStatusCodeLabel;


    penRequest.digitalID = thisSession.penRequest.digitalID;

    return Promise.all([
      putData(token, config.get('server:penRequestURL'), penRequest),
      utils.getCodeTable(token, 'penStatusCodes', config.get('server:statusCodeURL'))
    ])
      .then(async ([penRetrievalResponse, statusCodesResponse]) => {
        penRetrievalResponse.dataSourceCode = dataSourceCode;
        if(!statusCodesResponse) {
          log.error('Failed to get pen request status codes.  Using code value instead of label.');
          penRetrievalResponse.penRequestStatusCodeLabel = penRequest.penRequestStatusCode;
        } else {
          penRetrievalResponse['penRequestStatusCodeLabel'] = utils.getCodeLabel(statusCodesResponse, 'penRequestStatusCode', penRetrievalResponse['penRequestStatusCode']);
        }
        utils.saveSession(req, res, penRetrievalResponse);
        //dont return digitalid to frontend
        delete penRetrievalResponse['digitalID'];
        return penRetrievalResponse;
      })
      .catch(e =>{
        logApiError(e, 'updatePenRequest', 'Error updating a pen request.');
        const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
        throw new ApiError(status, { message: 'API PUT error'}, e);
      });
  } catch(e) {
    throw new ServiceError('updatePenRequest error', e);
  }
}

async function updateStudentAndDigitalId(req){
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
    email: req['session'].penRequest.email,
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
  }catch(e) {
    logApiError(e, 'updateStudentAndDigitalId', 'Failed to update student. Complete pen transaction will be out of sync. Student record still needs to be created.');
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, {message: 'API error'}, e);
  }
  if(!studentResponse) {
    log.error('Null response from student api. Complete pen transaction will be out of sync. StudentId in DigitalId record still needs to be updated.');
    throw new ApiError(500, {message: 'API error'});
  }
  try {
    const digitalIdResponse = await getData(token, config.get('server:digitalIdURL') + '/' + req['session'].penRequest.digitalID);
    if (digitalIdResponse) {
      let digitalIdBody = digitalIdResponse;
      digitalIdBody.studentID = studentResponse['studentID'];
      delete digitalIdBody['updateUser'];
      delete digitalIdBody['updateDate'];
      delete digitalIdBody['createDate'];

      return await putData(token, config.get('server:digitalIdURL'), digitalIdBody);
    }
  }catch(e) {
    logApiError(e, 'updateStudentAndDigitalId', 'Failed to update digitalid. Complete pen transaction will be out of sync. StudentId in DigitalId record still needs to be updated.');
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, {message: 'API error'}, e);
  }


}

async function findPenRequestsByPen(req, res){
  try {
    const token = utils.getBackendToken(req);
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }
    const url = `${config.get('server:penRequestURL')}/?pen=${req.query.pen}`;
    const response = await getData(token, url);
    return res.status(200).json(response.data);
  }catch (e) {
    logApiError(e, 'findPenRequestsByPen', 'Failed to get pen requests for the given pen.');
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, {message: 'API error'}, e);
  }
}

module.exports = {
  completePenRequest,
  getAllPenRequests,
  getPenRequestCommentById,
  getPenRequestStatusCodes,
  getPenRequestById,
  getStudentById,
  getStudentDemographicsById,
  postPenRequestComment,
  putPenRequest,
  rejectPenRequest,
  returnPenRequest,
  findPenRequestsByPen
};
