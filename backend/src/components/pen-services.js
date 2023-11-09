'use strict';
const {logApiError} = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const redisUtil = require('../util/redis/redis-utils');
const log = require('./logger');
const {getData, postData, stripAuditColumns, getUser, errorResponse} = require('./utils');
const {v4: uuidv4} = require('uuid');
const SAGAS = require('./saga');

async function validateStudentDemogData(req, res) {
  try {
    const student = req.body.student;
    Object.keys(student).forEach(key => {
      student[key] = student[key] || ''; // send empty string than null or undefined.
    });
    student.isInteractive = true;
    student.transactionID = uuidv4();
    const dataResponse = await postData(config.get('server:penServices:validateDemographicsURL'), student, null);
    return res.status(200).json(dataResponse);

  } catch (e) {
    logApiError(e, 'validateStudentDemogData', 'Error occurred while attempting to call pen validation services api.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}

async function getMergeByStudentIDAndMergeDirection(req, res) {
  try {
    const studentID = req.params.id;
    const result = await getData(config.get('server:penServices:rootURL') + '/' + studentID + '/merges', {params: {mergeDirection: req.query.mergeDirection}});
    if (result && result.length > 0) {
      return res.status(200).json(result);
    } else {
      return res.status(200).json([]);
    }
  } catch (e) {
    logApiError(e, 'getMergeByStudentIDAndMergeDirection', 'Error occurred while attempting to GET merge.');
    return errorResponse(res);
  }
}

async function mergeStudents(req, res) {
  try {
    let mergeData = req.body;
    mergeData.mincode = mergeData.mincode?.replace(/ /g,'');
    mergeData.postalCode = mergeData.postalCode?.replace(/ /g,'');
    mergeData.dob = mergeData.dob?.replace(/\//g,'-');

    const sagaReq = {
      ...stripAuditColumns(mergeData),
      historyActivityCode: 'MERGE',
      createUser: getUser(req).idir_username,
    };

    const sagaId = await postData(`${config.get('server:penServices:mergeStudentsURL')}`, sagaReq, null, getUser(req).idir_username);

    await createPenServicesCompleteSagaRecordInRedis(sagaId, 'PEN_SERVICES_STUDENT_MERGE_COMPLETE_SAGA', 'merge students', mergeData.studentID);

    return res.status(200).json(sagaId);
  } catch (e) {
    logApiError(e, 'mergeStudents', 'Error occurred while attempting to merge students.');
    if (e.status === HttpStatus.CONFLICT) {
      return errorResponse(res, 'Another saga in progress', HttpStatus.CONFLICT);
    }
    return errorResponse(res);
  }
}

async function demergeStudents(req, res) {
  try {
    let demergeData = req.body;

    const sagaReq = {
      ...demergeData,
      historyActivityCode: 'DEMERGE',
      createUser: getUser(req).idir_username,
    };

    const sagaId = await postData(`${config.get('server:penServices:demergeStudentsURL')}`, sagaReq, null, getUser(req).idir_username);

    await createPenServicesCompleteSagaRecordInRedis(sagaId, 'PEN_SERVICES_STUDENT_DEMERGE_COMPLETE_SAGA', 'demerge students', demergeData.mergedFromStudentID);

    return res.status(200).json(sagaId);
  } catch (e) {
    logApiError(e, 'demergeStudents', 'Error occurred while attempting to demerge students.');
    if (e.status === HttpStatus.CONFLICT) {
      return errorResponse(res, 'Another saga in progress', HttpStatus.CONFLICT);
    }
    return errorResponse(res);
  }
}

async function splitPen(req, res) {
  try {
    let reqData = req.body;

    const sagaReq = {
      ...stripAuditColumns(reqData),
    };

    const sagaId = await postData(`${config.get('server:penServices:rootURL')}/split-pen-saga`, sagaReq, null, getUser(req).idir_username);

    await createPenServicesCompleteSagaRecordInRedis(sagaId, 'PEN_SERVICES_SPLIT_PEN_SAGA', 'split pen', reqData.studentID);

    return res.status(200).json(sagaId);
  } catch (e) {
    logApiError(e, 'splitPen', 'Error occurred while attempting to split pen.');
    if (e.status === HttpStatus.CONFLICT) {
      return errorResponse(res, 'Another saga in progress', HttpStatus.CONFLICT);
    }
    return errorResponse(res);
  }
}

async function moveSldRecords(req, res) {
  try {
    let reqData = req.body;

    const sagaReq = {
      ...stripAuditColumns(reqData),
    };

    const sagaId = await postData(`${config.get('server:penServices:rootURL')}/move-sld-saga`, sagaReq, null, getUser(req).idir_username);
    await createPenServicesCompleteSagaRecordInRedis(sagaId, 'PEN_SERVICES_MOVE_SLD_SAGA', 'move SLD records', reqData.studentID);
    
    return res.status(200).json(sagaId);
  } catch (e) {
    logApiError(e, 'moveSldRecords', 'Error occurred while attempting to merge SLD records.');
    if (e.status === HttpStatus.CONFLICT) {
      return errorResponse(res, 'Another saga in progress', HttpStatus.CONFLICT);
    }
    return errorResponse(res);
  }
}

function createPenServicesCompleteSagaRecordInRedis(sagaId, sagaName, operation, studentID) {
  const event = {
    sagaId,
    studentID,
    sagaStatus: 'INITIATED',
    sagaName
  };
  log.info(`going to store event object in redis for ${operation} request :: `, event);
  return redisUtil.createSagaRecord(event, SAGAS.PEN_SERVICES.sagaEventRedisKey);
}

module.exports = {
  validateStudentDemogData,
  getMergeByStudentIDAndMergeDirection,
  mergeStudents,
  demergeStudents,
  splitPen,
  moveSldRecords,
};

