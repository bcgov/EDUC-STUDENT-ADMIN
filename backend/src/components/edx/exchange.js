'use strict';

const {errorResponse, logApiError, logError, postData, getBackendToken, isPdf, isImage} = require('../utils');
const HttpStatus = require('http-status-codes');
const config = require('../../config');
const {getData, getCodeTable, putData} = require('../utils');
const utils = require('../utils');
const {FILTER_OPERATION, VALUE_TYPE, CACHE_KEYS} = require('../../util/constants');
const {LocalDateTime, DateTimeFormatter} = require('@js-joda/core');
const cacheService = require('../cache-service');
const log = require('../logger');

async function claimAllExchanges(req, res) {
  try {
    const token = utils.getBackendToken(req);
    const userInfo = utils.getUser(req);

    const params = new URLSearchParams({
      reviewer: userInfo.idir_username,
      secureExchangeIDs: req.body.secureExchangeIDs
    }).toString();

    await utils.postData(token, config.get('server:edx:claimExchangesURL') + '?' + params, null, null, null);
    return res.status(HttpStatus.OK).json({});
  } catch (e) {
    logApiError(e, 'claimAllExchanges', 'Error occurred while attempting to claim exchanges.');
    return errorResponse(res);
  }
}

async function claimExchange(req, res) {
  try {
    const token = utils.getBackendToken(req);
    if (!token && req.session.userMinCodes) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }
    let params;
    const userInfo = utils.getUser(req);
    if (!req.body.claimedStatus || req.body.currentlyClaimedBy !== userInfo.idir_username) {
      params = new URLSearchParams({
        reviewer: userInfo.idir_username,
        secureExchangeIDs: req.body.secureExchangeIDs
      }).toString();
    } else {
      params = new URLSearchParams({
        reviewer: '',
        secureExchangeIDs: req.body.secureExchangeIDs
      }).toString();
    }
    await utils.postData(token, config.get('server:edx:claimExchangesURL') + '?' + params, null, null, null);
    const thisExchange = await getData(token, config.get('server:edx:exchangeURL') + `/${req.body.secureExchangeIDs}`);

    return res.status(HttpStatus.OK).json(thisExchange);

  } catch (e) {
    logApiError(e, 'claimAllExchanges', 'Error occurred while attempting to claim exchanges.');
    return errorResponse(res);
  }
}

async function getExchanges(req, res) {
  const token = utils.getBackendToken(req);
  if (!token && req.session.userMinCodes) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }

  return Promise.all([
    getCodeTable(token, CACHE_KEYS.EDX_SECURE_EXCHANGE_STATUS, config.get('server:edx:exchangeStatusesURL')),
    getCodeTable(token, CACHE_KEYS.EDX_MINISTRY_TEAMS, config.get('server:edx:ministryTeamURL')),
    getExchangesPaginated(req, res),
  ])
    .then(async ([statusCodeResponse, ministryTeamCodeResponse, dataResponse]) => {
      if (statusCodeResponse && ministryTeamCodeResponse && dataResponse?.content) {
        dataResponse['content'].forEach((element) => {
          if (element['secureExchangeStatusCode']) {
            let tempStatus = statusCodeResponse.find(codeStatus => codeStatus['secureExchangeStatusCode'] === element['secureExchangeStatusCode']);
            if (tempStatus?.label) {
              element['secureExchangeStatusCode'] = tempStatus.label;
            }
          }
          if (element['ministryOwnershipTeamID']) {
            let tempMinTeam = ministryTeamCodeResponse.find(minstryTeam => minstryTeam['ministryOwnershipTeamId'] === element['ministryOwnershipTeamID']);
            if (tempMinTeam?.teamName) {
              element['contactIdentifierName'] = tempMinTeam.teamName;
            }
          }
        });
      }
      return res.status(200).json(dataResponse);
    }).catch(e => {
      logApiError(e, 'getExchanges', 'Error getting paginated list of secure exchanges.');
      return errorResponse(res);
    });
}

async function getExchangesPaginated(req, res) {
  let criteria = [];
  let token = utils.getBackendToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }

  console.log('req.query' + JSON.stringify(req.query));
  let parsedParams = JSON.parse(req.query.searchParams);

  if (req.query.searchParams) {
    if (parsedParams.studentPEN) {
      let studentDetail = await getData(token, config.get('server:student:rootURL') + '?pen=' + parsedParams.studentPEN);
      if(studentDetail[0]){
        parsedParams.studentId = studentDetail[0].studentID;
        delete parsedParams.studentPEN;
      }else{
        return '';
      }
    }
    
    criteria = buildSearchParams(JSON.stringify(parsedParams));
  }

  if (req.query.searchParams.contactIdentifier) {
    criteria.push(getCriteria('secureExchangeContactTypeCode', getContactIdentifierType(req.query.searchParams.contactIdentifier, res), FILTER_OPERATION.EQUAL, VALUE_TYPE.STRING));
  }

  const params = {
    params: {
      pageNumber: req.query.pageNumber,
      pageSize: req.query.pageSize,
      sort: req.query.sort,
      searchCriteriaList: JSON.stringify(criteria),
    }
  };

  return utils.getData(token, config.get('server:edx:exchangeURL') + '/paginated', params);
}

function getCriteria(key, value, operation, valueType) {
  return {key, value, operation, valueType};
}

