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

async function getReportingInsights(req, res) {
  try {
    let schools = cacheService.getAllSchoolsJSON();
    let gradSchools = cacheService.getGradSchoolsMap();

    let collectionObject = req.query.collectionObject;
    if (typeof collectionObject === 'string') {
      try {
        collectionObject = JSON.parse(collectionObject);
      } catch {
        collectionObject = null;
      }
    }

    let cutoff;
    if (collectionObject) {
      if (req.params.reportingPeriodType === 'SchoolYear' && collectionObject.schYrEnd) {
        cutoff = LocalDateTime.parse(collectionObject.schYrEnd);
      } else if (req.params.reportingPeriodType === 'Summer' && collectionObject.summerEnd) {
        cutoff = LocalDateTime.parse(collectionObject.summerEnd);
      } else {
        cutoff = LocalDateTime.now();
      }
    } else {
      cutoff = LocalDateTime.now();
    }

    let filteredSchoolIDs = [];
    for (const school of schools) {
      let gradSchool = gradSchools.get(school.schoolID);
      if (school.schoolCategoryCode !== req.params.schoolCategory) continue;
      if (gradSchool?.canIssueTranscripts === 'N') continue;
      if (!school.openedDate) continue;

      let openDate = LocalDateTime.parse(school.openedDate);
      let endOfCloseDateGraceWindow = school.closedDate ? LocalDateTime.parse(school.closedDate).plusMonths(3) : null;

      if (cutoff.isBefore(openDate)) continue;
      if (endOfCloseDateGraceWindow && cutoff.isAfter(endOfCloseDateGraceWindow)) continue;

      filteredSchoolIDs.push(school.schoolID);
    }

    const grade = '12';

    const gdcParams = {
      params: {
        categoryCode: req.params.schoolCategory
      }
    };
    const gdcURL = `${config.get('server:gdc:rootURL')}/reporting-period/${req.params.reportingPeriodID}/school-submission-counts`;
    const gdcData = await getData(gdcURL, gdcParams);

    let sdcData = null;
    let gradData = null;

    const activeSDCURL = `${config.get('sdc:activeCollectionURL')}`;
    const activeSDC = await getData(activeSDCURL, {});
    const septSDCInFlight = activeSDC.collectionTypeCode === 'SEPTEMBER';

    if(req.params.reportingPeriodType === 'SchoolYear' && !septSDCInFlight){
      const sdcURL = `${config.get('sdc:rootURL')}/collection/${req.params.sdcCollectionID}/counts/${grade}`;
      const sdcRequestBody = { schoolIDs: filteredSchoolIDs };
      sdcData = await postData(sdcURL, sdcRequestBody, {});

      const gradURL = `${config.get('server:gradStudent:rootURL')}/graduation-counts`;
      const gradRequestBody = { schoolID: filteredSchoolIDs };
      gradData = await postData(gradURL, gradRequestBody, {});
    }

    const reportingInsights = req.params.reportingPeriodType === 'SchoolYear'
      ? await createSchoolYearReportingInsights(filteredSchoolIDs, sdcData, gradData, gdcData)
      : await createSummerReportingInsights(filteredSchoolIDs, gdcData);
    reportingInsights.sort((a, b) => a.schoolName.localeCompare(b.schoolName, undefined, { sensitivity: 'base' }));

    return res.status(200).json(reportingInsights);
  } catch (e) {
    logApiError(e, 'getReportingSummary', 'Error occurred while attempting to GET GDC Reporting summary.');
    return handleExceptionResponse(e, res);
  }
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
  const insights = await Promise.all(schoolIDs
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
  return insights;
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
    let data = await getData(`${config.get('server:gdc:filesetURL')}/paginated`, params);

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
      if(cs.interimPercentage && cs.interimLetterGrade){
        cs.interimGrade = cs.interimPercentage + ' (' + cs.interimLetterGrade + ')';
      }else if(cs.interimPercentage){
        cs.interimGrade = cs.interimPercentage;
      }else{
        cs.interimGrade = cs.interimLetterGrade;
      }
      if(cs.finalPercentage && cs.finalLetterGrade){
        cs.finalGrade = cs.finalPercentage + ' (' + cs.finalLetterGrade + ')';
      }else if(cs.interimPercentage){
        cs.finalGrade = cs.finalPercentage;
      }else{
        cs.finalGrade = cs.finalLetterGrade;
      }
      if(!cs.relatedCourse){
        cs.relatedCourseValue = '-';
      }else if(!cs.relatedLevel){
        cs.relatedCourseValue = '-';
      }else{
        cs.relatedCourseValue = cs.relatedCourse + cs.relatedLevel;
      }
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
  getReportingInsights,
  getSchoolSubmissionCounts
};
