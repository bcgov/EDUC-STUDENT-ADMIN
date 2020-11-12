'use strict';
const config = require('../config/index');
const {
  logApiError, postData, getBackendToken, getData, putData, errorResponse,
  getPaginatedListForSCGroups, getUser, stripAuditColumns, logDebug
} = require('./utils');
const {FILTER_OPERATION, CONDITION, VALUE_TYPE} = require('../util/constants');
const HttpStatus = require('http-status-codes');
const redisUtil = require('../util/redis/redis-utils');
const log = require('./logger');
const lodash = require('lodash');

async function getPENBatchRequestStats(req, res) {
  const schoolGroupCodes = [
    {
      schoolGroupCode: 'K12'
    },
    {
      schoolGroupCode: 'PSI'
    }
  ];
  let promises = [];
  schoolGroupCodes.forEach((schoolGroupCode) => {
    const search = [
      {
        searchCriteriaList: [
          {
            key: 'schoolGroupCode',
            operation: FILTER_OPERATION.EQUAL,
            value: schoolGroupCode.schoolGroupCode,
            valueType: VALUE_TYPE.STRING
          },
          {
            condition: CONDITION.AND,
            key: 'penRequestBatchStatusCode',
            operation: FILTER_OPERATION.IN,
            value: 'ACTIVE,UNARCHIVED',
            valueType: VALUE_TYPE.STRING
          }
        ]
      }
    ];
    promises.push(
      getData(getBackendToken(req), config.get('server:penRequestBatch:paginated'), {
        params: {
          pageSize: config.get('server:penRequestBatch:maxPaginatedElements'),
          searchCriteriaList: JSON.stringify(search)
        }
      }),
    );
  });
  return Promise.all(promises).then((response) => {
    let formattedResponse = {};
    schoolGroupCodes.forEach((schoolGroupCode, index) => {
      formattedResponse[schoolGroupCode.schoolGroupCode] = {
        pending: response[index].totalElements,
        fixable: response[index].content.reduce((a, b) => +a + (+b['fixableCount'] || 0), 0),
        repeats: response[index].content.reduce((a, b) => +a + (+b['repeatCount'] || 0), 0),
        unarchived: response[index].content.filter((obj) => obj.penRequestBatchStatusCode === 'UNARCHIVED').length
      };
    });
    return res.status(200).json(formattedResponse);
  }).catch(e => {
    logApiError(e, 'getPENBatchRequestStats', 'Error occurred while attempting to GET number of pen batch requests.');
    return errorResponse(res);
  });
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

async function getPenRequestBatchStudentById(req, res) {
  const token = getBackendToken(req, res);
  try {
    const url = `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/${req.params.id}/student/${req.params.studentId}`;
    let studentData = await getData(token, url);
    studentData.repeatRequestOriginalStatus = studentData.penRequestBatchStudentStatusCode;
    await addSagaStatus([studentData]);
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
    const url = `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/${req.params.id}/student/${req.params.studentId}`;
    let studentData = await getData(token, url);


    const sagaReq = {
      ...stripAuditColumns(studentData),
      mincode: studentData.minCode,
      twinStudentIDs: req.body.twinStudentIDs
    };

    const sagaId = await postData(token, `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch-saga/new-pen`, sagaReq, null, getUser(req).idir_username);

    const event = {
      sagaId: sagaId,
      penRequestBatchStudentID: studentData.penRequestBatchStudentID,
      sagaStatus: 'INITIATED',
      sagaName: 'PEN_REQUEST_BATCH_NEW_PEN_PROCESSING_SAGA'
    };
    log.info('going to store event object in redis for issueNewPen request :: ', event);
    await redisUtil.createPenRequestBatchSagaRecordInRedis(event);

    return res.status(200).json(sagaId);
  } catch (e) {
    logApiError(e, 'issueNewPen', 'Error issuing new pen.');
    return errorResponse(res);
  }
}

/**
 * This method will do the following.
 *   <pre>
 *     1. First get the PRB Student and only update required fields
 *     2. call student api to get student twins and only add twins which is not already existing, to avoid creation of duplicate twins.
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
    const studentTwinUrl = `${config.get('server:student:rootURL')}/${req.body.studentID}/twins`;
    const prbStudentUrl = `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/${req.params.id}/student/${req.params.studentId}`;
    const results = await Promise.all([getData(token, studentTwinUrl), getData(token, prbStudentUrl)]);
    const studentData = stripAuditColumns(results[1]);
    studentData.assignedPEN = req.body.matchedPEN;
    studentData.studentID = req.body.studentID;
    const studentTwinIds = filterStudentTwinIds(results[0], req.body.twinStudentIDs);
    logDebug('student twin ids after filter ::', studentTwinIds);
    const sagaReq = {
      ...studentData,
      mincode: studentData.minCode,
      twinStudentIDs: studentTwinIds
    };

    const sagaId = await postData(token, `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch-saga/user-match`, sagaReq, null, getUser(req).idir_username);

    const event = {
      sagaId: sagaId,
      penRequestBatchStudentID: studentData.penRequestBatchStudentID,
      sagaStatus: 'INITIATED',
      sagaName: 'PEN_REQUEST_BATCH_USER_MATCH_PROCESSING_SAGA'
    };
    log.info('going to store event object in redis for user match request :: ', event);
    await redisUtil.createPenRequestBatchSagaRecordInRedis(event);

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
 * This function will remove the duplicates and will return only those student ids which are not already twinned to the student.
 * @param studentTwinResponse the response from student api containing all the twins for the student.
 * @param studentTwinIds the twinIds which needs to be added for the student.
 */
function filterStudentTwinIds(studentTwinResponse, studentTwinIds) {
  logDebug('studentTwinResponse ::', studentTwinResponse);
  logDebug('studentTwinIds ::', studentTwinIds);
  if (studentTwinResponse?.length > 0) {
    const twinStudentIDsFromStudentAPI = lodash.map(studentTwinResponse, 'twinStudentID');
    return lodash.difference(twinStudentIDsFromStudentAPI, studentTwinIds);
  }
  return studentTwinIds;
}

async function addSagaStatus(prbStudents) {
  let eventsArrayFromRedis = await redisUtil.getPenRequestBatchSagaEvents() || [];
  eventsArrayFromRedis = eventsArrayFromRedis.map(event => JSON.parse(event));
  prbStudents && prbStudents.forEach(prbStudent => {
    if (prbStudent.penRequestBatchStudentID) {
      const prbSagaInProgress = eventsArrayFromRedis.filter(event =>
        event.penRequestBatchStudentID === prbStudent.penRequestBatchStudentID);
      if(prbSagaInProgress && prbSagaInProgress.length > 0){
        prbStudent.sagaInProgress = true;
        prbStudent.sagaName = prbSagaInProgress[0].sagaName;
      }else {
        prbStudent.sagaInProgress = false;
      }
    }
  });
}

module.exports = {
  getPENBatchRequestStats,
  updatePrbStudentInfoRequested,
  getPenRequestFiles: getPaginatedListForSCGroups('getPenRequestFiles', `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/paginated`),
  getPenRequestBatchStudents: getPaginatedListForSCGroups('getPenRequestBatchStudents', `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/student/paginated`, addSagaStatus),
  getPenRequestBatchStudentById,
  getPenRequestBatchStudentMatchOutcome,
  issueNewPen,
  userMatchSaga
};