async function getExchange(req, res) {
  const token = utils.getBackendToken(req);
  if (!token && req.session.userMinCodes) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  } 
  return Promise.all([
    getCodeTable(token, CACHE_KEYS.EDX_SECURE_EXCHANGE_STATUS, config.get('server:edx:exchangeStatusesURL')),
    getCodeTable(token, CACHE_KEYS.EDX_MINISTRY_TEAMS, config.get('server:edx:ministryTeamURL')),
    getData(token, config.get('server:edx:exchangeURL') + `/${req.params.secureExchangeID}`)
  ])
    .then(async ([statusCodeResponse, ministryTeamCodeResponse, dataResponse]) => {

      let school = {};
      let district = {};
      if(dataResponse['secureExchangeContactTypeCode'] === 'SCHOOL') {
        school = cacheService.getSchoolBySchoolID(dataResponse['contactIdentifier']);
      } else {
        district = cacheService.getDistrictJSONByDistrictId(dataResponse['contactIdentifier']);
      }

      if (dataResponse['secureExchangeStatusCode']) {
        let tempStatus = statusCodeResponse.find(codeStatus => codeStatus['secureExchangeStatusCode'] === dataResponse['secureExchangeStatusCode']);
        dataResponse['secureExchangeStatusCode'] = tempStatus?.label ? tempStatus.label : dataResponse['secureExchangeStatusCode'];
      }

      dataResponse['ministryOwnershipTeamName'] = 'Unknown Team';
      if (dataResponse['ministryOwnershipTeamID']) {
        let tempMinTeam = ministryTeamCodeResponse.find(ministryTeam => ministryTeam['ministryOwnershipTeamId'] === dataResponse['ministryOwnershipTeamID']);
        dataResponse['ministryOwnershipTeamName'] = tempMinTeam?.teamName ? tempMinTeam.teamName : dataResponse['ministryOwnershipTeamName'];
        dataResponse['ministryOwnershipGroupRoleIdentifier'] = tempMinTeam?.groupRoleIdentifier ? tempMinTeam.groupRoleIdentifier : '';
      }

      if(dataResponse['secureExchangeContactTypeCode'] === 'SCHOOL') {
        dataResponse['contactName'] = dataResponse['secureExchangeContactTypeCode'] === 'SCHOOL' ? `${school.schoolName} (${school.mincode})` : 'Unknown Contact';
        dataResponse['schoolName'] = school.schoolName;
      }

      if(dataResponse['secureExchangeContactTypeCode'] === 'DISTRICT') {
        dataResponse['contactName'] = district.name + '(' + district.districtNumber+ ')';
        dataResponse['districtName'] = district.name;
      }

      //creating activities list for timeline display on the frontend
      dataResponse['activities'] = [];
      dataResponse['commentsList'].forEach((comment) => {
        let activity = {};
        activity['type'] = 'message';
        activity['isSchool'] = comment.edxUserID ? true : false;
        activity['timestamp'] = comment['commentTimestamp'] ? LocalDateTime.parse(comment['commentTimestamp']) : '';
        if(dataResponse['secureExchangeContactTypeCode'] === 'SCHOOL') {
          activity['actor'] = comment.edxUserID ? school.schoolName : dataResponse['ministryOwnershipTeamName'];
          activity['title'] = comment.edxUserID ? school.schoolName : comment.staffUserIdentifier;
        }
        if(dataResponse['secureExchangeContactTypeCode'] === 'DISTRICT') {
          activity['actor'] = comment.edxUserID ? district.name : dataResponse['ministryOwnershipTeamName'];
          activity['title'] = comment.edxUserID ? district.name : comment.staffUserIdentifier;
        }
        activity['displayDate'] = comment['commentTimestamp'] ? LocalDateTime.parse(comment['commentTimestamp']).format(DateTimeFormatter.ofPattern('uuuu/MM/dd HH:mm')) : 'Unknown Date';
        activity['content'] = comment['content'];
        activity['secureExchangeID'] = comment['secureExchangeID'];
        activity['secureExchangeCommentID'] = comment['secureExchangeCommentID'];
        dataResponse['activities'].push(activity);
      });
      if (dataResponse['documentList']) {
        dataResponse['documentList'].forEach((document) => {
          let activity = {};
          activity['type'] = 'document';
          activity['isSchool'] = document.edxUserID ? true : false;
          activity['timestamp'] = document['createDate'] ? LocalDateTime.parse(document['createDate']) : '';
          activity['actor'] = document.edxUserID ? document.edxUserID : document.staffUserIdentifier;
          if(dataResponse['secureExchangeContactTypeCode'] === 'SCHOOL') {
            activity['title'] = document.edxUserID ? school.schoolName : document.staffUserIdentifier;
          }
          if(dataResponse['secureExchangeContactTypeCode'] === 'DISTRICT') {
            activity['title'] = document.edxUserID ? district.name : document.staffUserIdentifier;
          }
          activity['fileName'] = document.fileName;
          activity['documentType'] = cacheService.getDocumentTypeCodeLabelByCode(document.documentTypeCode);
          activity['displayDate'] = document['createDate'] ? LocalDateTime.parse(document['createDate']).format(DateTimeFormatter.ofPattern('uuuu/MM/dd HH:mm')) : 'Unknown Date';
          activity['documentID'] = document['documentID'];
          dataResponse['activities'].push(activity);
        });
      }
      if (dataResponse['studentsList']) {
        for (const student of dataResponse['studentsList']) {
          let studentDetail = await getData(token, config.get('server:student:rootURL') + '/' + student.studentId);
          let activity = {};
          activity['type'] = 'student';
          activity['isSchool'] = student.edxUserID ? true : false;
          activity['studentID'] = student.studentId;
          activity['secureExchangeStudentId'] = student.secureExchangeStudentId;
          activity['schoolID'] = cacheService.getSchoolJSONByMincode(studentDetail.mincode).schoolID;
          activity['studentPEN'] = studentDetail.pen;
          activity['studentLocalID'] = studentDetail.localID;
          activity['studentSurname'] = studentDetail.legalLastName;
          activity['studentGiven'] = studentDetail.legalFirstName;
          activity['studentMiddle'] = studentDetail.legalMiddleNames;
          activity['studentDOB'] = studentDetail.dob;
          activity['studentGender'] = studentDetail.genderCode;
          activity['timestamp'] = student['createDate'] ? LocalDateTime.parse(student['createDate']) : '';
          activity['actor'] = student.edxUserID ? student.edxUserID : student.staffUserIdentifier;
          if(dataResponse['secureExchangeContactTypeCode'] === 'SCHOOL') {
            activity['title'] = student.edxUserID ? school.schoolName : student.staffUserIdentifier;
          }
          if(dataResponse['secureExchangeContactTypeCode'] === 'DISTRICT') {
            activity['title'] = student.edxUserID ? district.name : student.staffUserIdentifier;
          }
          activity['displayDate'] = student['createDate'] ? LocalDateTime.parse(student['createDate']).format(DateTimeFormatter.ofPattern('uuuu/MM/dd HH:mm')) : 'Unknown Date';
          dataResponse['activities'].push(activity);
        }
      }
      if (dataResponse['noteList']) {
        for (const note of dataResponse['noteList']) {
          let activity = {};
          activity['type'] = 'note';
          activity['timestamp'] = LocalDateTime.parse(note['noteTimestamp']);
          activity['secureExchangeNoteID'] = note.secureExchangeNoteID;
          activity['staffUserIdentifier'] = note.staffUserIdentifier;
          activity['title'] = note.staffUserIdentifier;
          activity['displayDate'] = LocalDateTime.parse(note['noteTimestamp']).format(DateTimeFormatter.ofPattern('uuuu/MM/dd HH:mm'));
          activity['content'] = note['content'];
          dataResponse['activities'].push(activity);
        }
      }
      dataResponse['activities'].sort((activity1, activity2) => {
        return activity2.timestamp.compareTo(activity1.timestamp);
      });

      return res.status(HttpStatus.OK).json(dataResponse);
    }).catch(e => {
      logApiError(e, 'getExchange', 'Error getting secure exchange by ID.');
      return errorResponse(res);
    });
}

