'use strict';

const {errorResponse, logApiError} = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const {postData, getData, putData} = require('./utils');
const utils = require('./utils');
const {LocalDate, LocalDateTime} = require('@js-joda/core');

const postNominalRollFile = async (req, res) => {
  try {
    const token = utils.getBackendToken(req);
    const document = {
      fileExtension: req.body.fileExtension.replace('.', ''),
      fileContents: req.body.documentData
    };
    const params = {
      headers: {
        correlationID: req.session.correlationID,
      }
    };
    const result = await postData(token, config.get('server:nominalRoll:rootURL'), document, params, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    return errorResponse(res, e.data?.message, e.status);
  }
};
const isBeingProcessed = async (req, res) => {
  try {
    const token = utils.getBackendToken(req);
    const params = {
      headers: {
        correlationID: req.session.correlationID,
      },
      params: {
        processingYear: LocalDate.now().year()
      }
    };
    const result = await getData(token, config.get('server:nominalRoll:rootURL'), params);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    return errorResponse(res, e.data?.message, e.status);
  }
};
const startProcessing = async (req, res) => {
  try {
    const token = utils.getBackendToken(req);
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
    await postData(token, config.get('server:nominalRoll:rootURL') + '/process', body, params, utils.getUser(req).idir_username);
    return res.status(HttpStatus.ACCEPTED).json();
  } catch (e) {
    return errorResponse(res, e.data?.message, e.status);
  }
};

async function getNominalRollStudentById(req, res) {
  try {
    const token = utils.getBackendToken(req);
    const params = {
      headers: {
        correlationID: req.session.correlationID,
      },
    };
    const url = `${config.get('server:nominalRoll:rootURL')}/${req.params.id}`;
    const result = await getData(token, url, params);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'getNominalRollStudentById', 'Error getting a NominalRollStudent.');
    return errorResponse(res);
  }
};

async function validateNominalRollStudentDemogData(req, res) {
  try {
    const token = utils.getBackendToken(req);
    const params = {
      headers: {
        correlationID: req.session.correlationID,
      }
    };
    const url = `${config.get('server:nominalRoll:rootURL')}/validate`;
    const result = await postData(token, url, req.body, params, utils.getUser(req).idir_username);
    return res.status(200).json(result);
  } catch (e) {
    logApiError(e, 'validateNominalRollStudentDemogData', 'Error occurred while attempting to call nominal roll api.');
    return errorResponse(res);
  }
}

async function updateNominalRollStudent(req, res) {
  try {
    const token = utils.getBackendToken(req, res);
    const url = `${config.get('server:nominalRoll:rootURL')}/${req.params.id}`;
    const studentData = await getData(token, url);
    const studentReq = {
      ...studentData,
      ...req.body
    };

    const studentRes = await putData(token, url, studentReq, utils.getUser(req).idir_username);
    return res.status(200).json(studentRes);
  } catch (e) {
    logApiError(e, 'updateNominalRollStudent', 'Error occurred while updating a NominalRollStudent.');
    return errorResponse(res);
  }
}

module.exports = {
  postNominalRollFile,
  isBeingProcessed,
  startProcessing,
  getNominalRollStudentById,
  getNominalRollStudents: utils.getPaginatedListForSCGroups('getNominalRollStudents', `${config.get('server:nominalRoll:rootURL')}/paginated`),
  validateNominalRollStudentDemogData,
  updateNominalRollStudent
};
