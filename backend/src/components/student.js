'use strict';
const {logApiError, errorResponse} = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const log = require('./logger');
const utils = require('./utils');
const {putData, postData, getData, deleteData} = require('./utils');
const {v4: uuidv4} = require('uuid');

async function updateStudent(req, res) {
  try {
    const token = utils.getBackendToken(req);

    if (!req.params.studentID) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'No Student ID for PUT operation.'
      });
    }
    const student = req.body.student;
    student.createDate = null;
    student.updateDate = null;
    const result = await putData(token, config.get('server:student:rootURL') + '/', student, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'saveStudent', 'Error occurred while attempting to save a student.');
    return errorResponse(res);
  }
}


async function deleteStudentTwinByStudentTwinId(req, res) {
  try {
    const token = utils.getBackendToken(req);

    const endpoint = config.get('server:student:rootURL');
    const url = `${endpoint}/${req.params.studentID}/twins/${req.params.studentTwinID}`;
    
    await deleteData(token, url);
    return res.status(HttpStatus.OK).json();
  }catch(e){
    logApiError(e, 'deleteStudentTwinByStudentTwinId', 'Error occurred while attempting to DELETE student twin.');
    return errorResponse(res);
  }
}

async function getStudentByStudentId(req, res) {
  const token = utils.getBackendToken(req);
  const id = req.params.id;

  return Promise.all([
    utils.getData(token, config.get('server:student:rootURL') + '/' + id),
    utils.getData(token, `${config.get('server:student:rootURL')}/${id}/merges`),
    utils.getData(token, `${config.get('server:student:rootURL')}/${id}/twins`)
  ]).then(([studentResponse, mergesResponse, twinsResponse]) => {
    if (studentResponse) {
      return res.status(200).json({student: studentResponse, merges: mergesResponse, twins: twinsResponse});
    } else {
      log.error(`No student was found or error occurred retrieving student, for :: ${id}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'INTERNAL SERVER ERROR'
      });
    }
  }).catch(e => {
    logApiError(e, 'getStudentByStudentId', 'Error occurred while attempting to GET student.');
    return errorResponse(res);
  });
}

async function getStudentTwinsByStudentId(req, res) {
  const token = utils.getBackendToken(req);
  const id = req.params.id;
  try{
    return res.status(200).json(await utils.getData(token, `${config.get('server:student:rootURL')}/${id}/twins`));
  }catch (e) {
    logApiError(e, 'getStudentTwinsByStudentId', 'Error occurred while attempting to GET student twins.');
    return errorResponse(res);
  }
}

async function getAllStudentByStudentIds(req, res) {
  try {
    const result = await utils.getStudentsFromStudentAPIByTheirIds(utils.getBackendToken(req), req.query.studentIDs);
    return res.status(HttpStatus.OK).json(result.content);
  } catch (e) {
    logApiError(e, 'getAllStudentByStudentIds', 'Error occurred while attempting to GET all students by their ids.');
    return errorResponse(res);
  }
}

async function getStudentByPen(req, res) {
  try {
    const token = utils.getBackendToken(req);
    const pen = req.query.pen;
    const result = await utils.getData(token, config.get('server:student:rootURL') + '/', {params: {pen: pen}});
    if (result && result[0] && result[0].studentID) {
      return res.status(200).json(result[0]);
    } else {
      log.error(`No student was found or error occurred retrieving student, for pen :: ${pen}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'INTERNAL SERVER ERROR'
      });
    }
  } catch (e) {
    logApiError(e, 'getStudentByStudentId', 'Error occurred while attempting to GET student.');
    return errorResponse(res);
  }
}

/**
 * This method first checks if a transaction ID is stored in session for previous attempt to create a new student,
 * if so it reuses the same transaction ID or else generate a new guid. transaction ID must be a GUID.
 * after getting the PEN NUMBER from
 */
async function createNewStudent(req, res) {
  try {
    let transactionID;
    if (req.session.create_new_student_transactionID) {
      transactionID = req.session.create_new_student_transactionID;
    } else {
      transactionID = uuidv4();
      req.session.create_new_student_transactionID = transactionID; // store it in session so that it can be reused when the api call to create student fails.
    }
    const params = {
      params: {
        transactionID
      }
    };
    const token = utils.getBackendToken(req);
    const penNumber = await getData(token, config.get('server:penServices:nextPenURL'), params);
    const student = req.body.student;
    student.pen = penNumber;
    student.historyActivityCode = 'USERNEW';
    student.statusCode = 'A';
    student.createDate = null;
    student.updateDate = null;
    const result = await postData(token, config.get('server:student:rootURL') + '/', student, null, utils.getUser(req).idir_username);
    delete req.session.create_new_student_transactionID; // delete it when student is created successfully.
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'createNewStudent', 'Error occurred while attempting to create a new student.');
    return errorResponse(res);
  }
}

module.exports = {
  updateStudent,
  getStudentByStudentId,
  getStudentByPen,
  createNewStudent,
  getAllStudentByStudentIds,
  deleteStudentTwinByStudentTwinId,
  getStudentTwinsByStudentId
};
