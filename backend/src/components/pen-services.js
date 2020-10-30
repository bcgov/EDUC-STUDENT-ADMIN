'use strict';
const {logApiError} = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const {getBackendToken, postData} = require('./utils');
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

module.exports = {
  validateStudentDemogData
};