async function createExchange(req, res) {
  try {
    const token = utils.getBackendToken(req);
    const userInfo = utils.getUser(req);
    const message = req.body;

    const documentPayload = message.secureExchangeDocuments.map(document => {
      return {
        fileExtension: document.fileExtension,
        documentData: document.documentData,
        documentTypeCode: 'OTHER',
        fileName: document.fileName,
        fileSize: document.fileSize,
        staffUserIdentifier: userInfo.idir_username
      };
    });
    const studentPayload = message.secureExchangeStudents.map(student => {
      return {
        studentId: student.studentID,
        staffUserIdentifier: userInfo.idir_username
      };
    });

    const secureExchangeCreate = {
      contactIdentifier: message.contactIdentifier,
      secureExchangeContactTypeCode: message.secureExchangeContactTypeCode,
      ministryOwnershipTeamID: message.ministryOwnershipTeamID,
      subject: message.subject,
      reviewer: userInfo.idir_username,
      secureExchangeStatusCode: 'OPEN',
      isReadByMinistry: true,
      isReadByExchangeContact: false,
      commentsList: [
        {
          staffUserIdentifier: userInfo.idir_username,
          commentUserName: userInfo.name,
          content: message.content,
          createUser: userInfo.idir_username,
          updateUser: userInfo.idir_username
        }
      ],
      documentList: documentPayload,
      studentList: studentPayload
    };
    const payload ={
      secureExchangeCreate,
      ministryTeamName : message.ministryTeamName,
      schoolID: message.schoolID,
      schoolName: message.schoolName,
      districtID: message.districtID,
      districtName: message.districtName,
    };

    const result = await utils.postData(token, config.get('server:edx:newSecureExchangeSagaURL'), payload, null, userInfo.idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'createExchange', 'Error occurred while attempting to create a new exchange.');
    return errorResponse(res);
  }
}

async function markAs(req, res) {
  const token = utils.getBackendToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }
  try {
    const currentExchange = await getData(token, config.get('server:edx:exchangeURL') + `/${req.params.secureExchangeID}`);
    currentExchange.isReadByMinistry = !currentExchange.isReadByMinistry;
    currentExchange.createDate = null;
    currentExchange.updateDate = null;

    await putData(token, `${config.get('server:edx:exchangeURL')}`, currentExchange);

    return getExchange(req, res);
  } catch (e) {
    logApiError(e, 'markAs', 'Error updating the read status of an exchange');
    return errorResponse(res);
  }
}

async function markExchangeStatusAs(req, res) {
  const token = utils.getBackendToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }

  if (!['open', 'closed'].includes(req.params.status)) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: `Trying to mark exchange with an invalid status ${req.params.status}`
    });
  }
  return Promise.all([
    getCodeTable(token, CACHE_KEYS.EDX_SECURE_EXCHANGE_STATUS, config.get('server:edx:exchangeStatusesURL')),
    getCodeTable(token, CACHE_KEYS.EDX_MINISTRY_TEAMS, config.get('server:edx:ministryTeamURL')),
    getData(token, config.get('server:edx:exchangeURL') + `/${req.params.secureExchangeID}`),
  ])
    .then(async ([statusCodeResponse, ministryTeamCodeResponse, exchange]) => {
      if (statusCodeResponse && ministryTeamCodeResponse && exchange) {
        const userInfo = utils.getUser(req);
        let userRoles = userInfo.realm_access.roles;
        const matchedMinTeam = ministryTeamCodeResponse.find(ministryTeam => ministryTeam['ministryOwnershipTeamId'] === exchange['ministryOwnershipTeamID']);
        let matchedUserRole = userRoles.find(uRole => uRole === matchedMinTeam['groupRoleIdentifier']);
        if (!matchedUserRole) {
          return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'User does not have required role'
          });
        }

        exchange.secureExchangeStatusCode = req.params.status.toUpperCase();
        exchange.createDate = null;
        exchange.updateDate = null;
        await putData(token, `${config.get('server:edx:exchangeURL')}`, exchange);

        return getExchange(req, res);
      }
    }).catch(async e => {
      await logApiError(e, 'markExchangeStatusAs', `Error setting current secure exchange status to ${req.params.status}.`);
      return errorResponse(res);
    });
}

