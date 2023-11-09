'use strict';
const { logApiError, errorResponse, getData } = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const {compact} = require('lodash');

async function getTraxDataByPen(req, res) {
  const pen = req.query.pen;
  const traxPaths =  ['students', 'stud-xcrses/paginated', 'prov-exams/paginated', 'stud-grad-assmts/paginated'];
  return Promise.all(traxPaths.map(path => 
    getData(`${config.get('server:penTraxURL')}/${path}`, {params: {studNo: pen}}))
  ).then(([studentsResult, studXcrsesResult, provExamsResult, studGradAssmtsResult]) => {
    const courseExamStatus = compact([
      studXcrsesResult.totalElements > 0 ? 'Courses' : '',
      provExamsResult.totalElements > 0 ? 'Exams' : '',
      studGradAssmtsResult.totalElements > 0 ? 'Assmts' : ''
    ]).join('/');
    const traxStatus = `${studentsResult.studStatus || ''}-${courseExamStatus}`;
    return res.status(200).json({traxStatus, student: studentsResult});
  }).catch(e => {
    if (e.status === HttpStatus.NOT_FOUND) {
      return res.status(200).json({traxStatus: 'Student not found'});
    }
    logApiError(e, 'getTraxDataByPen', 'Error occurred while attempting to GET TRAX data.');
    return errorResponse(res);
  });
}

module.exports = {
  getTraxDataByPen
};
