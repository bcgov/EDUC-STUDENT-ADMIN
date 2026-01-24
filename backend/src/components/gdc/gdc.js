'use strict';
const { logApiError, getData, putData, postData, handleExceptionResponse } = require('../utils');
const config = require('../../config');
const utils = require('../utils');
const cacheService = require('../cache-service');
const HttpStatus = require('http-status-codes');
const {FILTER_OPERATION, VALUE_TYPE} = require('../../util/constants');
const {LocalDateTime} = require('@js-joda/core');

async function getActiveReportingPeriod(req, res) {
  try {
    const url = `${config.get('server:gdc:activeReportingPeriodURL')}`;
    const data = await getData(url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getActiveReportingPeriod', 'Error occurred while attempting to GET GDC Active Reporting Period.');
    return handleExceptionResponse(e, res);
  }
}

async function getPreviousReportingPeriod(req, res) {
  try {
    const url = `${config.get('server:gdc:previousReportingPeriodURL')}`;
    const data = await getData(url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getPreviousReportingPeriod', 'Error occurred while attempting to GET GDC Previous Reporting Period.');
    return handleExceptionResponse(e, res);
  }
}

async function updateReportingPeriod(req, res) {
  try {
    const url = `${config.get('server:gdc:reportingPeriodURL')}`;
    const params = req.body;
    params.updateDate = null;
    params.createDate = null;
    params.updateUser = utils.getUser(req).idir_username;
    const data = await putData(url, params, utils.getUser(req).idir_username);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'updateReportingPeriod', 'Error occurred while attempting to UPDATE GDC Reporting Period.');
    if (
      e.status === 400 &&
      e.data?.reportingPeriodValidationErrors &&
      Array.isArray(e.data.reportingPeriodValidationErrors)
    ) {
      return res.status(400).json(e.data);
    }
    return handleExceptionResponse(e, res);
  }
}

async function getReportingSummary(req, res) {
  try {
    const params = {
      params: {
        type: req.query.type
      }
    };
    const url = `${config.get('server:gdc:rootURL')}/reporting-period/${req.params.reportingPeriodID}/summary`;
    const data = await getData(url, params);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getReportingSummary', 'Error occurred while attempting to GET GDC Reporting summary.');
    return handleExceptionResponse(e, res);
  }
}

async function getSchoolSubmissionCounts(req, res) {
  try {
    const params = {
      params: {
        categoryCode: req.query?.categoryCode
      }
    };
    const url = `${config.get('server:gdc:rootURL')}/reporting-period/${req.params.reportingPeriodID}/school-submission-counts`;
    const data = await getData(url, params);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getSubmissionCounts', 'Error occurred while attempting to GET GDC school submission counts summary.');
    return handleExceptionResponse(e, res);
  }
}

async function getSummerReportingInsights(req, res) {
  try {
    const gdcParams = {
      params: {
        categoryCode: req.params.schoolCategory
      }
    };
    const reportingPeriod = await getData(`${config.get('server:gdc:rootURL')}/reporting-period/${req.params.reportingPeriodID}`);
    const gdcData = await getData(`${config.get('server:gdc:rootURL')}/reporting-period/${req.params.reportingPeriodID}/school-submission-counts`, gdcParams);
    const filteredSchoolIDs = await getSchoolIDsForReportingInsightsInPeriod(req.params.schoolCategory, LocalDateTime.parse(reportingPeriod.summerStart), LocalDateTime.parse(reportingPeriod.summerEnd));
    const reportingInsights = await createSummerReportingInsights(filteredSchoolIDs, gdcData);
    reportingInsights.sort((a, b) => a.schoolName.localeCompare(b.schoolName, undefined, { sensitivity: 'base' }));
    return res.status(200).json(reportingInsights);
  } catch (e) {
    await logApiError(e, 'getSummerReportingInsights', 'Error occurred while attempting to GET GDC Reporting summary.');
    return handleExceptionResponse(e, res);
  }
}

async function getSchoolYearReportingInsights(req, res) {
  try {
    const reportingPeriod = await getData(`${config.get('server:gdc:rootURL')}/reporting-period/${req.params.reportingPeriodID}`);
    const gdcParams = {
      params: {
        categoryCode: req.params.schoolCategory
      }
    };
    const gdcData = await getData(`${config.get('server:gdc:rootURL')}/reporting-period/${req.params.reportingPeriodID}/school-submission-counts`, gdcParams);
    const filteredSchoolIDs = await getSchoolIDsForReportingInsightsInPeriod(req.params.schoolCategory, LocalDateTime.parse(reportingPeriod.schYrStart), LocalDateTime.parse(reportingPeriod.schYrEnd));

    const grade = '12';
    const sdcRequestBody = { schoolIDs: filteredSchoolIDs };
    let sdcData = await postData(`${config.get('sdc:rootURL')}/collection/${req.params.sdcCollectionID}/counts/${grade}`, sdcRequestBody, {});

    const gradRequestBody = { schoolID: filteredSchoolIDs };
    let gradData = await postData(`${config.get('server:gradStudent:rootURL')}/graduation-counts`, gradRequestBody, {});
    
    const reportingInsights = await createSchoolYearReportingInsights(filteredSchoolIDs, sdcData, gradData, gdcData);
    reportingInsights.sort((a, b) => a.schoolName.localeCompare(b.schoolName, undefined, { sensitivity: 'base' }));
    return res.status(200).json(reportingInsights);
  } catch (e) {
    await logApiError(e, 'getSchoolYearReportingInsights', 'Error occurred while attempting to GET GDC Reporting summary.');
    return handleExceptionResponse(e, res);
  }
}

async function getSchoolIDsForReportingInsightsInPeriod(schoolCategory, periodStartDate, periodEndDate) {
  let schools = cacheService.getAllSchoolsJSON();
  let gradSchools = cacheService.getGradSchoolsMap();
  let filteredSchoolIDs = [];
  for (const school of schools) {
    if (school.schoolCategoryCode !== schoolCategory) continue;
    
    if (!school.openedDate) continue;
    let openDate = LocalDateTime.parse(school.openedDate);
    let closeDate = school.closedDate ? LocalDateTime.parse(school.closedDate) : LocalDateTime.MAX;
    let isSchoolOpenDuringReportingPeriod = openDate.isBefore(periodEndDate) && periodStartDate.isBefore(closeDate);
    if (!isSchoolOpenDuringReportingPeriod) continue;
    
    let gradSchool = gradSchools.get(school.schoolID);        
    if (gradSchool?.canIssueTranscripts === 'N') continue;

    filteredSchoolIDs.push(school.schoolID);
  }
  return filteredSchoolIDs;
}

async function createSchoolYearReportingInsights(schoolIDs, sdcData, gradData, gdcData){
  return Promise.all(schoolIDs.map(async schoolID => {
    const sdcEntry = sdcData.find(item => item.schoolID === schoolID);
    const gradEntry = gradData.find(item => item.schoolOfRecordId === schoolID);
    const gdcEntry = gdcData.schoolSubmissions.find(item => item.schoolID === schoolID);
    const schoolData = cacheService.getSchoolBySchoolID(schoolID);

    const schoolUserParams = {
      params: {
        schoolID: schoolID,
      }
    };
    const schoolUserURL = `${config.get('server:edx:rootURL')}/users`;
    const schoolUsers = await getData(schoolUserURL, schoolUserParams);

    const gradUsersForSchool = createGradUsersList(schoolUsers, schoolID);

    return {
      schoolID: schoolID,
      schoolName: `${schoolData.mincode} - ${schoolData.schoolName}`,
      schoolPhoneNumber: formatPhoneNumber(schoolData.phoneNumber),
      facilityType: schoolData.facilityTypeCode,
      totalSubmissions: gdcEntry ? gdcEntry.submissionCount : null,
      lastSubmission: gdcEntry ? gdcEntry.lastSubmissionDate : null,
      currentGraduates: gradEntry ? gradEntry.currentGraduates : null,
      currentNonGraduates: gradEntry ? gradEntry.currentNonGraduates : null,
      percentageGraduation: gradEntry ? (() => {
        const numerator = parseInt(gradEntry.currentGraduates);
        const denominator = parseInt(gradEntry.currentGraduates) + parseInt(gradEntry.currentNonGraduates);
        return denominator === 0 ? null : Math.round((numerator / denominator) * 100);
      })() : null,
      grade12Enrolment: sdcEntry ? sdcEntry.gradeEnrolmentCount : null,
      percentGraduatedSLD: gradEntry && sdcEntry ? (() => {
        const numerator = parseInt(gradEntry.currentGraduates);
        const denominator = parseInt(sdcEntry.gradeEnrolmentCount);
        return denominator === 0 ? null : Math.round((numerator / denominator) * 100);
      })() : null,
      gradUsers: gradUsersForSchool
    };
  }));
}

async function createSummerReportingInsights(schoolIDs, gdcData){
  return await Promise.all(schoolIDs
    .filter(schoolID => {
      return gdcData.summerSubmissions.some(item => item.schoolID === schoolID);
    })
    .map(async schoolID => {
      const gdcEntry = gdcData.summerSubmissions.find(item => item.schoolID === schoolID);
      const schoolData = cacheService.getSchoolBySchoolID(schoolID);

      const schoolUserParams = {
        params: {
          schoolID: schoolID,
        }
      };
      const schoolUserURL = `${config.get('server:edx:rootURL')}/users`;
      const schoolUsers = await getData(schoolUserURL, schoolUserParams);

      const gradUsersForSchool = createGradUsersList(schoolUsers, schoolID);

      return {
        schoolID: schoolID,
        schoolName: `${schoolData.mincode} - ${schoolData.schoolName}`,
        schoolPhoneNumber: formatPhoneNumber(schoolData.phoneNumber),
        facilityType: schoolData.facilityTypeCode,
        totalSubmissions: gdcEntry ? gdcEntry.submissionCount : 0,
        lastSubmission: gdcEntry ? gdcEntry.lastSubmissionDate : null,

        gradUsers: gradUsersForSchool
      };
    }));
}

function createGradUsersList (schoolUsers, schoolID) {
  return schoolUsers.reduce((acc, user) => {
    const schoolMatch = user.edxUserSchools.find(eus => eus.schoolID === schoolID);
    if (schoolMatch) {
      const isGradAdmin = schoolMatch.edxUserSchoolRoles.some(role => role.edxRoleCode === 'GRAD_SCH_ADMIN');
      if (isGradAdmin) {
        const userFullName = formatFullName(user.firstName, user.lastName);
        acc.push({
          userFullName: userFullName,
          userEmail: user.email,
        });
      }
    }
    return acc;
  }, []);
}

function formatFullName(firstName, lastName) {
  const capitalizedFirst =  firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  const capitalizedLast = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
  return `${capitalizedFirst} ${capitalizedLast}`;
}

function formatPhoneNumber(phoneNumberString) {
  if (!phoneNumberString || typeof phoneNumberString !== 'string' || !/^\d{10}$/.test(phoneNumberString)) {
    return phoneNumberString; // Return original if not a 10-digit string
  }
  const areaCode = phoneNumberString.substring(0, 3);
  const centralOfficeCode = phoneNumberString.substring(3, 6);
  const lineNumber = phoneNumberString.substring(6, 10);
  return `(${areaCode}) ${centralOfficeCode}-${lineNumber}`;
}

async function getFilesetsPaginated(req, res) {
  try {
    const search = [];

    if (req.query?.searchParams?.schoolID) {
      search.push({
        condition: 'AND',
        searchCriteriaList: [{ key: 'schoolID', value: req.query.searchParams.schoolID, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID }]
      });
    }
    if (req.query?.searchParams?.pen) {
      search.push({
        condition: 'AND',
        searchCriteriaList: [
          { key: 'demographicStudentEntities.pen', value: req.query?.searchParams?.pen, operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING },
        ]
      });
    }

    if (req.query.searchParams?.collectionObject) {
      search.push({
        condition: 'AND',
        searchCriteriaList: [{
          key: 'reportingPeriod.reportingPeriodID',
          value: req.query.searchParams.collectionObject.reportingPeriodID,
          operation: FILTER_OPERATION.EQUAL,
          valueType: VALUE_TYPE.UUID
        }]
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
    let data = await getData(`${config.get('server:gdc:filesetURL')}/paginated/final`, params);

    if (data.content && data.content.length > 0) {
      data.content = data.content.map(fileset => {
        if (req?.params?.districtID) {
          const school = cacheService.getSchoolBySchoolID(fileset.schoolID);
          fileset.schoolName = `${school.mincode} - ${school.schoolName}`.trim();
        }
        if (fileset.updateUser && fileset.updateUser.startsWith('EDX/')) {
          const userID = fileset.updateUser.slice(4);
          const user = cacheService.getEdxUserByID(userID);
          fileset.updateUser = user ? user.displayName : fileset.updateUser;
        }
        return fileset;
      });
    }

    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    await logApiError('Error getting error fileset paginated list', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getDemographicStudentByPenIncomingFilesetIdAndSchoolId(req, res) {
  try {
    const params = {
      params: {
        pen: req.params.pen,
        incomingFilesetID: req.params.filesetID,
        schoolID: req.query?.schoolID,
      }
    };

    let data = await getData(`${config.get('server:gdc:filesetURL')}/get-student`, params);

    data.courseStudents.forEach(cs => {
      cs.session = cs.courseYear + '/' + cs.courseMonth;
      if(cs.courseCode && cs.courseLevel){
        cs.course = cs.courseCode + cs.courseLevel;
      }else if(cs.courseCode){
        cs.course = cs.courseCode;
      }else{
        cs.course = '-';
      }
      if(!cs.relatedCourse){
        cs.relatedCourseValue = '-';
      }else if(!cs.relatedLevel){
        cs.relatedCourseValue = '-';
      }else{
        cs.relatedCourseValue = cs.relatedCourse + cs.relatedLevel;
      }
    });
    
    data.assessmentStudents.forEach(as => {
      as.session = as.courseYear + '/' + as.courseMonth;
    });

    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    logApiError('Error getting error fileset object', e.stack);
    return handleExceptionResponse(e, res);
  }
}

module.exports = {
  getActiveReportingPeriod,
  getPreviousReportingPeriod,
  updateReportingPeriod,
  getReportingSummary,
  getFilesetsPaginated,
  getDemographicStudentByPenIncomingFilesetIdAndSchoolId,
  getSummerReportingInsights,
  getSchoolYearReportingInsights,
  getSchoolSubmissionCounts
};
