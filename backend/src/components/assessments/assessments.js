'use strict';
const { logApiError, getData, handleExceptionResponse } = require('../utils');
const HttpStatus = require('http-status-codes');
const utils = require('../utils');
const config = require('../../config');
const cacheService = require('../cache-service');
const { createMoreFiltersSearchCriteria } = require('./studentFilters');
const moment = require('moment');
const {LocalDate, DateTimeFormatter} = require('@js-joda/core');
const log = require('../logger');

async function getAssessmentSessions(req, res) {
  try {
    const url = `${config.get('server:assessments:assessmentSessionsURL')}`;
    const data = await getData(url);
    const today = LocalDate.now();
    const formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    data.forEach(session => {
      const activeFromDate = LocalDate.parse(session.activeFromDate, formatter);
      const activeUntilDate = LocalDate.parse(session.activeUntilDate, formatter);
      session.isOpen = activeFromDate.isBefore(today) && activeUntilDate.isAfter(today);
    });

    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getAssessmentSessions', 'Error occurred while attempting to GET assessment sessions.');
    return handleExceptionResponse(e, res);
  }
}

async function getAssessmentSessionsBySchoolYear(req, res) {
  try {
    const url = `${config.get('server:assessments:assessmentSessionsURL')}/school-year/${req.params.schoolYear}`;
    let data = await getData(url);
    const today = LocalDate.now();
    const formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    data.forEach(session => {
      const activeFromDate = LocalDate.parse(session.activeFromDate, formatter);
      const activeUntilDate = LocalDate.parse(session.activeUntilDate, formatter);
      session.isOpen = activeFromDate.isBefore(today) && activeUntilDate.isAfter(today);

      session.assessments.forEach(assessment => {
        let assessmentType = cacheService.getAssessmentTypeByCode(assessment.assessmentTypeCode);
        assessment.assessmentTypeName = assessmentType.label + ' (' + assessment.assessmentTypeCode + ')';
        assessment.displayOrder = assessmentType.displayOrder;
      });
    });
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getSessions', 'Error occurred while attempting to GET sessions by school year.');
    return handleExceptionResponse(e, res);
  }
}

async function updateAssessmentSession(req, res) {
  if (req.params.sessionID !== req.body.sessionID) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'The sessionID in the URL didn\'t match the sessionID in the request body.'
    });
  }
  try {
    const userInfo = utils.getUser(req);
    const payload = {
      sessionID: req.body.sessionID,
      activeFromDate: req.body.activeFromDate,
      activeUntilDate: req.body.activeUntilDate,
      updateUser: userInfo.idir_username
    };
    const result = await utils.putData(`${config.get('server:assessments:assessmentSessionsURL')}/${req.body.sessionID}`, payload, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'updateAssessmentSession', 'Error occurred while attempting to save the changes to the assessment session.');
    return handleExceptionResponse(e, res);
  }
}

async function getAssessmentStudentsPaginated(req, res) {
  try {
    const search = [];
    if (req.query.searchParams?.['moreFilters']) {
      let criteriaArray = createMoreFiltersSearchCriteria(req.query.searchParams['moreFilters']);
      criteriaArray.forEach(criteria => {
        search.push(criteria);
      });
    }
    const params = {
      params: {
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        sort: JSON.stringify(req.query.sort),
        searchCriteriaList: JSON.stringify(search),
      }
    };
    let data =  await getData(`${config.get('server:assessments:assessmentStudentsURL')}/paginated`, params);
    if (req?.query?.returnKey) {
      let result = data?.content.map((student) => student[req?.query?.returnKey]);
      return res.status(HttpStatus.OK).json(result);
    }
    data?.content.forEach(value => {
      includeAssessmentStudentProps(value);
    });
    return res.status(200).json(data);
  } catch (e) {
    if (e?.status === 404) {
      res.status(HttpStatus.OK).json(null);
    } else {
      await logApiError(e, 'Error getting assessments assessment student paginated list');
      return handleExceptionResponse(e, res);
    }
  }
}

async function getAssessmentStudentByID(req, res) {
  try {

    let data = await getData(`${config.get('server:assessments:assessmentStudentsURL')}/${req.params.assessmentStudentID}`);
    return res.status(200).json(includeAssessmentStudentProps(data));
  } catch (e) {
    if (e?.status === 404) {
      res.status(HttpStatus.OK).json(null);
    } else {
      await logApiError(e, 'Error getting assessment student');
      return handleExceptionResponse(e, res);
    }
  }
}

async function postAssessmentStudent(req, res){
  try {
    const userInfo = utils.getUser(req);
    req.body.districtID = cacheService.getSchoolBySchoolID(req.body.schoolID).districtID;
    const payload = {
      ...req.body,
      updateUser: userInfo.idir_username,
      updateDate: null,
      createDate: null
    };
    const result = await utils.postData(`${config.get('server:assessments:assessmentStudentsURL')}`, payload);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    await logApiError(e, 'postAssessmentStudent', 'Error occurred while attempting to create the assessment student registration.');
    return handleExceptionResponse(e, res);
  }
}

async function updateAssessmentStudentByID(req, res) {
  if (req.params.assessmentStudentID !== req.body.assessmentStudentID) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'The assessmentStudentID in the URL didn\'t match the assessmentStudentID in the request body.'
    });
  }
  try {
    const userInfo = utils.getUser(req);
    const payload = {
      ...req.body,
      updateUser: userInfo.idir_username,
      updateDate: null,
      createDate: null
    };
    const result = await utils.putData(`${config.get('server:assessments:assessmentStudentsURL')}/${req.params.assessmentStudentID}`, payload, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'updateAssessmentStudent', 'Error occurred while attempting to save the changes to the assessment student registration.');
    return handleExceptionResponse(e, res);
  }
}