async function getEdxDistrictUsers(req, res) {
  const token = utils.getBackendToken(req);
  try {
    const districtParams = {
      params: {
        districtID: req.params.districtID
      }  
    }
    let response = await getData(token, config.get('server:edx:edxUsersURL'), districtParams);

    let filteredResponse = [];
    filteredResponse = response.map(user => {
      return {
        ...user,
        edxUserSchools: [],
        edxUserDistricts: user.edxUserDistricts.filter(district => district.districtID === req.params.districtID)
      };
    });  
    return res.status(HttpStatus.OK).json(filteredResponse);
  } catch (e) {
    logApiError(e, 'getEdxDistrictUsers', 'Error getting EDX District users');
    return errorResponse(res);
  }
}

async function getEdxSchoolUsers(req, res) {
  const token = utils.getBackendToken(req);
  try {
    const schoolParams = {
      params: {
        schoolID: req.params.schoolID
      }  
    }

    let response = await getData(token, config.get('server:edx:edxUsersURL'), schoolParams);
    
    let filteredResponse = [];
    filteredResponse = response.map(user => {
      return {
        ...user,
        edxUserDistricts: [],
        edxUserSchools: user.edxUserSchools.filter(school => school.schoolID === req.params.schoolID)
      };
    });
    return res.status(HttpStatus.OK).json(filteredResponse);
  } catch (e) {
    logApiError(e, 'getEdxSchoolUsers', 'Error getting EDX School users');
    return errorResponse(res);
  }
}

async function findSchoolPrimaryEdxActivationCode(req, res) {
  const token = utils.getBackendToken(req);
  
  try {
    const data = await getData(token, `${config.get('server:edx:activationCodeUrl')}/primary/SCHOOL/${req.params.instituteIdentifier}`);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    if (e.status === 404) {
      return res.status(HttpStatus.NOT_FOUND).json();
    }
    logApiError(e, 'findSchoolPrimaryEdxActivationCode', 'Error getting findPrimaryEdxActivationCode for school.');
    return errorResponse(res);
  }
}

async function findDistrictPrimaryEdxActivationCode(req, res) {
  const token = utils.getBackendToken(req);
  
  try {
    const data = await getData(token, `${config.get('server:edx:activationCodeUrl')}/primary/DISTRICT/${req.params.instituteIdentifier}`);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    if (e.status === 404) {
      return res.status(HttpStatus.NOT_FOUND).json();
    }
    logApiError(e, 'findDistrictPrimaryEdxActivationCode', 'Error getting findPrimaryEdxActivationCode for district.');
    return errorResponse(res);
  }
}

async function generateOrRegeneratePrimaryEdxActivationSchoolCode(req, res) {
  try {
    const token = utils.getBackendToken(req);
    const userInfo = utils.getUser(req);
    const payload = {
      schoolID: req.params.instituteIdentifier
    };
    const result = await utils.postData(token, `${config.get('server:edx:activationCodeUrl')}/primary/SCHOOL/${req.params.instituteIdentifier}`, payload, null, userInfo.idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'generateOrRegeneratePrimaryEdxActivationSchoolCode', 'Error occurred while attempting to generate a Primary Activation Code for school.');
    return errorResponse(res);
  }
}

async function generateOrRegeneratePrimaryEdxActivationDistrictCode(req, res) {
  try {
    const token = utils.getBackendToken(req);
    const userInfo = utils.getUser(req);
    const payload = {
      districtID: req.params.instituteIdentifier
    };
    const result = await utils.postData(token, `${config.get('server:edx:activationCodeUrl')}/primary/DISTRICT/${req.params.instituteIdentifier}`, payload, null, userInfo.idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'generateOrRegeneratePrimaryEdxActivationDistrictCode', 'Error occurred while attempting to generate a Primary Activation Code for district.');
    return errorResponse(res);
  }
}

async function checkIfPrimaryCodeExists(req,res, token, instituteType, instituteIdentifier){
  try {
    await getData(token, `${config.get('server:edx:activationCodeUrl')}/primary/${instituteType}/${instituteIdentifier}`);
    return true;
  } catch (e) {
    return false;
  }
}

async function districtUserActivationInvite(req, res) {
  const token = utils.getBackendToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }

  if(!await checkIfPrimaryCodeExists(req,res,token,'DISTRICT', req.body.districtID)){
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No primary code exists for this district'
    });
  }

  const payload = {
    ...req.body,
    edxUserExpiryDate: req.body.edxUserExpiryDate
  };
  try {
    const response = await utils.postData(token, config.get('server:edx:districtUserActivationInviteURL'), payload, null, utils.getUser(req).idir_username);
    return res.status(200).json(response);
  } catch (e) {
    await logApiError(e, 'districtUserActivationInvite', 'Error occurred while sending district user activation invite');
    return errorResponse(res);
  }

}
async function schoolUserActivationInvite(req, res) {
  const token = utils.getBackendToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }

  if(!await checkIfPrimaryCodeExists(req,res,token,'SCHOOL', req.body.schoolID)){
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No primary code exists for this school'
    });
  }

  const payload = {
    ...req.body,
    edxUserExpiryDate: req.body.edxUserExpiryDate
  };
  try {
    const response = await utils.postData(token, config.get('server:edx:schoolUserActivationInviteURL'), payload, null, utils.getUser(req).idir_username);
    return res.status(200).json(response);
  } catch (e) {
    await logApiError(e, 'schoolUserActivationInvite', 'Error occurred while sending user activation invite');
    return errorResponse(res);
  }

}

