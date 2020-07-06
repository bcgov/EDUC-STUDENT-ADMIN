'use strict';
const { logApiError } = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const log = require('./logger');
const utils = require('./utils');
const { putData } = require('./utils');

async function saveStudent(req, res) {
  try {
	const token = utils.getBackendToken(req);
	if (!token) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
     });
	}
    const student = req.body.student;

    const demogCodes = utils.getCodeTable(token, 'demogCodes', config.get('server:studentDemogCodesURL'));
    const statusCodes = utils.getCodeTable(token, 'statusCodes', config.get('server:studentStatusCodesURL'));

    if(student.demogCode){
		student.demogCode = utils.getCodeFromLabel(demogCodes, 'demogCode', student.demogCode);
	}

    if(student.statusCode){
		student.statusCode = utils.getCodeFromLabel(statusCodes, 'statusCode', student.statusCode);
	}

	student.createDate = null;
	student.updateDate = null;
    const result = await putData(token, config.get('server:studentURL') + '/', student);

	if(result.demogCode){
		result.demogCode = utils.getCodeLabel(demogCodes, 'demogCode', result.demogCode);
	}
	if(result.statusCode){
		result.statusCode = utils.getCodeLabel(statusCodes, 'statusCode', result.statusCode);
	}
	return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'saveStudent', 'Error occurred while attempting to save a student.');
    return errorResponse(res);
  }
}

async function getStudentByStudentId(req, res) {
  const token = utils.getBackendToken(req);
  if (!token) {
    return unauthorizedError(res);
  }
  const id = req.params.id;

  return Promise.all([
    utils.getData(token, config.get('server:studentURL') + '/' + id),
    utils.getCodeTable(token, 'demogCodes', config.get('server:studentDemogCodesURL')),
    utils.getCodeTable(token, 'statusCodes', config.get('server:studentStatusCodesURL'))
  ])
    .then(async ([dataResponse, demogCodesResponse, statusCodesResponse]) => {
      if (dataResponse) {
		if(dataResponse.demogCode){
			dataResponse.demogCode = utils.getCodeLabel(demogCodesResponse, 'demogCode', dataResponse.demogCode);
		}
		if(dataResponse.statusCode){
			dataResponse.statusCode = utils.getCodeLabel(statusCodesResponse, 'statusCode', dataResponse.statusCode);
		}
        return res.status(200).json(dataResponse);
      } else {
        log.error('No student was found or error occurred retrieving student.');
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'INTERNAL SERVER ERROR'
        });
      }
    }).catch((e) => {
      logApiError(e, 'getStudentById', 'Error occurred while attempting to GET student.');
      return errorResponse(res);
    });
}

function errorResponse(res, msg) {
  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    message: msg || 'INTERNAL SERVER ERROR'
  });
}

function unauthorizedError(res) {
  return res.status(HttpStatus.UNAUTHORIZED).json({
    message: 'No access token'
  });
}


module.exports = {
  saveStudent,
  getStudentByStudentId
};
