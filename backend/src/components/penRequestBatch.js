'use strict';
const { logApiError } = require('./utils');
const config = require('../config/index');
const { getBackendToken, getData, putData, errorResponse, getPaginatedListForSCGroups } = require('./utils');
const {FILTER_OPERATION, CONDITION, VALUE_TYPE} = require('../util/constants');

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
  if(!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }

  try {
    const url = `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/${req.params.id}/student/${req.params.studentId}`;
    let studentData = await getData(token, url);

    const studentReq = {
      ... studentData,
      infoRequest: req.body.infoRequest,
      penRequestBatchStudentStatusCode: req.body.penRequestBatchStudentStatusCode
    };

    const studentRes = await putData(token, url, studentReq);
    return res.status(200).json(studentRes);
  } catch(e) {
    logApiError(e, 'updateStudentInfoRequested', 'Error updating a PrbStudent.');
    return errorResponse(res);
  }
}

module.exports = {
  getPENBatchRequestStats,
  updatePrbStudentInfoRequested,
  getPenRequestFiles: getPaginatedListForSCGroups('getPenRequestFiles', `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/paginated`),
  getPenRequestBatchStudents: getPaginatedListForSCGroups('getPenRequestBatchStudents', `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch/student/paginated`),
};