async function updateEdxUserSchoolRoles(req, res) {
  try {
    const token = utils.getBackendToken(req);
    const userInfo = utils.getUser(req);

    let edxUser = await getData(token, `${config.get('server:edx:edxUsersURL')}/${req.body.params.edxUserID}`);
    let selectedUserSchools = edxUser.edxUserSchools.filter(school => school.schoolID === req.body.params.schoolID);
    if (!selectedUserSchools[0]) {
      return errorResponse(res, 'A user school entry was not found for the selected user.', HttpStatus.NOT_FOUND);
    }
    if (selectedUserSchools.length > 1) {
      return errorResponse(res, 'Too many user school entries have been found for the selected user.', HttpStatus.CONFLICT);
    }
    let selectedUserSchool = selectedUserSchools[0];
    let existingUserSchoolRoles = new Map(selectedUserSchool.edxUserSchoolRoles.map(edxUserSchoolRole => [edxUserSchoolRole.edxRoleCode, edxUserSchoolRole]));

    selectedUserSchool.edxUserSchoolRoles = [];
    req.body.params.selectedRoles.forEach(function (role) {
      if (existingUserSchoolRoles.has(role)) {
        selectedUserSchool.edxUserSchoolRoles.push(existingUserSchoolRoles.get(role));
        return;
      }
      let newRole = {};
      newRole.edxUserSchoolID = selectedUserSchool.edxUserSchoolID;
      newRole.edxRoleCode = role;
      newRole.createUser = userInfo.idir_username;
      newRole.updateUser = userInfo.idir_username;
      selectedUserSchool.edxUserSchoolRoles.push(newRole);
    });

    selectedUserSchool.updateDate = null;
    selectedUserSchool.createDate = null;
    selectedUserSchool.expiryDate = req.body.params.expiryDate;

    const result = await utils.putData(token, `${config.get('server:edx:edxUsersURL')}/${selectedUserSchool.edxUserID}/school`, selectedUserSchool, userInfo.idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    await logApiError(e, 'updateEdxUserSchoolRoles', 'Error occurred while attempting to update user roles.');
    return errorResponse(res);
  }
}

async function updateEdxUserDistrictRoles(req, res) {
  try {
    const token = utils.getBackendToken(req);
    const userInfo = utils.getUser(req);

    let edxUser = await getData(token, `${config.get('server:edx:edxUsersURL')}/${req.body.params.edxUserID}`);
    let selectedUserDistricts = edxUser.edxUserDistricts.filter(district => district.districtID === req.body.params.districtId);
    if (!selectedUserDistricts[0]) {
      return errorResponse(res, 'A user district entry was not found for the selected user.', HttpStatus.NOT_FOUND);
    }
    if (selectedUserDistricts.length > 1) {
      return errorResponse(res, 'Too many user district entries have been found for the selected user.', HttpStatus.CONFLICT);
    }
    let selectedUserDistrict = selectedUserDistricts[0];
    let existingUserDistrictRoles = new Map(selectedUserDistrict.edxUserDistrictRoles.map(edxUserDistrictRole => [edxUserDistrictRole.edxRoleCode, edxUserDistrictRole]));

    selectedUserDistrict.edxUserDistrictRoles = [];
    req.body.params.selectedRoles.forEach(function (role) {
      if (existingUserDistrictRoles.has(role)) {
        selectedUserDistrict.edxUserDistrictRoles.push(existingUserDistrictRoles.get(role));
        return;
      }
      let newRole = {};
      newRole.edxUserDistrictID = selectedUserDistrict.edxUserDistrictID;
      newRole.edxRoleCode = role;
      newRole.createUser = userInfo.idir_username;
      newRole.updateUser = userInfo.idir_username;
      selectedUserDistrict.edxUserDistrictRoles.push(newRole);
    });

    selectedUserDistrict.updateDate = null;
    selectedUserDistrict.createDate = null;
    selectedUserDistrict.expiryDate = req.body.params.expiryDate;

    const result = await utils.putData(token, `${config.get('server:edx:edxUsersURL')}/${selectedUserDistrict.edxUserID}/district`, selectedUserDistrict, userInfo.idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    await logApiError(e, 'updateEdxUserDistrictRoles', 'Error occurred while attempting to update user roles.');
    return errorResponse(res);
  }
}

async function createSecureExchangeComment(req, res) {
  try {
    const token = utils.getBackendToken(req);
    const userInfo = utils.getUser(req);
    const message = req.body;
    const secureExchangeComment = {
      secureExchangeID: req.params.secureExchangeID,
      staffUserIdentifier: userInfo.idir_username,
      commentUserName: userInfo.name,
      content: message.content,
      commentTimestamp: LocalDateTime.now().toJSON(),
      createUser: userInfo.idir_username,
      updateUser: userInfo.idir_username
    };

    let payload = {};

    if(message.secureExchangeContactTypeCode === 'SCHOOL') {
      payload = {
        secureExchangeComment,
        secureExchangeContactTypeCode: message.secureExchangeContactTypeCode,
        schoolID: message.contactIdentifier,
        schoolName:message.schoolName,
        sequenceNumber: message.sequenceNumber,
        ministryTeamName:message.ministryTeamName,
        secureExchangeId:message.secureExchangeId,
      };
    } else {
      payload = {
        secureExchangeComment,
        secureExchangeContactTypeCode: message.secureExchangeContactTypeCode,
        districtID: message.contactIdentifier,
        districtName:message.districtName,
        sequenceNumber: message.sequenceNumber,
        ministryTeamName:message.ministryTeamName,
        secureExchangeId:message.secureExchangeId,
      };
    }

    const result = await utils.postData(token, config.get('server:edx:secureExchangeCommentSagaURL') , payload, null, userInfo.idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    await logApiError(e, 'createExchangeComment', 'Error occurred while attempting to create a new exchange comment.');
    return errorResponse(res);
  }
}

/**
 * Returns an array of search criteria objects to query EDX API
 *
 * @param searchParams object with keys of the columns we are searching for
 */
const buildSearchParams = (searchParams) => {
  return Object.entries(JSON.parse(searchParams))
    .map(([key, value]) => createSearchParamObject(key, value));
};

/**
 * Returns an object that has the following properties key, value, operation, valueType
 * Helper function when building search params for querying EDX API
 *
 * @param key of what we are searching in
 * @param value of what we are searching for
 */
const createSearchParamObject = (key, value) => {
  let operation = FILTER_OPERATION.CONTAINS_IGNORE_CASE;
  let valueType = VALUE_TYPE.STRING;

  if (key === 'sequenceNumber') {
    operation = FILTER_OPERATION.EQUAL;
  } else if (key === 'ministryOwnershipTeamID') {
    operation = FILTER_OPERATION.EQUAL;
    valueType = VALUE_TYPE.UUID;
  } else if (key === 'studentId') {
    key = 'secureExchangeStudents.studentId';
    operation = FILTER_OPERATION.EQUAL;
    valueType = VALUE_TYPE.UUID;
  } else if (key === 'createDate') {
    value.forEach((date, index) => {
      value[index] = date;
    });
    if (value.length === 1) {
      value.push(LocalDateTime.parse(value[0]).plusHours(23).plusMinutes(59).plusSeconds(59));
    }
    value = value.join(',');
    operation = FILTER_OPERATION.BETWEEN;
    valueType = VALUE_TYPE.DATE_TIME;
  } else if (key === 'secureExchangeStatusCode') {
    value = value.join(',');
    operation = FILTER_OPERATION.IN;
  } else if (key === 'reviewer' && value === 'Unclaimed') {
    value = null;
    operation = FILTER_OPERATION.EQUAL;
  }
  
  return {key, value, operation, valueType};
};

const getContactIdentifierType = (contactIdentifier, res) => {
  let data = cacheService.getAllSchoolsJSON();
  let isPresent = data.some(school => school.schoolID === contactIdentifier);
  if (isPresent) {
    return 'SCHOOL';
  } else {
    logApiError(null, 'getContactIdentifierType', 'Error occurred while attempting to get the identifier type.');
    return errorResponse(res);
  }
};

const uploadDocumentToExchange = async (req, res) => {
  try {
    const token = utils.getBackendToken(req);

    const userName = utils.getUser(req).idir_username;

    const document = {
      fileExtension: req.body.fileExtension,
      documentData: req.body.documentData,
      documentTypeCode: 'OTHER',
      fileName: req.body.fileName,
      fileSize: req.body.fileSize,
      staffUserIdentifier: userName
    };

    const params = {
      headers: {
        correlationID: req.session.correlationID,
      }
    };
    const result = await postData(token, config.get('server:edx:exchangeURL') + '/' + req.params.secureExchangeID + '/documents', document, params, userName);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    return errorResponse(res, e.data?.message, e.status);
  }
};

async function removeDocumentFromExchange(req, res){
  try {
    const token = utils.getBackendToken(req);
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }
    const result = await utils.deleteData(token, config.get('server:edx:exchangeURL') + `/${req.params.secureExchangeID}/documents/${req.params.documentID}`);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    await logApiError(e, 'removeDocumentFromExchange', 'Error occurred while attempting to remove a document from an exchange.');
    return errorResponse(res);
  }
}

async function removeUserSchoolAccess(req, res) {
  try {
    const token = utils.getBackendToken(req);
    await utils.deleteData(token, config.get('server:edx:edxUsersURL') + `/${req.body.params.userToRemove}` + '/school' + `/${req.body.params.userSchoolID}`);
    return res.status(HttpStatus.OK).json('');
  } catch (e) {
    log.error(e, 'removeUserSchoolAccess', 'Error occurred while attempting to remove school user access.');
    return errorResponse(res);
  }
}

async function removeUserDistrictAccess(req, res) {
  try {
    const token = utils.getBackendToken(req);
    await utils.deleteData(token, config.get('server:edx:edxUsersURL') + `/${req.body.params.userToRemove}` + '/district' + `/${req.body.params.edxUserDistrictID}`);
    return res.status(HttpStatus.OK).json('');
  } catch (e) {
    log.error(e, 'removeUserDistrictAccess', 'Error occurred while attempting to remove district user access.');
    return errorResponse(res);
  }
}

function getExchangeDocumentById() {
  return async function getDocumentByIdHandler(req, res) {
    const token = getBackendToken(req);
    const url = `${config.get('server:edx:exchangeURL')}/${req.params.secureExchangeID}/documents/${req.params.documentId}`;
    getData(token, url).then(resultData => {
      res.setHeader('Content-type', resultData.fileExtension);
      if(isImage(resultData)){
        res.setHeader('Content-disposition', 'attachment; filename=' + resultData.fileName?.replace(/ /g, '_').replace(/,/g, '_').trim());
        return res.status(200).send(resultData.documentData);
      } else if(isPdf(resultData)){
        res.setHeader('Content-disposition', 'inline; filename=' + resultData.fileName?.replace(/ /g, '_').replace(/,/g, '_').trim());
        return res.status(200).send(Buffer.from(resultData.documentData, 'base64'));
      } else {
        res.setHeader('Content-disposition', 'attachment; filename=' + resultData.fileName?.replace(/ /g, '_').replace(/,/g, '_').trim());
        return res.status(200).send(Buffer.from(resultData.documentData, 'base64'));
      }
    }).catch(error => {
      log.error('An error occurred attempting to get documents.');
      log.error(error);
      return res.status(500).json();
    });
  };
}

async function relinkUserSchoolAccess(req, res) {
  try {
    const token = getBackendToken(req);
    const userName = utils.getUser(req).idir_username;

    let edxUserDetails = await getData(token, config.get('server:edx:edxUsersURL') + '/' + req.body.params.userToRelink);
    let payload = {};
    let userSchool = edxUserDetails.edxUserSchools.find(school => school.schoolID === req.body.params.schoolID);
    let activationRoles = userSchool.edxUserSchoolRoles.map(role => role.edxRoleCode);
    payload = {
      schoolID: req.body.params.schoolID,
      schoolName: cacheService.getSchoolBySchoolID(req.body.params.schoolID).schoolName,
      edxActivationRoleCodes: activationRoles,
      firstName: edxUserDetails.firstName,
      lastName: edxUserDetails.lastName,
      email: edxUserDetails.email,
      edxUserId: req.body.params.userToRelink,
      edxUserSchoolID: req.body.params.userSchoolID,
      edxUserExpiryDate: req.body.params.edxUserExpiryDate
    };
    await postData(token, config.get('server:edx:exchangeURL') + '/school-user-activation-relink-saga', payload,null, userName);
    return res.status(HttpStatus.OK).json('');
  } catch (e) {
    log.error(e, 'relinkUserSchoolAccess', 'Error occurred while attempting to relink user school access.');
    return errorResponse(res);
  }
}

async function relinkUserDistrictAccess(req, res) {
  try {
    const token = getBackendToken(req);
    const userName = utils.getUser(req).idir_username;

    let edxUserDetails = await getData(token, config.get('server:edx:edxUsersURL') + '/' + req.body.params.userToRelink);
    let payload = {};

    let userDistrict = edxUserDetails.edxUserDistricts.find(district => district.districtID === req.body.params.districtID);
    let activationRoles = userDistrict.edxUserDistrictRoles.map(role => role.edxRoleCode);
    payload = {
      districtID: req.body.params.districtID,
      districtName: cacheService.getDistrictJSONByDistrictId(req.body.params.districtID).name,
      edxActivationRoleCodes: activationRoles,
      firstName: edxUserDetails.firstName,
      lastName: edxUserDetails.lastName,
      email: edxUserDetails.email,
      edxUserId: req.body.params.userToRelink,
      edxUserDistrictID: req.body.params.edxUserDistrictID,
      edxUserExpiryDate: req.body.params.edxUserExpiryDate
    };
    await postData(token, config.get('server:edx:exchangeURL') + '/district-user-activation-relink-saga', payload,null, userName);

    return res.status(HttpStatus.OK).json('');
  } catch (e) {
    log.error(e, 'relinkUserDistrictAccess', 'Error occurred while attempting to relink user district access.');
    return errorResponse(res);
  }
}

async function createSecureExchangeStudent(req, res) {
  try {
    const accessToken = getBackendToken(req);
    const userName = utils.getUser(req).idir_username;
    if (!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    if(!req.session.roles.includes('SECURE_EXCHANGE')){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        message: 'You are not authorized to access this page'
      });
    }

    const attachedSecureExchangeStudents = await getData(accessToken, `${config.get('server:edx:exchangeURL')}/${req.params.secureExchangeID}/students`);
    if (attachedSecureExchangeStudents && attachedSecureExchangeStudents?.some((student) => student.studentId === req.body.studentID)) {
      return errorResponse(res, 'Error adding student to an existing secure exchange. Student already attached.', HttpStatus.CONFLICT);
    }

    const secureExchangeStudent = {
      staffUserIdentifier: userName,
      studentId: req.body.studentID
    };

    const result = await postData(accessToken,`${config.get('server:edx:exchangeURL')}/${req.params.secureExchangeID}/students`, secureExchangeStudent,null, userName );
    return res.status(HttpStatus.CREATED).json(result);
  } catch (e) {
    log.error(e, 'createSecureExchangeStudent', 'Error occurred while attempting to add a secure exchange student.');
    return errorResponse(res);
  }
}

async function removeSecureExchangeStudent(req, res){
  try {
    const accessToken = getBackendToken(req);
    if (!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    if(!req.session.roles.includes('SECURE_EXCHANGE')){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        message: 'You are not authorized to access this page'
      });
    }

    const result = await utils.deleteData(accessToken, config.get('server:edx:exchangeURL') + `/${req.params.secureExchangeID}/students/${req.params.studentID}`);
    return res.status(HttpStatus.OK).json(result);

  } catch (e) {
    log.error(e, 'removeSecureExchangeStudent', 'Error occurred while attempting to remove a secure exchange student.');
    return errorResponse(res);
  }
}

