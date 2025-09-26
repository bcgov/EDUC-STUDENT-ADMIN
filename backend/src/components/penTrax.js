'use strict';
const { logApiError, errorResponse, getData } = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const {compact} = require('lodash');
const NATS = require('../messaging/message-pub-sub');
const { v4: uuidv4 } = require('uuid');
const { getSchoolBySchoolID } = require('../components/cache-service');
const { GRAD_TO_PEN_STUDENT_STATUS } = require('../util/constants');

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

async function getGradDataByStudentID(req, res) {
  const studentID = req.query.studentID;
  if (!studentID) {
    return res.status(400).json({error: 'studentID parameter is required'});
  }
  try {
    const [studentData, studentCourses, studentAssessments] = await Promise.all([
      getGradStudentData(studentID),
      getStudentCourses(studentID),
      getStudentAssessments(studentID)
    ]);

    if(studentData === null) {
      return res.status(200).json({traxStatus: 'Student not found'});
    }
    const courseCount = studentCourses?.courses?.length || 0;
    const examCount = studentCourses?.courses?.filter(course => course.courseExam).length || 0;
    const assessmentCount = studentAssessments?.length || 0;

    const courseExamStatus = compact([
      courseCount > 0 ? 'Courses' : '',
      examCount > 0 ? 'Exams' : '',
      assessmentCount > 0 ? 'Assmts' : ''
    ]).join('/');
    const traxStatus = `${GRAD_TO_PEN_STUDENT_STATUS[studentData?.studentStatusCode] || ''}-${courseExamStatus}`;

    return res.status(200).json({traxStatus, student: studentData});
  } catch (e) {
    logApiError(e, 'getGradDataByStudentID', 'Error occurred while attempting to get grad data.');
    return errorResponse(res);
  }
}

async function getGradStudentData(studentID) {
  try {
    const correlationId = uuidv4();
    const event = {
      sagaId: correlationId,
      eventType: 'GET_STUDENT',
      eventPayload: studentID,
      replyTo: null
    };
    const topic = 'GRAD_STUDENT_API_FETCH_GRAD_STUDENT_TOPIC';
    const response = await NATS.requestMessage(topic, JSON.stringify(event), 29000);

    const responseData = JSON.parse(response);
    if (responseData.exception === 'not found') {
      return;
    }
    responseData.mincode = getSchoolBySchoolID(responseData.schoolAtGradId)?.mincode || '';
    return responseData;
  } catch (error) {
    console.error('Error getting grad student data:', error);
    throw error;
  }
}


async function getStudentCourses(studentID) {
  if (!studentID) {
    return { courses: [] };
  }
  try {
    const correlationId = uuidv4();
    const event = {
      sagaId: correlationId,
      eventType: 'GET_STUDENT_COURSES',
      eventPayload: studentID,
      replyTo: null
    };
    const topic = 'GRAD_STUDENT_API_FETCH_GRAD_STUDENT_COURSES_TOPIC';
    const response = await NATS.requestMessage(topic, JSON.stringify(event), 29000);
    
    if (!response) {
      return { courses: [] };
    }
    const responseData = JSON.parse(response);
    return responseData.courses ? responseData :  { courses: [] };
  } catch (error) {
    console.error('Error getting student courses:', error);
    return { courses: [] };
  }
}

async function getStudentAssessments(studentID) {
  try {
    const correlationId = uuidv4();
    const event = {
      sagaId: correlationId,
      eventType: 'GET_ASSESSMENT_STUDENTS',
      eventPayload: studentID,
      replyTo: null
    };
    const topic = 'STUDENT_ASSESSMENT_API_TOPIC';
    const response = await NATS.requestMessage(topic, JSON.stringify(event), 29000);
    
    if (!response) {
      return [];
    }
    const assessmentStudents = JSON.parse(response);
    return Array.isArray(assessmentStudents) ? assessmentStudents : [];
  } catch (error) {
    console.error('Error getting student assessments:', error);
    return [];
  }
}

module.exports = {
  getTraxDataByPen,
  getGradDataByStudentID
};
