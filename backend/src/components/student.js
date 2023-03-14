'use strict';

const {logApiError, errorResponse, addSagaStatusToRecords} = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const log = require('./logger');
const SAGAS = require('./saga');
const utils = require('./utils');
const {putData, getData} = require('./utils');
const retry = require('async-retry');
const redisUtil = require('../util/redis/redis-utils');
const {v4: uuidv4} = require('uuid');
const {LocalDateTime} = require('@js-joda/core');

function getPenServicesSagaEvents() {
  return redisUtil.getSagaEventsByRedisKey(SAGAS.PEN_SERVICES.sagaEventRedisKey);
}

function addSagaStatus(students) {
  return addSagaStatusToRecords(students, 'studentID', getPenServicesSagaEvents);
}

async function updateStudent(req, res) {

  try {
    const token = utils.getBackendToken(req);
    if (!req.params.studentID) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'No Student ID for PUT operation.'
      });
    }
    const currentStudent = await getData(token, `${config.get('server:student:rootURL')}/${req.params.studentID}`);
    const student = req.body.student;

    if(student.statusCode === 'D' && currentStudent.statusCode !== 'D') { //student statusCode changed to deceased
      student.demogCode = 'F';
    }

    if(student.statusCode !== 'D' && currentStudent.statusCode === 'D') { //student statusCode changed to no longer deceased
      student.demogCode = 'A';
    }

    if(req.body.isDateOfConfirmationChanged){
      student.dateOfConfirmation = LocalDateTime.now().withNano(0).toJSON();
    }else if(currentStudent.demogCode === 'C'){
      if(student.demogCode !== 'C'){ // remove the doc type code and date of confirmation.
        student.documentTypeCode = null;
        student.dateOfConfirmation = null;
      }else if(currentStudent.documentTypeCode !== student.documentTypeCode){ // only doc type was updated, so update the date time.
        student.dateOfConfirmation = LocalDateTime.now().withNano(0).toJSON();
      }
    }else if(!currentStudent.documentTypeCode && student.documentTypeCode){
      student.demogCode = 'C';
      student.dateOfConfirmation = LocalDateTime.now().withNano(0).toJSON();
    }

    student.sexCode = student.genderCode;
    student.createDate = null;
    student.updateDate = null;
    await retry(async () => {
      const result = await putData(token, `${config.get('server:student:rootURL')}/${req.params.studentID}`, student, utils.getUser(req).idir_username);
      return res.status(HttpStatus.OK).json(result);
    },
    {
      retries: 3
    });
  } catch (e) {
    logApiError(e, 'updateStudent', 'Error occurred while attempting to update a student.');
    return errorResponse(res);
  }

}

async function getStudentDemographicsOnlyByStudentId(req, res) {
  const token = utils.getBackendToken(req);
  const id = req.params.id;
  try {
    const studentResponse = await utils.getData(token, config.get('server:student:rootURL') + '/' + id);
    return res.status(HttpStatus.OK).json(studentResponse);
  } catch (e) {
    return errorResponse(res);
  }
}

async function getStudentByStudentId(req, res) {
  const token = utils.getBackendToken(req);
  const id = req.params.id;

  return Promise.all([
    utils.getData(token, config.get('server:student:rootURL') + '/' + id),
    utils.getData(token, `${config.get('server:penServices:rootURL')}/${id}/merges`),
    utils.getData(utils.getBackendToken(req), `${config.get('server:penMatch:possibleMatch')}/${id}`)
  ]).then(async ([studentResponse, mergesResponse, possibleMatches]) => {
    if (studentResponse) {
      addSagaStatus([studentResponse]);
      const response = {
        student: studentResponse,
        merges: [],
        possibleMatches: []
      };
      // update the response payload with student details for display in UI for possible matches.
      if (possibleMatches && possibleMatches.length > 0) {
        const matchedStudentIDs = possibleMatches.map((matchingRecord) => {
          return matchingRecord.matchedStudentID;
        }).join();
        const studentsPage = await utils.getStudentsFromStudentAPIByTheirIds(utils.getBackendToken(req), matchedStudentIDs);
        const students = studentsPage.content;
        possibleMatches.forEach((possibleMatch) => {
          possibleMatch.matchedStudent = students.find((student) => student.studentID === possibleMatch.matchedStudentID);
        });
        response.possibleMatches = possibleMatches;
      }
      if (mergesResponse && mergesResponse.length > 0) {
        const mergeStudentIDs = mergesResponse.map((mergeRecord) => {
          return mergeRecord.mergeStudentID;
        }).join();
        const studentsPage = await utils.getStudentsFromStudentAPIByTheirIds(utils.getBackendToken(req), mergeStudentIDs);
        const students = studentsPage.content;
        mergesResponse.forEach((merge) => {
          merge.mergeStudent = students.find((student) => student.studentID === merge.mergeStudentID);
        });

        response.merges = mergesResponse;
      }
      return res.status(200).json(response);
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
    const result = await utils.getData(token, config.get('server:student:rootURL'), {params: {pen: pen}});
    if (result && result[0] && result[0].studentID) {
      return res.status(200).json(result[0]);
    } else {
      const message = `No student record was found for pen :: ${pen}`;
      log.error(message);
      return errorResponse(res, message, HttpStatus.NOT_FOUND);
    }
  } catch (e) {
    logApiError(e, 'getStudentByStudentId', 'Error occurred while attempting to GET student.');
    return errorResponse(res);
  }
}

/**
 * This method first checks if a transaction ID is stored in session for previous attempt to create a new student,
 * if so it reuses the same transaction ID or else generate a new guid. transaction ID must be a GUID.
 * after getting the PEN NUMBER from SERVICES API call student api to create student with associations.
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
    const penNumber = await utils.getData(token, config.get('server:penServices:nextPenURL'), params);
    const student = req.body.student;
    student.dob = utils.formatDate(student.dob?.replace(/\D/g, ''));
    student.pen = penNumber;
    student.sexCode = student.genderCode; // sex code is mandatory in API.
    student.historyActivityCode = student.historyActivityCode || 'REQNEW';
    student.emailVerified = student.emailVerified || 'N';
    student.demogCode = student.demogCode || 'A';
    student.statusCode = student.statusCode || 'A';
    student.createDate = null;
    student.updateDate = null;
    const result = await utils.postData(token, config.get('server:student:rootURL') + '/', student, null, utils.getUser(req).idir_username);
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
  getStudentDemographicsOnlyByStudentId,
};