async function createSecureExchangeNote(req, res) {
  try {
    const token = utils.getBackendToken(req);
    const userInfo = utils.getUser(req);

    if(!req.session.roles.includes('SECURE_EXCHANGE')){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        message: 'You are not authorized to access this page'
      });
    }

    const payload = {
      secureExchangeID: req.params.secureExchangeID,
      staffUserIdentifier: userInfo.idir_username,
      content: req.body.content,
      noteTimestamp: LocalDateTime.now().format(DateTimeFormatter.ofPattern('yyyy-MM-dd\'T\'HH:mm:ss')),
    };

    const result = await utils.postData(token, `${config.get('server:edx:exchangeURL')}/${req.params.secureExchangeID}/notes` , payload, null, userInfo.idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    await logApiError(e, 'createExchangeNote', 'Error occurred while attempting to create a new exchange note.');
    return errorResponse(res);
  }
}

async function removeSecureExchangeNote(req, res) {
  try {
    const accessToken = getBackendToken(req);
    const userInfo = utils.getUser(req);
    if (!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    if(!req.session.roles.includes('SECURE_EXCHANGE')){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        message: 'You are not authorized to access this page'
      });
    }

    let secureExchange = await getData(accessToken, `${config.get('server:edx:exchangeURL')}/${req.params.secureExchangeID}`);
    if (!secureExchange) {
      return res.status(HttpStatus.NOT_FOUND).json();
    }
    let noteToDelete = secureExchange.noteList.find(note => note.secureExchangeNoteID === req.params.noteID);
    if (!noteToDelete) {
      return res.status(HttpStatus.NOT_FOUND).json();
    }
    if (noteToDelete.staffUserIdentifier !== userInfo.idir_username) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        message: 'This note was added by another person; you don\'t have permission to delete it.'
      });
    }

    const result = await utils.deleteData(accessToken, `${config.get('server:edx:exchangeURL')}/${req.params.secureExchangeID}/notes/${req.params.noteID}`);
    return res.status(HttpStatus.OK).json(result);

  } catch (e) {
    log.error(e, 'removeSecureExchangeNote', 'Error occurred while attempting to remove a secure exchange note.');
    return errorResponse(res);
  }
}

