'use strict';
const { logApiError, getData, errorResponse, handleExceptionResponse } = require('../utils');
const HttpStatus = require('http-status-codes');
const utils = require('../utils');
const config = require('../../config');
const cacheService = require('../cache-service');
const { createMoreFiltersSearchCriteria } = require('./studentFilters');
const moment = require('moment');

async function getAssessmentSessions(req, res) {
  try {
    const url = `${config.get('server:eas:assessmentSessionsURL')}`;
    const data = await getData(url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getAssessmentSessions', 'Error occurred while attempting to GET assessment sessions.');
    return handleExceptionResponse(e, res);
  }
}

async function getAssessmentSessionsBySchoolYear(req, res) {
  try {
    const url = `${config.get('server:eas:assessmentSessionsURL')}/school-year/${req.params.schoolYear}`;
    let data = await getData(url);
    data.forEach(session => {
      session.assessments.forEach(assessment => {
        assessment.assessmentTypeName = cacheService.getAssessmentTypeLabelByCode(assessment.assessmentTypeCode)+' ('+assessment.assessmentTypeCode+')';
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
    const result = await utils.putData(`${config.get('server:eas:assessmentSessionsURL')}/${req.body.sessionID}`, payload, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'updateAssessmentSession', 'Error occurred while attempting to save the changes to the assessment session.');
    return errorResponse(res);
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

    let data = await getData(`${config.get('server:eas:assessmentStudentsURL')}/paginated`, params);

    if (req?.query?.returnKey) {
      let result = data?.content.map((student) => student[req?.query?.returnKey]);
      return res.status(HttpStatus.OK).json(result);
    }
    data?.content.forEach(value => {
      let school = cacheService.getSchoolBySchoolID(value.schoolID);
      let assessmentCenter = cacheService.getSchoolBySchoolID(value.assessmentCenterID);
      let district = cacheService.getDistrictJSONByDistrictId(school.districtID);

      value.schoolNumber = school.mincode;
      value.schoolName = getSchoolName(school);
      value.districtID = school.districtID;
      value.districtNumber = district.districtNumber;
      value.districtName = getDistrictName(district);    
      value.assessmentCenterNumber = assessmentCenter.mincode;
      value.assessmentCenterName = getSchoolName(assessmentCenter);

      value.assessmentTypeName = cacheService.getAssessmentTypeLabelByCode(value.assessmentTypeCode)+' ('+value.assessmentTypeCode+')';
      value.provincialSpecialCaseName = cacheService.getSpecialCaseTypeLabelByCode(value.provincialSpecialCaseCode);
      value.sessionName = moment(value.courseMonth, 'MM').format('MMMM') +' '+value.courseYear;

    });
    return res.status(200).json(data);
  } catch (e) {
    if (e?.status === 404) {
      res.status(HttpStatus.OK).json(null);
    } else {
      await logApiError(e, 'Error getting eas assessment student paginated list');
      return errorResponse(res);
    }
  }
}

function getSchoolName(school) {
  return school.mincode + ' - ' + school.schoolName;
}

function getDistrictName(district) {
  return district.districtNumber + ' - ' + district.name;
}

module.exports = {
  getAssessmentSessions,
  getAssessmentSessionsBySchoolYear,
  updateAssessmentSession,
  getAssessmentStudentsPaginated
};
