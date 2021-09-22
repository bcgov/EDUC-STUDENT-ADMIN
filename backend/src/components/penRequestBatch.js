'use strict';
const config = require('../config/index');
const {
  logApiError, postData, getBackendToken, getData, putData, errorResponse,
  getPaginatedListForSCGroups, getUser, stripAuditColumns, logDebug, addSagaStatusToRecords
} = require('./utils');
const HttpStatus = require('http-status-codes');
const redisUtil = require('../util/redis/redis-utils');
const log = require('./logger');
const SAGAS = require('./saga');
const lodash = require('lodash');
const { PEN_REQ_BATCH_STATUS_CODES } = require('../util/constants');



async function getPENBatchRequestStats(req, res) {
  try{
    const response = await getData(getBackendToken(req), config.get('server:penRequestBatch:rootURL')+'/pen-request-batch/stats');
    let formattedResponse = {};
    formattedResponse['ERROR'] = {
      loadFailed: response.loadFailCount
    };
    response.penRequestBatchStatList.forEach((item) => {
      formattedResponse[item.schoolGroupCode] = {
        pending: item.pendingCount,
        fixable: item.fixableCount,
        repeats: item.repeatCount,
        unarchived: item.unarchivedCount,
        heldForReviewCount: item.heldForReviewCount
      };
    });
    return res.status(200).json(formattedResponse);
  }catch (e) {
    logApiError(e, 'getPENBatchRequestStats', 'Error occurred while attempting to GET number of pen batch requests.');
    return errorResponse(res);
  }
}

async function updatePrbStudentInfoRequested(req, res) {
  const token = getBackendToken(req, res);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }

  try {
    const url = `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/${req.params.id}/student/${req.params.studentId}`;
    let studentData = await getData(token, url);

    const studentReq = {
      ...studentData,
      infoRequest: req.body.infoRequest,
      penRequestBatchStudentStatusCode: req.body.penRequestBatchStudentStatusCode
    };

    const studentRes = await putData(token, url, studentReq, getUser(req).idir_username);
    return res.status(200).json(studentRes);
  } catch (e) {
    logApiError(e, 'updateStudentInfoRequested', 'Error updating a PrbStudent.');
    return errorResponse(res);
  }
}