async function getExchangeStats(req, res) {
  try {
    const token = utils.getBackendToken(req);

    if (!req.session.roles.includes('SECURE_EXCHANGE')) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        message: 'You are not authorized to access this page'
      });
    }

    let ministryTeamCodeResponse = await getCodeTable(token, CACHE_KEYS.EDX_MINISTRY_TEAMS, config.get('server:edx:ministryTeamURL'));

    let ministryTeam = ministryTeamCodeResponse.find(minTeam => minTeam['groupRoleIdentifier'] === req.params.teamRole);
    if (!ministryTeam) {
      await logError('getExchangeStats','Error occurred while getting secure exchange statistics. Ministry team not found');
      return errorResponse(res, 'Team not found for statistics', HttpStatus.NOT_FOUND);
    }

    let searchCriteriaList = [
      {
        key: 'ministryOwnershipTeamID',
        operation: FILTER_OPERATION.EQUAL,
        value: ministryTeam.ministryOwnershipTeamId,
        valueType: VALUE_TYPE.UUID
      },
      {
        key: 'secureExchangeStatusCode',
        operation: FILTER_OPERATION.EQUAL,
        value: 'OPEN',
        valueType: VALUE_TYPE.STRING
      }
    ];

    const paramsOpen = {
      params: {
        pageNumber: 1,
        searchCriteriaList: JSON.stringify(searchCriteriaList),
      }
    };

    let openMessages = await utils.getData(token,config.get('server:edx:exchangeURL') + '/paginated', paramsOpen).then(response => response?.totalElements);

    searchCriteriaList.push({
      key: 'isReadByMinistry',
      operation: FILTER_OPERATION.EQUAL,
      value: 'false',
      valueType: VALUE_TYPE.BOOLEAN
    });

    const paramsOpenAndUnread = {
      params: {
        pageNumber: 1,
        searchCriteriaList: JSON.stringify(searchCriteriaList)
      }
    };

    let unreadMessages = await utils.getData(token,config.get('server:edx:exchangeURL') + '/paginated', paramsOpenAndUnread).then(response => response?.totalElements);

    return res.status(HttpStatus.OK).json({unreadMessages, openMessages});

  } catch (e) {
    await logApiError(e, 'getExchangeStats','Error occurred while getting secure exchange statistics.');
  }
}

