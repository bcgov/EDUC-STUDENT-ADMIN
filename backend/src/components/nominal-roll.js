'use strict';

const {errorResponse, logApiError, getUser} = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const {postData, getData, putData} = require('./utils');
const utils = require('./utils');
const {LocalDate, LocalDateTime} = require('@js-joda/core');
const redisUtil = require('../util/redis/redis-utils');
const SAGAS = require('./saga');
const log = require('./logger');

const postNominalRollFile = async (req, res) => {
  try {
    const document = {
      fileExtension: req.body.fileExtension.replace('.', ''),
      fileContents: req.body.documentData
    };
    const params = {
      headers: {
        correlationID: req.session.correlationID,
      }
    };
    const result = await postData(config.get('server:nominalRoll:rootURL'), document, params, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    return errorResponse(res, e.data?.message, e.status);
  }
};
const isBeingProcessed = async (req, res) => {
  try {
    const params = {
      headers: {
        correlationID: req.session.correlationID,
      },
      params: {
        processingYear: LocalDate.now().year()
      }
    };
    const result = await getData(config.get('server:nominalRoll:rootURL'), params);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    return errorResponse(res, e.data?.message, e.status);
  }
};
const startProcessing = async (req, res) => {
  try {
    const params = {
      headers: {
        correlationID: req.session.correlationID,
      }
    };
    const userName = utils.getUser(req).idir_username;
    const body = req.body.nominalRollStudents.map(el => {
      el.processingYear = LocalDate.now().year();
      el.createUser = userName;
      el.updateUser = userName;
      el.createDate = LocalDateTime.now().toJSON();
      el.updateDate = LocalDateTime.now().toJSON();
      return el;
    });
    await postData(config.get('server:nominalRoll:rootURL') + '/process', body, params, utils.getUser(req).idir_username);
    return res.status(HttpStatus.ACCEPTED).json();
  } catch (e) {
    return errorResponse(res, e.data?.message, e.status);
  }
};

async function getNominalRollStudentById(req, res) {
  try {
    const params = {
      headers: {
        correlationID: req.session.correlationID,
      },
    };
    const url = `${config.get('server:nominalRoll:rootURL')}/${req.params.id}`;
    const result = await getData(url, params);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'getNominalRollStudentById', 'Error getting a NominalRollStudent.');
    return errorResponse(res);
  }
}

async function validateNominalRollStudentDemogData(req, res) {
  try {
    const params = {
      headers: {
        correlationID: req.session.correlationID,
      }
    };
    const url = `${config.get('server:nominalRoll:rootURL')}/validate`;
    const result = await postData(url, req.body, params, utils.getUser(req).idir_username);
    return res.status(200).json(result);
  } catch (e) {
    logApiError(e, 'validateNominalRollStudentDemogData', 'Error occurred while attempting to call nominal roll api.');
    return errorResponse(res);
  }
}

async function updateNominalRollStudent(req, res) {
  try {
    const url = `${config.get('server:nominalRoll:rootURL')}/${req.params.id}`;
    const studentData = await getData(url);
    const studentReq = {
      ...studentData,
      ...req.body
    };

    const studentRes = await putData(url, studentReq, utils.getUser(req).idir_username);
    return res.status(200).json(studentRes);
  } catch (e) {
    logApiError(e, 'updateNominalRollStudent', 'Error occurred while updating a NominalRollStudent.');
    return errorResponse(res);
  }
}

const postNominalRollData = async (req, res) => {
  try {
    const params = {
      headers: {
        correlationID: req.session.correlationID,
      }
    };
    const processingYear = LocalDate.now().year();
    const sagaReq = {
      processingYear
    };
    const sagaId = await postData(config.get('server:nominalRoll:rootURL') + '/saga/post-data', sagaReq, params, utils.getUser(req).idir_username);

    await createNominalRollSagaRecordInRedis(sagaId, 'NOMINAL_ROLL_POST_DATA_SAGA', 'post nominalRoll data', processingYear);

    return res.status(200).json(sagaId);
  } catch (e) {
    logApiError(e, 'postNominalRollData', 'Error occurred while posting nominal roll data.');
    return errorResponse(res, e.data?.message, e.status);
  }
};

function createNominalRollSagaRecordInRedis(sagaId, sagaName, operation, processingYear) {
  const event = {
    sagaId,
    processingYear,
    sagaStatus: 'INITIATED',
    sagaName
  };
  log.info(`going to store event object in redis for ${operation} request :: `, event);
  return redisUtil.createSagaRecord(event, SAGAS.NOMINAL_ROLL.sagaEventRedisKey);
}

async function createFedProvSchoolCode(req, res) {
  try {
    const url = `${config.get('server:nominalRoll:rootURL')}/federal-province-code`;
    const params = {
      headers: {
        correlationID: req.session.correlationID,
      }
    };
    const result = await postData(url, req.body, params, getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'createFedProvSchoolCode', 'Error occurred while attempting to create a fedProvSchoolCode.');
    return errorResponse(res);
  }
}

const isDataPosted = async (req, res) => {
  try {
    const params = {
      headers: {
        correlationID: req.session.correlationID,
      },
      params: {
        processingYear: LocalDate.now().year()
      }
    };
    const result = await getData(config.get('server:nominalRoll:rootURL')  + '/nominal-roll-posted-students/exist', params);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    return errorResponse(res, e.data?.message, e.status);
  }
};



module.exports = {
  postNominalRollFile,
  isBeingProcessed,
  startProcessing,
  getNominalRollStudentById,
  getNominalRollStudents: utils.getPaginatedListForSCGroups('getNominalRollStudents', `${config.get('server:nominalRoll:rootURL')}/paginated`),
  validateNominalRollStudentDemogData,
  updateNominalRollStudent,
  postNominalRollData,
  isDataPosted,
  createFedProvSchoolCode
};