async function getPenRequestBatchStudentIDs(req, res) {
  try {
    const params = {
      params: {
        penRequestBatchIDs: req.query.penRequestBatchIDs,
        penRequestBatchStudentStatusCodes: req.query.penRequestBatchStudentStatusCodes,
        searchCriteria: req.query.searchCriteria
      }
    };

    const dataResponse = await getData(getBackendToken(req), `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/pen-request-batch-ids`, params);
    return res.status(200).json(dataResponse);

  } catch (e) {
    logApiError(e, 'getPaginatedListForSCGroups', 'Error occurred while attempting to get prb student IDs.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}

async function getPenRequestBatchStudentById(req, res) {
  const token = getBackendToken(req, res);
  try {
    const url = `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/${req.params.id}/student/${req.params.studentId}`;
    let studentData = await getData(token, url);
    studentData.repeatRequestOriginalStatus = studentData.penRequestBatchStudentStatusCode;
    await addPenRequestBatchStudentSagaStatus([studentData]);
    return res.status(200).json(studentData);
  } catch (e) {
    logApiError(e, 'getPenRequestBatchStudentById', 'Error getting a PrbStudent.');
    return errorResponse(res);
  }
}

async function getPenRequestBatchStudentMatchOutcome(req, res) {
  const token = getBackendToken(req, res);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }

  try {
    const url = `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/${req.query.id}/student/${req.query.studentId}/possible-match`;
    let matchData = await getData(token, url);

    return Promise.all(matchData.map(async (match) => {
      const studentUrl = `${config.get('server:student:rootURL')}/${match.matchedStudentId}`;
      return await getData(token, studentUrl);
    })).then((response) => {
      return res.status(200).json(response);
    }).catch(e => {
      logApiError(e, 'getPenRequestBatchStudentMatchOutcome', 'Error occurred while attempting to GET student records.');
      return errorResponse(res);
    });
  } catch (e) {
    logApiError(e, 'getPenRequestBatchStudentMatchOutcome', 'Error getting pen request student possible matches.');
    return errorResponse(res);
  }
}

async function issueNewPen(req, res) {
  const token = getBackendToken(req, res);

  try {
    let studentData = req.body.prbStudent;

    studentData.mincode = studentData.mincode?.replace(/ /g,'');
    studentData.postalCode = studentData.postalCode?.replace(/ /g,'');
    studentData.dob = studentData.dob?.replace(/\//g,'');

    const sagaReq = {
      ...stripAuditColumns(studentData),
      mincode: studentData.mincode,
      matchedStudentIDList: req.body.matchedStudentIDList
    };

    const sagaId = await postData(token, `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch-saga/new-pen`, sagaReq, null, getUser(req).idir_username);

    await createPenRequestBatchSagaRecordInRedis(sagaId, 'PEN_REQUEST_BATCH_NEW_PEN_PROCESSING_SAGA', 'issueNewPen', studentData.penRequestBatchStudentID, studentData.penRequestBatchID);

    return res.status(200).json(sagaId);
  } catch (e) {
    logApiError(e, 'issueNewPen', 'Error issuing new pen.');
    if (e.status === HttpStatus.CONFLICT) {
      return errorResponse(res, 'Another saga in progress', HttpStatus.CONFLICT);
    }
    return errorResponse(res);
  }
}

/**
 * This method will do the following.
 *   <pre>
 *     1. First get the PRB Student and only update required fields
 *     2. call pen match api to get student matches and only add matches which are not already existing, to avoid creation of duplicate possible matches.
 *     3. call PRB Saga API to initiate the saga process
 *     4. Add saga record to redis and return success if API call is success, return error otherwise.
 *   </pre>
 * @param req the request
 * @param res the response
 * @returns {Promise<*>}
 */
async function userMatchSaga(req, res) {
  const token = getBackendToken(req, res);
  try {
    if (!req.body.matchedPEN || req.body.matchedPEN.length !== 9) {
      return res.status(400).json({'message': 'Matching student PEN is mandatory and should be exactly 9 digits in this flow.'});
    }
    const possibleMatchUrl = `${config.get('server:penMatch:possibleMatch')}/${req.body.studentID}`;
    const possibleMatches = await getData(token, possibleMatchUrl);
    const studentData = stripAuditColumns(req.body.prbStudent);
    studentData.assignedPEN = req.body.matchedPEN;
    studentData.studentID = req.body.studentID;
    const possibleMatchIds = filterPossibleMatchIds(possibleMatches, req.body.matchedStudentIDList);
    logDebug('possible match ids after filter ::', possibleMatchIds);
    const sagaReq = {
      ...studentData,
      mincode: studentData.mincode,
      studentID: req.body.studentID,
      matchedStudentIDList: possibleMatchIds
    };

    const sagaId = await postData(token, `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch-saga/user-match`, sagaReq, null, getUser(req).idir_username);

    await createPenRequestBatchSagaRecordInRedis(sagaId, 'PEN_REQUEST_BATCH_USER_MATCH_PROCESSING_SAGA', 'user match', studentData.penRequestBatchStudentID, studentData.penRequestBatchID);

    return res.status(200).json(sagaId);
  } catch (e) {
    logApiError(e, 'userMatchSaga', 'Error user matching pen request to an existing student.');
    if (e.status === HttpStatus.CONFLICT) {
      return errorResponse(res, 'Another saga in progress', HttpStatus.CONFLICT);
    }
    return errorResponse(res);
  }
}

/**
 * This function will remove the duplicates and will return only those student ids which are not already matched to the student.
 * @param studentPossibleMatchResponse the response from match api containing all the matches for the student.
 * @param studentPossibleMatchIds the possible match ids which needs to be added for the student.
 */
function filterPossibleMatchIds(studentPossibleMatchResponse, studentPossibleMatchIds) {
  logDebug('studentPossibleMatchResponse ::', studentPossibleMatchResponse);
  logDebug('studentPossibleMatchIds ::', studentPossibleMatchIds);
  if (studentPossibleMatchResponse?.length > 0) {
    const possibleMatchIdsFromMatchAPI = lodash.map(studentPossibleMatchResponse, 'matchedStudentID');
    return lodash.pullAll(studentPossibleMatchIds, possibleMatchIdsFromMatchAPI);
  }
  return studentPossibleMatchIds;
}

/**
 * This method will do the following.
 *   <pre>
 *     1. First get the PRB Student and only update required fields
 *     2. call match api to get student possible matches to delete.
 *     3. call PRB Saga API to initiate the saga process
 *     4. Add saga record to redis and return success if API call is success, return error otherwise.
 *   </pre>
 * @param req the request
 * @param res the response
 * @returns {Promise<*>}
 */
async function userUnmatchSaga(req, res) {
  const token = getBackendToken(req, res);
  try {
    const possibleMatchUrl = `${config.get('server:penMatch:possibleMatch')}/${req.body.studentID}`;
    const prbStudentUrl = `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/${req.params.id}/student/${req.params.studentId}`;
    const results = await Promise.all([getData(token, possibleMatchUrl), getData(token, prbStudentUrl)]);
    const studentData = stripAuditColumns(results[1]);
    const possibleMatchIds = lodash.compact(req.body.matchedStudentIDList.map(matchedStudentID =>
      lodash.find(results[0], ['matchedStudentID', matchedStudentID])?.matchedStudentID
    ));
    logDebug('possible match ids after filter ::', possibleMatchIds);
    const sagaReq = {
      ...studentData,
      studentID: req.body.studentID,
      matchedStudentIDList: possibleMatchIds
    };

    const sagaId = await postData(token, `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch-saga/user-unmatch`, sagaReq, null, getUser(req).idir_username);

    await createPenRequestBatchSagaRecordInRedis(sagaId, 'PEN_REQUEST_BATCH_USER_UNMATCH_PROCESSING_SAGA', 'user unmatch', studentData.penRequestBatchStudentID, studentData.penRequestBatchID);

    return res.status(200).json(sagaId);
  } catch (e) {
    logApiError(e, 'userMatchSaga', 'Error user unmatching pen request to an existing student.');
    if (e.status === HttpStatus.CONFLICT) {
      return errorResponse(res, 'Another saga in progress', HttpStatus.CONFLICT);
    }
    return errorResponse(res);
  }
}

function createPenRequestBatchSagaRecordInRedis(sagaId, sagaName, operation, penRequestBatchStudentID, penRequestBatchID) {
  const event = {
    sagaId,
    penRequestBatchID,
    penRequestBatchStudentID,
    sagaStatus: 'INITIATED',
    sagaName
  };
  log.info(`going to store event object in redis for ${operation} request :: `, event);
  return redisUtil.createSagaRecord(event, SAGAS.PEN_REQUEST_BATCH.sagaEventRedisKey);
}

function getPenRequestBatchSagaEvents() {
  return redisUtil.getSagaEventsByRedisKey(SAGAS.PEN_REQUEST_BATCH.sagaEventRedisKey);
}

function addPenRequestBatchStudentSagaStatus(prbStudents) {
  return addSagaStatusToRecords(prbStudents, 'penRequestBatchStudentID', getPenRequestBatchSagaEvents);
}

function addPenRequestBatchSagaStatus(batchFiles) {
  return addSagaStatusToRecords(batchFiles, 'penRequestBatchID', getPenRequestBatchSagaEvents);
}

async function updateFilesByIDs(req, res, updateFile) {
  const token = getBackendToken(req, res);

  try {
    const params = {
      params: {
        pageNumber: 0,
        pageSize: req.body.penRequestBatchIDs?.length,
        searchCriteriaList: JSON.stringify([{
          searchCriteriaList:[{
            key: 'penRequestBatchID',
            operation: 'in',
            value: req.body.penRequestBatchIDs?.join(','),
            valueType: 'UUID'
          }]
        }])
      }
    };

    const dataResponse = await getData(token, `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/paginated`, params);
    const promises = dataResponse.content.map(batchFile => {
      updateFile(batchFile);
      return putData(token, `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/${batchFile.penRequestBatchID}`, batchFile, getUser(req).idir_username);
    });

    const results = await Promise.allSettled(promises);
    const resultGroups = lodash.groupBy(results, 'status');

    resultGroups.rejected?.forEach(result => {
      log.error(result);
    });
    return res.status(200).json(resultGroups.fulfilled?.map(result => result.value) || []);
  } catch (e) {
    logApiError(e, 'updateFilesByIDs', 'Error upating batch files.');
    if (e.status === HttpStatus.CONFLICT) {
      return errorResponse(res, 'Another saga in progress', HttpStatus.CONFLICT);
    }
    return errorResponse(res);
  }
}

async function archiveFiles(req, res) {
  if(req.body.penRequestBatchIDs?.length) {
    const token = getBackendToken(req, res);
    const body = lodash.map(req.body.penRequestBatchIDs, function(item) {
      return { penRequestBatchID: item };
    });
    try{
      const data = await postData(token, `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/archive`, body, null, getUser(req).idir_username);
      return res.status(200).json(data);
    }catch (e){
      if (e.status === HttpStatus.CONFLICT) {
        return errorResponse(res, 'Another saga in progress', HttpStatus.CONFLICT);
      }else if(e.status === HttpStatus.BAD_REQUEST){
        return errorResponse(res, e.data?.message, HttpStatus.BAD_REQUEST);
      }
      return errorResponse(res);
    }
  } else {
    logDebug('No pen request batch ids provided to archiveFiles. Doing nothing.');
    return res.status(200).json();
  }
}

async function archiveAndReturnFiles(req, res) {
  if(req.body.penRequestBatchIDs?.length) {
    const token = getBackendToken(req, res);
    try {
      const sagaReq = {
        penRequestBatchArchiveAndReturnSagaData: req.body.penRequestBatchIDs
      };
      let sagaIds = await postData(token, `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch-saga/archive-and-return`, sagaReq, null, getUser(req).idir_username);
      sagaIds.forEach(async (sagaId) => {
        await createPenRequestBatchSagaRecordInRedis(sagaId.sagaId, 'PEN_REQUEST_BATCH_ARCHIVE_AND_RETURN_TOPIC', 'archiveAndReturn', null, sagaId.penRequestBatchID);
      });
      return res.status(200).json(sagaIds);
    } catch (e) {
      logApiError(e, 'archiveAndReturnFiles', 'Error calling archive and return saga.');
      if (e.status === HttpStatus.CONFLICT) {
        return errorResponse(res, 'Another saga in progress', HttpStatus.CONFLICT);
      }else if(e.status === HttpStatus.BAD_REQUEST){
        return errorResponse(res, e.data?.message, HttpStatus.BAD_REQUEST);
      }
      return errorResponse(res);
    }
  } else {
    logDebug('No pen request batch ids provided to archiveAndReturnFiles. Doing nothing.');
    return res.status(200).json();
  }
}

function unarchiveFiles(req, res) {
  return updateFilesByIDs(req, res, batchFile => {
    batchFile.penRequestBatchStatusCode = PEN_REQ_BATCH_STATUS_CODES.UNARCHIVED;
    return batchFile;
  });
}

function softDeleteFiles(req, res) {
  return updateFilesByIDs(req, res, batchFile => {
    batchFile.penRequestBatchStatusCode = PEN_REQ_BATCH_STATUS_CODES.DELETED;
    return batchFile;
  });
}
function releaseBatchFilesForFurtherProcessing(req, res){
  return updateFilesByIDs(req, res, batchFile => {
    batchFile.penRequestBatchStatusCode = PEN_REQ_BATCH_STATUS_CODES.LOADED; // batch api will process further, when it is updated to LOADED status
    return batchFile;
  });
}


async function repostReports(req, res) {
  const token = getBackendToken(req, res);
  try {
    const sagaReq = req.body;
    const sagaId = await postData(token, `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch-saga/repost-reports`, sagaReq, null, getUser(req).idir_username);
    await createPenRequestBatchSagaRecordInRedis(sagaId, 'PEN_REQUEST_BATCH_REPOST_REPORTS_SAGA', 'repostReports', null, req.body.penRequestBatchID);
    return res.status(200).json(sagaId);
  } catch (e) {
    logApiError(e, 'repostReports', 'Error calling repost reports saga.');
    if (e.status === HttpStatus.CONFLICT) {
      return errorResponse(res, 'Another saga in progress', HttpStatus.CONFLICT);
    }
    return errorResponse(res);
  }
}

const findValidationIssuesByPrbStudentID = async (req, res) =>{
  const token = getBackendToken(req, res);
  try {
    const prbStudentID = req.params.id;
    const validationIssues = await getData(token, `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/students/${prbStudentID}/validation-issues`);
    return res.status(200).json(validationIssues);
  } catch (e) {
    logApiError(e, 'findValidationIssuesByPrbStudentID', 'Error calling findValidationIssuesByPrbStudentID.');
    return errorResponse(res);
  }
};

module.exports = {
  getPENBatchRequestStats,
  updatePrbStudentInfoRequested,
  getPenRequestFiles: getPaginatedListForSCGroups('getPenRequestFiles', `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/paginated`, addPenRequestBatchSagaStatus),
  getPenRequestBatchStudents: getPaginatedListForSCGroups('getPenRequestBatchStudents', `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/student/paginated`, addPenRequestBatchStudentSagaStatus),
  getPenRequestBatchStudentIDs,
  getPenRequestBatchStudentById,
  getPenRequestBatchStudentMatchOutcome,
  issueNewPen,
  userMatchSaga,
  userUnmatchSaga,
  archiveFiles,
  archiveAndReturnFiles,
  unarchiveFiles,
  softDeleteFiles,
  releaseBatchFilesForFurtherProcessing,
  repostReports,
  findValidationIssuesByPrbStudentID
};