async function createSchool(req, res) {
  try {
    if (!req.session.roles.includes('SCHOOL_ADMIN')) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        message: 'You are not authorized to add or edit schools'
      });
    }

    const {school, user} = req.body;

    const isEmptyString = str => typeof str === 'string' && str.trim() === '';
    const userHasEmptyVals = Object.values(user)
      .reduce((result, currentValue) => result || isEmptyString(currentValue), false);

    const payload = {
      school: {
        ...school,
        districtId: school.districtID
      },
      initialEdxUser: userHasEmptyVals ? null : user
    };
    delete payload.school.districtID;

    const token = utils.getBackendToken(req);
    const userInfo = utils.getUser(req);

    const result = await utils
      .postData(token, `${config.get('server:edx:createSchoolSagaURL')}`, payload, null, userInfo.idir_username);

    return res.status(HttpStatus.ACCEPTED).json(result);
  } catch (e) {
    await logApiError(e, 'createSchool', 'Error occurred while starting a create school saga.');
    return errorResponse(res);
  }
}

module.exports = {
  getExchanges,
  createExchange,
  getExchange,
  claimAllExchanges,
  markAs,
  getEdxSchoolUsers,
  getEdxDistrictUsers,
  findSchoolPrimaryEdxActivationCode,
  findDistrictPrimaryEdxActivationCode,
  generateOrRegeneratePrimaryEdxActivationDistrictCode,
  generateOrRegeneratePrimaryEdxActivationSchoolCode,
  updateEdxUserSchoolRoles,
  updateEdxUserDistrictRoles,
  schoolUserActivationInvite,
  createSecureExchangeComment,
  uploadDocumentToExchange,
  getExchangeDocumentById,
  markExchangeStatusAs,
  claimExchange,
  removeDocumentFromExchange,
  removeUserSchoolAccess,
  removeUserDistrictAccess,
  relinkUserSchoolAccess,
  relinkUserDistrictAccess,
  createSecureExchangeStudent,
  removeSecureExchangeStudent,
  createSecureExchangeNote,
  getExchangeStats,
  removeSecureExchangeNote,
  districtUserActivationInvite,
  createSchool
};
