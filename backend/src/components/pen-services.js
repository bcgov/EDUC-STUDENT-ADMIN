'use strict';
const {logApiError} = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const redisUtil = require('../util/redis/redis-utils');
const log = require('./logger');
const {getBackendToken, getData, postData, stripAuditColumns, getUser, errorResponse} = require('./utils');
const {v4: uuidv4} = require('uuid');

async function validateStudentDemogData(req, res) {
  try {
    const token = getBackendToken(req);
    const student = req.body.student;
    student.isInteractive = true;
    student.transactionID = uuidv4();
    const dataResponse = await postData(token, config.get('server:penServices:validateDemographicsURL'), student, null);
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
    const token = getBackendToken(req);
    const studentID = req.params.id;
    const result = await getData(token, config.get('server:penServices:rootURL') + '/' + studentID + '/merges', {params: {mergeDirection: req.query.mergeDirection}});
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
  const token = getBackendToken(req, res);

  try {
    let mergeData = req.body;

    mergeData.mincode = mergeData.mincode?.replace(/ /g,'');
    mergeData.postalCode = mergeData.postalCode?.replace(/ /g,'');
    mergeData.dob = mergeData.dob?.replace(/-/g,'');

    const sagaReq = {
      ...stripAuditColumns(mergeData),
      historyActivityCode: 'MERGE'
    };

    const sagaId = await postData(token, `${config.get('server:penServices:mergeStudentsURL')}`, sagaReq, null, getUser(req).idir_username);

    await createStudentMergeCompleteSagaRecordInRedis(sagaId, 'STUDENT_MERGE_COMPLETE_SAGA', 'mergeStudents', mergeData.studentID);

    return res.status(200).json(sagaId);
  } catch (e) {
    logApiError(e, 'mergeStudents', 'Error merging students.');
    return errorResponse(res);
  }
}

function createStudentMergeCompleteSagaRecordInRedis(sagaId, sagaName, operation, studentID) {
  const event = {
    sagaId,
    studentID,
    sagaStatus: 'INITIATED',
    sagaName
  };
  log.info(`going to store event object in redis for ${operation} request :: `, event);
  return redisUtil.createSagaRecordInRedis(event);
}

module.exports = {
  validateStudentDemogData,
  getMergeByStudentIDAndMergeDirection,
  mergeStudents
};