async function deleteAssessmentStudentByID(req, res) {
  try {
    const result = await utils.deleteData(`${config.get('server:assessments:assessmentStudentsURL')}/${req.params.assessmentStudentID}`);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'deleteAssessmentStudentByID', 'Error occurred while attempting to delete the assessment student registration.');
    return handleExceptionResponse(e, res);
  }
}

async function uploadAssessmentResultsFile(req, res) {
  try {
    const userInfo = utils.getUser(req);
    let createUpdateUser =  userInfo.idir_username;
    const payload = {
      fileContents: req.body.fileContents,
      fileName: req.body.fileName,
      replaceResultsFlag: req.query.replaceResultsFlag ? 'Y' : 'N',
      createUser: createUpdateUser,
      updateUser: createUpdateUser
    };
    let data = await utils.postData(`${config.get('server:assessments:rootURL')}/${req.params.sessionID}/results-file`, payload, null, userInfo.idir_username);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    if (e.status === 400) {
      return res.status(HttpStatus.BAD_REQUEST).json(e.data.subErrors[0].message);
    } else if (e.status === 428) {
      return res.status(HttpStatus.PRECONDITION_REQUIRED).json(e.data.message);
    }
    log.error('uploadAssessmentResultsFile Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getResultUploadSummary(req, res) {
  try {
    let data = await getData(`${config.get('server:assessments:rootURL')}/${req.params.sessionID}/result-summary`);
    return res.status(200).json(data);
  } catch (e) {
    await logApiError(e, 'Error getting assessment result summary');
    return handleExceptionResponse(e, res);
  }
}

async function getRegistrationSummary(req, res) {
  try {
    let data = await getData(`${config.get('server:assessments:rootURL')}/report/${req.params.sessionID}/${req.params.type}`);
    return res.status(200).json(data);
  } catch (e) {
    await logApiError(e, 'Error getting registrationsummary');
    return handleExceptionResponse(e, res);
  }
}

async function uploadAssessmentKeyFile(req, res) {
  try {
    const userInfo = utils.getUser(req);
    let createUpdateUser =  userInfo.idir_username;
    const payload = {
      fileContents: req.body.fileContents,
      fileName: req.body.fileName,
      replaceKeyFlag: req.query.replaceKeyFlag ? 'Y' : 'N',
      createUser: createUpdateUser,
      updateUser: createUpdateUser
    };

    let data = await utils.postData(`${config.get('server:assessments:rootURL')}/${req.params.sessionID}/key-file`, payload, null, userInfo.idir_username);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    console.log(JSON.stringify(e));
    if (e.status === 400) {
      return res.status(HttpStatus.BAD_REQUEST).json(e.data.subErrors[0].message);
    } else if (e.status === 428) {
      return res.status(HttpStatus.PRECONDITION_REQUIRED).json(e.data.message);
    }
    log.error('uploadAssessmentKeyFile Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

function includeAssessmentStudentProps(assessmentStudent) {
  if(assessmentStudent) {
    let school = cacheService.getSchoolBySchoolID(assessmentStudent.schoolID);
    let assessmentCenter = assessmentStudent.assessmentCenterID ? cacheService.getSchoolBySchoolID(assessmentStudent.assessmentCenterID) : null;
    let district = cacheService.getDistrictJSONByDistrictId(school.districtID);

    if(school && district) {
      assessmentStudent.schoolName_desc = getSchoolName(school);
      assessmentStudent.districtID = school.districtID;
      assessmentStudent.districtName_desc = getDistrictName(district);
    }

    if(assessmentCenter) {
      assessmentStudent.assessmentCenterName_desc = getSchoolName(assessmentCenter);
    }

    assessmentStudent.assessmentTypeName_desc = cacheService.getAssessmentTypeByCode(assessmentStudent.assessmentTypeCode).label+' ('+assessmentStudent.assessmentTypeCode+')';
    assessmentStudent.provincialSpecialCaseName_desc = assessmentStudent.provincialSpecialCaseCode ? cacheService.getSpecialCaseTypeLabelByCode(assessmentStudent.provincialSpecialCaseCode) : null;
    assessmentStudent.sessionName_desc = moment(assessmentStudent.courseMonth, 'MM').format('MMMM') +' '+assessmentStudent.courseYear;
  }
  return assessmentStudent;
}

function getSchoolName(school) {
  return school.mincode + ' - ' + school.schoolName;
}

function getDistrictName(district) {
  return district.districtNumber + ' - ' + district.name;
}

function getAssessmentSpecialCases(req, res) {
  try {
    const codes = cacheService.getAllAssessmentSpecialCases();
    return res.status(HttpStatus.OK).json(Object.fromEntries(codes));
  } catch (e) {
    logApiError(e, 'getAssessmentSpecialCases', 'Error occurred while attempting to get specialcase types.');
    return handleExceptionResponse(e, res);
  }
}


module.exports = {
  getAssessmentSessions,
  getAssessmentSessionsBySchoolYear,
  updateAssessmentSession,
  getAssessmentStudentsPaginated,
  getAssessmentStudentByID,
  updateAssessmentStudentByID,
  deleteAssessmentStudentByID,
  getAssessmentSpecialCases,
  postAssessmentStudent,
  uploadAssessmentKeyFile,
  uploadAssessmentResultsFile,
  getResultUploadSummary,
  getRegistrationSummary
};
