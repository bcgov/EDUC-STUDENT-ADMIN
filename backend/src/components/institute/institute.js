'use strict';
const { logApiError, getData, errorResponse, getBackendToken, validateAccessToken} = require('../utils');
const HttpStatus = require('http-status-codes');
const cacheService = require('../cache-service');
const {FILTER_OPERATION, VALUE_TYPE, CONDITION} = require('../../util/constants');
const config = require('../../config');
const {LocalDateTime, LocalDate, DateTimeFormatter} = require('@js-joda/core');
const utils = require('../utils');
const _ = require('lodash');
const {isDistrictActive, isSchoolOrAuthorityClosedOrNeverOpened} = require('./instituteUtils');

async function getCachedDistricts(req, res) {
  try {
    if (req.query.refreshCache === 'true') {
      await cacheService.loadAllDistrictsToMap();
    }
    const districts = req.query.active === 'true' ? cacheService.getAllActiveDistrictsJSON() : cacheService.getAllDistrictsJSON();
    return res.status(HttpStatus.OK).json(districts);
  } catch (e) {
    logApiError(e, 'getDistricts', 'Error occurred while attempting to GET district entity.');
    return errorResponse(res);
  }
}

async function getCachedSchoolCategoryFacilityTypes(req,res){
  return res.status(HttpStatus.OK).json(cacheService.getSchoolCategoryAllowedFacilityMap());
}

function getCachedInstituteData(cacheKey,url){
  return  async function handler(req, res) {
    try {
      if (req.query.refreshCache === 'true') {
        await cacheService.loadDataToCache(cacheKey, url);
      }
      const cachedData = cacheService.getCachedData();
      const dataResponse = req.query.active === 'true' ? cachedData[cacheKey].activeRecords : cachedData[cacheKey].records;
      return res.status(HttpStatus.OK).json(dataResponse);
    } catch (e) {
      logApiError(e, 'getCachedInstituteDate', `Error occurred while attempting to GET ${cacheKey}.`);
      return errorResponse(res);
    }
  };
}


async function getDistricts(req, res) {
  const token = getBackendToken(req);
  try {
    const url = `${config.get('server:institute:instituteDistrictURL')}`;
    const data = await getData(token, url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getDistricts', 'Error occurred while attempting to GET all districts.');
    return errorResponse(res);
  }
}

async function addDistrictContact(req, res) {
  try {
    const token = getBackendToken(req);

    let district = cacheService.getDistrictJSONByDistrictId(req.body.districtID);
    if(!district || !hasDistrictAdminRole(req)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }

    if(!isDistrictActive(district)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Unable to add contact for an inactive district'
      });
    }

    const url = `${config.get('server:institute:instituteDistrictURL')}/${req.body.districtID}/contact`;

    const payload = {
      districtContactTypeCode: req.body.districtContactTypeCode,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      jobTitle: req.body.jobTitle,
      phoneNumber: req.body.phoneNumber,
      phoneExtension: req.body.phoneExtension,
      alternatePhoneNumber: req.body.alternatePhoneNumber,
      alternatePhoneExtension: req.body.alternatePhoneExtension,
      effectiveDate: req.body.effectiveDate ? req.body.effectiveDate : null,
      expiryDate: req.body.expiryDate ? req.body.expiryDate : null
    };

    const data = await utils.postData(token, url, payload, null, utils.getUser(req).idir_username);

    return res.status(HttpStatus.OK).json(data);
  }catch (e) {
    logApiError(e, 'addDistrictContact', 'Error occurred while attempting to create a district contact.');
    return errorResponse(res);
  }
}

async function getCachedDistrictByDistrictId(req, res) {
  try {
    const districtId = req.params.districtId;
    return res.status(HttpStatus.OK).json(cacheService.getDistrictJSONByDistrictId(districtId));
  } catch (e) {
    logApiError(e, 'getCachedDistrictByDistrictId', 'Error occurred while attempting to GET District entity.');
    return errorResponse(res);
  }
}

async function getDistrictByDistrictID(req, res) {
  const token = getBackendToken(req);
  try {
    const url = `${config.get('server:institute:rootURL')}/district/${req.params.districtId}`;
    const data = await getData(token, url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getDistrictByID', 'Error occurred while attempting to GET district entity.');
    return errorResponse(res);
  }
}

async function updateDistrict(req, res) {
  try {
    const token = getBackendToken(req);

    let district = cacheService.getDistrictJSONByDistrictId(req.body.districtId);

    if (!district || !hasDistrictAdminRole(req)) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }
    const districtPayload = req.body;

    districtPayload.addresses.forEach(function(addy) {
      addy.updateDate = null;
      addy.createDate = null;
    });

    districtPayload.notes.forEach(function(note) {
      note.updateDate = null;
      note.createDate = null;
    });

    districtPayload.contacts.forEach(function(contact) {
      contact.updateDate = null;
      contact.createDate = null;
    });

    districtPayload.createDate = null;
    districtPayload.updateDate = null;
    districtPayload.updateUser = utils.getUser(req).idir_username;

    const result = await utils.putData(token, config.get('server:institute:instituteDistrictURL') + '/' + districtPayload.districtId, districtPayload, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);

  }catch(e)
  {
    await logApiError(e, 'updateDistrict', 'Error occurred while attempting to update a district.');
    return errorResponse(res);
  }

}

async function updateDistrictContact(req, res) {
  try {
    const token = getBackendToken(req);

    let district = cacheService.getDistrictJSONByDistrictId(req.body.districtId);
    if(!district || !hasDistrictAdminRole(req)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }

    if(!isDistrictActive(district)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Unable to update contact for an inactive district'
      });
    }

    const params = req.body;
    params.updateDate = null;
    params.createDate = null;
    params.updateUser = utils.getUser(req).idir_username;

    const result = await utils.putData(token, `${config.get('server:institute:instituteDistrictURL')}/${req.body.districtId}/contact/${req.params.contactId}` , params, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'updateDistrictContact', 'Error occurred while attempting to update a district contact.');
    return errorResponse(res);
  }
}

async function deleteDistrictContact(req, res) {
  try {
    const token = getBackendToken(req);

    let district = cacheService.getDistrictJSONByDistrictId(req.params.districtId);
    if(!district || !hasDistrictAdminRole(req)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }

    if(!isDistrictActive(district)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Unable to delete contact for an inactive district'
      });
    }

    const contact =  await utils.getData(token, `${config.get('server:institute:instituteDistrictURL')}/${req.params.districtId}/contact/${req.params.contactId}`);

    if (!contact) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'District contact not found'
      });
    }

    contact.createDate = null;
    contact.updateDate = null;
    contact.updateUser = utils.getUser(req).idir_username;
    contact.expiryDate = LocalDate.now().atStartOfDay().format(DateTimeFormatter.ofPattern('yyyy-MM-dd\'T\'HH:mm:ss'));

    await utils.putData(token, config.get('server:institute:instituteDistrictURL') + '/' + req.params.districtId + '/contact/'+ req.params.contactId , contact, utils.getUser(req).idir_username);

    return res.status(HttpStatus.OK).json(HttpStatus.NO_CONTENT);
  } catch (e) {
    await logApiError(e, 'deleteDistrictContact', 'Error occurred while attempting to remove a district contact.');
    return errorResponse(res);
  }
}

async function addNewDistrictNote(req, res) {
  try {
    const token = getBackendToken(req);

    let district = cacheService.getDistrictJSONByDistrictId(req.body.districtId);
    if(!district || !hasDistrictAdminRole(req)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }
    const params = {
      districtId: req.body.districtId,
      content: req.body.content
    };
    const result = await utils.postData(token, `${config.get('server:institute:instituteDistrictURL')}/${req.body.districtId}/note`, params, null, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'addNewDistrictNote', 'Error occurred while attempting to add a new district note.');
    return errorResponse(res);
  }
}

async function updateDistrictNote(req, res) {
  if (req.params.noteId !== req.body.noteId) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'The noteId in the URL didn\'t match the noteId in the request body.'
    });
  }
  try {
    const token = getBackendToken(req);
    let district = cacheService.getDistrictJSONByDistrictId(req.body.districtId);
    if(!district || !hasDistrictAdminRole(req)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }
    const payload = {
      noteId: req.body.noteId,
      districtId: req.body.districtId,
      content: req.body.content
    };
    const result = await utils.putData(token, `${config.get('server:institute:instituteDistrictURL')}/${req.body.districtId}/note/${req.params.noteId}`, payload, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'updateDistrictNote', 'Error occurred while attempting to save the changes to the district note.');
    return errorResponse(res);
  }
}

async function deleteDistrictNote(req, res) {
  try {
    const token = getBackendToken(req);
    let district = cacheService.getDistrictJSONByDistrictId(req.params.districtId);
    if(!district || !hasDistrictAdminRole(req)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }
    await utils.deleteData(token, `${config.get('server:institute:instituteDistrictURL')}/${req.params.districtId}/note/${req.params.noteId}`);
    return res.status(HttpStatus.OK).json(HttpStatus.NO_CONTENT);
  } catch (e) {
    await logApiError(e, 'deleteDistrictNote', 'An error occurred while attempting to remove a district note.');
    return errorResponse(res);
  }
}

async function getSchools(req, res) {
  const token = getBackendToken(req);
  try {
    const url = `${config.get('server:institute:instituteSchoolURL')}`;
    const data = await getData(token, url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getSchools', 'Error occurred while attempting to GET all schools.');
    return errorResponse(res);
  }
}

async function getCachedSchools(req, res) {
  if (req.query.refreshCache === 'true') {
    await cacheService.loadAllSchoolsToMap();
  }
  try {
    let schools = req.query.active === 'true' ? cacheService.getAllActiveSchoolsJSON() : cacheService.getAllSchoolsJSON();
    return res.status(HttpStatus.OK).json(schools);
  } catch (e) {
    logApiError(e, 'getSchools', 'Error occurred while attempting to GET school entity.');
    return errorResponse(res);
  }
}

async function getCachedSchoolBySchoolID(req, res) {
  try {
    const schoolID = req.params.schoolID;
    return res.status(HttpStatus.OK).json(cacheService.getSchoolBySchoolID(schoolID));
  } catch (e) {
    logApiError(e, 'getCachedSchoolBySchoolID', 'Error occurred while attempting to GET School entity.');
    return errorResponse(res);
  }
}

async function addSchool(req, res) {
  try {
    const token = getBackendToken(req);

    if(!hasSchoolAdminRole(req, req.body)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }

    const payload = {
      createUser: utils.getUser(req).idir_username,
      createDate: null,
      updateUser: utils.getUser(req).idir_username,
      updateDate: null,
      districtId: req.body.districtID,
      independentAuthorityId: req.body.independentAuthorityId,
      faxNumber: req.body.faxNumber,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      website: req.body.website,
      displayName: req.body.displayName,
      displayNameNoSpecialChars: req.body.displayNameNoSpecialChars,
      schoolReportingRequirementCode: req.body.schoolReportingRequirementCode,
      schoolOrganizationCode: req.body.schoolOrganizationCode,
      schoolCategoryCode: req.body.schoolCategoryCode,
      facilityTypeCode: req.body.facilityTypeCode,
      openedDate: req.body.openedDate ? req.body.openedDate : null,
      closedDate: null,
      addresses: [],
      grades: [],
      neighborhoodLearning: []
    };

    //set addresses, grade codes and Neighborhood Learning Codes
    if(req.body.mailingAddrLine1 !== null){
      let mailingAddress = {
        'createUser': utils.getUser(req).idir_username,
        'updateUser': utils.getUser(req).idir_username,
        'createDate': null,
        'updateDate': null,
        'addressId': null,
        'addressLine1': req.body.mailingAddrLine1,
        'addressLine2': req.body.mailingAddrLine2,
        'city': req.body.mailingAddrCity,
        'postal': req.body.mailingAddrPostal,
        'addressTypeCode': 'MAILING',
        'provinceCode': req.body.mailingAddrProvince,
        'countryCode': req.body.mailingAddrCountry,
      };
      payload.addresses.push(mailingAddress);
    }

    if(req.body.physicalAddrLine1 !== null){
      let physicalAddress = {
        'createUser': utils.getUser(req).idir_username,
        'updateUser': utils.getUser(req).idir_username,
        'createDate': null,
        'updateDate': null,
        'addressLine1': req.body.physicalAddrLine1,
        'addressLine2': req.body.physicalAddrLine2,
        'city': req.body.physicalAddrCity,
        'postal': req.body.physicalAddrPostal,
        'addressTypeCode': 'PHYSICAL',
        'provinceCode': req.body.physicalAddrProvince,
        'countryCode': req.body.physicalAddrCountry,
      };
      payload.addresses.push(physicalAddress);
    }


    if(req.body.neighborhoodLearning) {
      payload.neighborhoodLearning = req.body.neighborhoodLearning;
    }

    if(req.body.grades){
      payload.grades = req.body.grades;
    }

    const data = await utils.postData(token, config.get('server:institute:instituteSchoolURL'), payload, null, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    logApiError(e, 'addSchool', 'Error occurred while attempting to POST School entity.');
    return errorResponse(res, e.data.message);
  }
}

async function addNewSchoolNote(req, res) {
  try {
    const token = getBackendToken(req);

    let school = cacheService.getSchoolBySchoolID(req.body.schoolId);
    if(!school || !hasSchoolAdminRole(req, school)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }

    const params = {
      content: req.body.content,
      schoolId: req.body.schoolId
    };
    const result = await utils.postData(token, `${config.get('server:institute:instituteSchoolURL')}/${req.body.schoolId}/note`, params, null, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'addNewSchoolNote', 'Error occurred while attempting to add a new school note.');
    return errorResponse(res);
  }
}

async function updateSchoolNote(req, res) {
  if (req.params.noteId !== req.body.noteId) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'The noteId in the URL didn\'t match the noteId in the request body.'
    });
  }
  try {
    const token = getBackendToken(req);
    let school = cacheService.getSchoolBySchoolID(req.body.schoolId);
    if (!school || !hasSchoolAdminRole(req, school)) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }
    const payload = {
      noteId: req.body.noteId,
      schoolId: req.body.schoolId,
      content: req.body.content
    };
    const result = await utils.putData(token, `${config.get('server:institute:instituteSchoolURL')}/${req.body.schoolId}/note/${req.params.noteId}`, payload, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'updateSchoolNote', 'Error occurred while attempting to save the changes to the school note.');
    return errorResponse(res);
  }
}

async function deleteSchoolNote(req, res) {
  try {
    const token = getBackendToken(req);
    let school = cacheService.getSchoolBySchoolID(req.params.schoolId);
    if(!school || !hasSchoolAdminRole(req, school)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }
    await utils.deleteData(token, `${config.get('server:institute:instituteSchoolURL')}/${req.params.schoolId}/note/${req.params.noteId}`);
    return res.status(HttpStatus.OK).json(HttpStatus.NO_CONTENT);
  } catch (e) {
    await logApiError(e, 'deleteSchoolNote', 'An error occurred while attempting to remove a school note.');
    return errorResponse(res);
  }
}

async function addSchoolContact(req, res) {
  try {
    const token = getBackendToken(req);

    let school = cacheService.getSchoolBySchoolID(req.body.schoolID);
    if(!school || !hasSchoolAdminRole(req, school)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }

    if (isSchoolOrAuthorityClosedOrNeverOpened(school)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Unable to add contact for a closed or never opened school'
      });
    }

    const url = `${config.get('server:institute:instituteSchoolURL')}/${req.body.schoolID}/contact`;

    const payload = {
      schoolContactTypeCode: req.body.schoolContactTypeCode,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      jobTitle: req.body.jobTitle,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      phoneExtension: req.body.phoneExtension,
      alternatePhoneNumber: req.body.alternatePhoneNumber,
      alternatePhoneExtension: req.body.alternatePhoneExtension,
      effectiveDate: req.body.effectiveDate ? req.body.effectiveDate : null,
      expiryDate: req.body.expiryDate ? req.body.expiryDate : null
    };

    const data = await utils.postData(token, url, payload, null, utils.getUser(req).idir_username);

    return res.status(HttpStatus.OK).json(data);
  }catch (e) {
    logApiError(e, 'addSchoolContact', 'Error occurred while attempting to create a school contact.');
    return errorResponse(res);
  }
}

async function updateSchoolContact(req, res) {
  try {
    const token = getBackendToken(req);

    let school = cacheService.getSchoolBySchoolID(req.body.schoolID);
    if(!school || !hasSchoolAdminRole(req, school)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }

    if (isSchoolOrAuthorityClosedOrNeverOpened(school)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Unable to update contacts for a closed or never opened school'
      });
    }

    const params = req.body;
    params.updateDate = null;
    params.createDate = null;
    params.updateUser = utils.getUser(req).idir_username;
    params.effectiveDate = params.effectiveDate ? req.body.effectiveDate : null;
    params.expiryDate = req.body.expiryDate ? req.body.expiryDate : null;
    params.expiryDate = req.body.expiryDate ? req.body.expiryDate : null;

    const result = await utils.putData(token, config.get('server:institute:instituteSchoolURL') + '/' + req.body.schoolID + '/contact/'+ req.params.contactId , params, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'updateSchoolContact', 'Error occurred while attempting to update a school contact.');
    return errorResponse(res);
  }
}

async function deleteSchoolContact(req, res) {
  try {
    const token = getBackendToken(req);

    let school = cacheService.getSchoolBySchoolID(req.params.schoolId);
    if(!school || !hasSchoolAdminRole(req, school)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }

    if (isSchoolOrAuthorityClosedOrNeverOpened(school)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Unable to delete contacts for a closed or never opened school'
      });
    }

    const contact =  await utils.getData(token, `${config.get('server:institute:instituteSchoolURL')}/${req.params.schoolId}/contact/${req.params.contactId}`);

    if (!contact) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'School contact not found'
      });
    }

    contact.createDate = null;
    contact.updateDate = null;
    contact.updateUser = utils.getUser(req).idir_username;
    contact.expiryDate = LocalDate.now().atStartOfDay().format(DateTimeFormatter.ofPattern('yyyy-MM-dd\'T\'HH:mm:ss'));

    await utils.putData(token, config.get('server:institute:instituteSchoolURL') + '/' + req.params.schoolId + '/contact/'+ req.params.contactId , contact, utils.getUser(req).idir_username);

    return res.status(HttpStatus.OK).json(HttpStatus.NO_CONTENT);
  } catch (e) {
    await logApiError(e, 'deleteSchoolContact', 'Error occurred while attempting to remove a school contact.');
    return errorResponse(res);
  }
}

async function addAuthorityContact(req, res) {
  try {
    const token = getBackendToken(req);

    let authority = cacheService.getAuthorityJSONByAuthorityId(req.body.authorityID);
    if(!authority || !hasAuthorityAdminRole(req, authority)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }

    if(isSchoolOrAuthorityClosedOrNeverOpened(authority)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Unable to add contact for an closed or never opened authority'
      });
    }

    const url = `${config.get('server:institute:instituteAuthorityURL')}/${req.body.authorityID}/contact`;

    const payload = {
      authorityContactTypeCode: req.body.authorityContactTypeCode,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      jobTitle: req.body.jobTitle,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      phoneExtension: req.body.phoneExtension,
      alternatePhoneNumber: req.body.alternatePhoneNumber,
      alternatePhoneExtension: req.body.alternatePhoneExtension,
      effectiveDate: req.body.effectiveDate ? req.body.effectiveDate : null,
      expiryDate: req.body.expiryDate ? req.body.expiryDate : null
    };

    const data = await utils.postData(token, url, payload, null, utils.getUser(req).idir_username);

    return res.status(HttpStatus.OK).json(data);
  }catch (e) {
    logApiError(e, 'addAuthorityContact', 'Error occurred while attempting to create an authority contact.');
    return errorResponse(res);
  }
}

async function updateAuthorityContact(req, res) {
  try {
    const token = getBackendToken(req);

    let authority = cacheService.getAuthorityJSONByAuthorityId(req.body.independentAuthorityId);
    if(!authority || !hasAuthorityAdminRole(req, authority)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }

    if(isSchoolOrAuthorityClosedOrNeverOpened(authority)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Unable to update contact for an closed or never opened authority'
      });
    }

    const params = req.body;
    params.updateDate = null;
    params.createDate = null;
    params.updateUser = utils.getUser(req).idir_username;

    const result = await utils.putData(token, config.get('server:institute:instituteAuthorityURL') + '/' + req.body.independentAuthorityId + '/contact/'+ req.params.contactId , params, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'updateAuthorityContact', 'Error occurred while attempting to update an authority contact.');
    return errorResponse(res);
  }
}

async function deleteAuthorityContact(req, res) {
  try {
    const token = getBackendToken(req);

    let authority = cacheService.getAuthorityJSONByAuthorityId(req.params.independentAuthorityId);
    if(!authority || !hasAuthorityAdminRole(req, authority)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }

    if(isSchoolOrAuthorityClosedOrNeverOpened(authority)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Unable to delete contact for an closed or never opened authority'
      });
    }

    const contact =  await utils.getData(token, `${config.get('server:institute:instituteAuthorityURL')}/${req.params.independentAuthorityId}/contact/${req.params.contactId}`);

    if (!contact) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'Independent authority contact not found'
      });
    }

    contact.createDate = null;
    contact.updateDate = null;
    contact.updateUser = utils.getUser(req).idir_username;
    contact.expiryDate = LocalDate.now().atStartOfDay().format(DateTimeFormatter.ofPattern('yyyy-MM-dd\'T\'HH:mm:ss'));

    await utils.putData(token, config.get('server:institute:instituteAuthorityURL') + '/' + req.params.independentAuthorityId + '/contact/'+ req.params.contactId , contact, utils.getUser(req).idir_username);

    return res.status(HttpStatus.OK).json(HttpStatus.NO_CONTENT);
  } catch (e) {
    await logApiError(e, 'deleteAuthorityContact', 'Error occurred while attempting to remove an authority contact.');
    return errorResponse(res);
  }
}

async function addAuthority(req, res) {
  try {
    const token = getBackendToken(req);

    if(!hasAuthorityAdminRole(req)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }

    const url = `${config.get('server:institute:instituteAuthorityURL')}`;

    const payload = {

      displayName: req.body.authorityName,
      authorityTypeCode: req.body.authorityTypeCode,
      openedDate: req.body.openDate ? req.body.openDate : null,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      faxNumber: req.body.faxNumber,
      addresses: []
    };

    if(req.body.mailingAddrLine1 !== null){
      let mailingAddress = {
        'createUser': null,
        'updateUser': null,
        'createDate': null,
        'updateDate': null,
        'addressId': null,
        'schoolId': null,
        'districtId': null,
        'independentAuthorityId': null,
        'addressLine1': req.body.mailingAddrLine1,
        'addressLine2': req.body.mailingAddrLine2,
        'city': req.body.mailingAddrCity,
        'postal': req.body.mailingAddrPostal,
        'addressTypeCode': 'MAILING',
        'provinceCode': req.body.mailingAddrProvince,
        'countryCode': req.body.mailingAddrCountry,
      };
      payload.addresses.push(mailingAddress);
    }

    if(req.body.physicalAddrLine1 !== null){
      let physicalAddress = {
        'createUser': null,
        'updateUser': null,
        'createDate': null,
        'updateDate': null,
        'addressId': null,
        'schoolId': null,
        'districtId': null,
        'independentAuthorityId': null,
        'addressLine1': req.body.physicalAddrLine1,
        'addressLine2': req.body.physicalAddrLine2,
        'city': req.body.physicalAddrCity,
        'postal': req.body.physicalAddrPostal,
        'addressTypeCode': 'PHYSICAL',
        'provinceCode': req.body.physicalAddrProvince,
        'countryCode': req.body.physicalAddrCountry,
      };
      payload.addresses.push(physicalAddress);
    }

    const data = await utils.postData(token, url, payload, null, utils.getUser(req).idir_username);

    return res.status(HttpStatus.OK).json(data);
  }catch (e) {
    logApiError(e, 'addAuthority', 'Error occurred while attempting to create an authority.');
    return errorResponse(res);
  }
}

async function updateAuthority(req, res) {
  try {
    const token = getBackendToken(req);

    let authority = cacheService.getAuthorityJSONByAuthorityId(req.params.id);
    if(!authority || !hasAuthorityAdminRole(req, authority)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }

    let authorityPayload = req.body;

    if(authorityPayload.authorityTypeCode === 'OFFSHORE'){
      authorityPayload.addresses = authorityPayload.addresses.filter(address => address.addressTypeCode !== 'PHYSICAL');
    }

    authorityPayload.addresses.forEach(function(addy) {
      addy.updateDate = null;
      addy.createDate = null;
    });

    authorityPayload.notes.forEach(function(note) {
      note.updateDate = null;
      note.createDate = null;
    });

    authorityPayload.contacts.forEach(function(contact) {
      contact.updateDate = null;
      contact.createDate = null;
    });

    authorityPayload.createDate = null;
    authorityPayload.updateDate = null;
    authorityPayload.updateUser = utils.getUser(req).idir_username;
    const result = await utils.putData(token, config.get('server:institute:instituteAuthorityURL') + '/' + req.params.id, authorityPayload, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'updateAuthority', 'Error occurred while attempting to update an authority.');
    return errorResponse(res);
  }
}

function hasDistrictAdminRole(req){
  return req.session.roles.includes('DISTRICT_ADMIN');
}

function hasSchoolAdminRole(req, school){
  if(school.schoolCategoryCode === 'INDEPEND' || school.schoolCategoryCode === 'INDP_FNS'){
    return req.session.roles.includes('SCHOOL_ADMIN') || req.session.roles.includes('INDEPENDENT_SCHOOLS_ADMIN');
  } else if(school.schoolCategoryCode === 'OFFSHORE'){
    return req.session.roles.includes('SCHOOL_ADMIN') || req.session.roles.includes('OFFSHORE_SCHOOLS_ADMIN');
  }

  return req.session.roles.includes('SCHOOL_ADMIN');
}

function hasAuthorityAdminRole(req, authority){
  if(authority && authority.authorityTypeCode === 'INDEPENDNT') {
    return req.session.roles.includes('INDEPENDENT_AUTHORITY_ADMIN') || req.session.roles.includes('INDEPENDENT_SCHOOLS_ADMIN');
  } else if(authority && authority.authorityTypeCode === 'OFFSHORE'){
    return req.session.roles.includes('INDEPENDENT_AUTHORITY_ADMIN') || req.session.roles.includes('OFFSHORE_SCHOOLS_ADMIN');
  }
  return req.session.roles.includes('INDEPENDENT_AUTHORITY_ADMIN');
}

async function getSchoolByID(req, res) {
  const token = getBackendToken(req);
  try {
    const url = `${config.get('server:institute:rootURL')}/school/${req.params.id}`;
    const data = await getData(token, url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getSchoolByID', 'Error occurred while attempting to GET school entity.');
    return errorResponse(res);
  }
}

async function updateSchool(req, res) {
  try {
    const token = getBackendToken(req);

    let school = cacheService.getSchoolBySchoolID(req.body.schoolId);

    if (!school || !hasSchoolAdminRole(req, school)) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }
    const payload = req.body;

    payload.addresses?.forEach(function(addy) {
      addy.updateDate = null;
      addy.createDate = null;
    });

    payload.notes?.forEach(function(note) {
      note.updateDate = null;
      note.createDate = null;
    });

    payload.contacts?.forEach(function(contact) {
      contact.updateDate = null;
      contact.createDate = null;
    });

    payload.createDate = null;
    payload.updateDate = null;
    payload.updateUser = utils.getUser(req).idir_username;
    const nlcObjectsArray = [];
    const gradesObjectArray = [];

    for (const nlcCode of payload.neighborhoodLearning) {
      //when there is an update in frontend to neigborhoodlearning system adds array of codes to the payload
      if (_.isString(nlcCode)) {
        nlcObjectsArray.push({
          neighborhoodLearningTypeCode: nlcCode,
          schoolId: payload.schoolId
        });
      } else {
        //if neighborhood learning was not changed as part of edit , it will be passed as an array of objects from frontend.
        nlcObjectsArray.push({
          neighborhoodLearningTypeCode: nlcCode.neighborhoodLearningTypeCode,
          schoolId: payload.schoolId
        });
      }
    }
    for (const gradeCode of payload.grades) {
      //when there is an update in frontend to grades system adds array of codes to the payload
      if (_.isString(gradeCode)) {
        gradesObjectArray.push({
          schoolGradeCode: gradeCode,
          schoolId: payload.schoolId
        });
      } else {
        //if grades was not changed as part of edit , it will be passed as an array of objects from frontend.
        gradesObjectArray.push({
          schoolGradeCode: gradeCode.schoolGradeCode,
          schoolId: payload.schoolId
        });
      }

    }
    payload.neighborhoodLearning = nlcObjectsArray;
    payload.grades=gradesObjectArray;
    const result = await utils.putData(token, config.get('server:institute:instituteSchoolURL') + '/' + payload.schoolId, payload, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);

  }catch(e)
  {
    await logApiError(e, 'updateSchool', 'Error occurred while attempting to update a school.');
    return errorResponse(res);
  }
  
}

async function getSchoolsPaginated(req, res){
  try {
    const accessToken = getBackendToken(req);
    validateAccessToken(accessToken, res);

    let parsedParams = '';
    if (req.query.searchParams) {
      parsedParams = req.query.searchParams;
    }

    const schoolSearchCriteria = [{
      condition: null,
      searchCriteriaList: createSchoolSearchCriteria(parsedParams),
    }];

    const schoolSearchParam = {
      params: {
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        sort: req.query.sort,
        searchCriteriaList: JSON.stringify(schoolSearchCriteria)
      }
    };
    
    let response = await getData(accessToken, config.get('server:institute:rootURL') + '/school/paginated', schoolSearchParam);
    return res.status(HttpStatus.OK).json(response);
  } catch (e) {
    logApiError(e, 'getSchoolsPaginated', 'Error occurred while attempting to GET schools paginated.');
    return errorResponse(res);
  }
}

async function moveSchool(req, res) {
  try {
    const token = getBackendToken(req);

    if(!hasSchoolAdminRole(req, req.body.toSchool)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }

    const incomingPayload = req.body;
    incomingPayload.toSchool.openedDate = incomingPayload.toSchool.moveDate;
    incomingPayload.toSchool.createDate = null;
    incomingPayload.toSchool.updateDate = null;
    incomingPayload.toSchool.createUser = utils.getUser(req).idir_username;
    incomingPayload.toSchool.updateUser = utils.getUser(req).idir_username;
    incomingPayload.toSchool.addresses = [];

    incomingPayload.toSchool.notes.forEach(function(note) {
      note.updateDate = null;
      note.createDate = null;
    });

    incomingPayload.toSchool.contacts.forEach(function(contact) {
      contact.updateDate = null;
      contact.createDate = null;
    });

    // set addresses, grade codes and Neighborhood Learning Codes
    if(req.body.toSchool.mailingAddrLine1 !== null){
      let mailingAddress = {
        'createUser': utils.getUser(req).idir_username,
        'updateUser': utils.getUser(req).idir_username,
        'createDate': null,
        'updateDate': null,
        'addressId': null,
        'addressLine1': req.body.toSchool.mailingAddrLine1,
        'addressLine2': req.body.toSchool.mailingAddrLine2,
        'city': req.body.toSchool.mailingAddrCity,
        'postal': req.body.toSchool.mailingAddrPostal,
        'addressTypeCode': 'MAILING',
        'provinceCode': req.body.toSchool.mailingAddrProvince,
        'countryCode': req.body.toSchool.mailingAddrCountry,
      };
      incomingPayload.toSchool.addresses.push(mailingAddress);
    }

    if(req.body.toSchool.physicalAddrLine1 !== null){
      let physicalAddress = {
        'createUser': utils.getUser(req).idir_username,
        'updateUser': utils.getUser(req).idir_username,
        'createDate': null,
        'updateDate': null,
        'addressLine1': req.body.toSchool.physicalAddrLine1,
        'addressLine2': req.body.toSchool.physicalAddrLine2,
        'city': req.body.toSchool.physicalAddrCity,
        'postal': req.body.toSchool.physicalAddrPostal,
        'addressTypeCode': 'PHYSICAL',
        'provinceCode': req.body.toSchool.physicalAddrProvince,
        'countryCode': req.body.toSchool.physicalAddrCountry,
      };
      incomingPayload.toSchool.addresses.push(physicalAddress);
    }

    const payload = {
      toSchool: incomingPayload.toSchool,
      moveDate: incomingPayload.toSchool.moveDate,
      fromSchoolId: req.body.fromSchoolId
    };

    const data = await utils.postData(token, config.get('server:edx:moveSchoolSagaURL'), payload, null, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    logApiError(e, 'moveSchool', 'Error occurred while attempting to POST School entity.');
    return errorResponse(res, e.data.message);
  }
}

async function getSchoolHistoryPaginated(req, res) {
  try {
    const accessToken = getBackendToken(req);
    validateAccessToken(accessToken, res);

    let parsedParams = '';
    if (req.query.searchParams) {
      parsedParams = req.query.searchParams;
    }

    const historySearchCriteria = [{
      condition: null,
      searchCriteriaList: createSchoolSearchCriteria(parsedParams),
    }];
    const schoolHistorySearchParam = {
      params: {
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        sort: req.query.sort,
        searchCriteriaList: JSON.stringify(historySearchCriteria)
      }
    };
    let response = await getData(accessToken, config.get('server:institute:rootURL') + '/school/history/paginated', schoolHistorySearchParam);
    return res.status(HttpStatus.OK).json(response);
  } catch (e) {
    logApiError(e, 'getSchoolsPaginated', 'Error occurred while attempting to GET schools paginated.');
    return errorResponse(res);
  }
}

function createSchoolSearchCriteria(searchParams){

  let searchCriteriaList = [];

  Object.keys(searchParams).forEach(function(key){
    let pValue = searchParams[key];
    if(key === 'status'){
      let currentDate = LocalDateTime.now();

      if(pValue === 'Open'){
        searchCriteriaList.push({key: 'openedDate', operation: FILTER_OPERATION.LESS_THAN_OR_EQUAL_TO, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.AND});
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.EQUAL, value: null, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
      } else if (pValue === 'Opening'){
        searchCriteriaList.push({key: 'openedDate', operation: FILTER_OPERATION.GREATER_THAN, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.AND});
      } else if (pValue === 'Closing'){
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.GREATER_THAN, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.AND});
      } else if (pValue === 'Closed'){
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.LESS_THAN_OR_EQUAL_TO, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.AND});
      } else if (pValue === 'NeverOpened'){
        searchCriteriaList.push({key: 'openedDate', operation: FILTER_OPERATION.EQUAL, value: null, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.EQUAL, value: null, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
      } else if (pValue === 'NotClosed'){
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.GREATER_THAN, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.OR});
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.EQUAL, value: null, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR});
      } else if(pValue === 'isOpenOrOpening'){
        searchCriteriaList.push({key: 'openedDate', operation: FILTER_OPERATION.LESS_THAN_OR_EQUAL_TO, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.AND});
        searchCriteriaList.push({key: 'openedDate', operation: FILTER_OPERATION.GREATER_THAN, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.OR});
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.EQUAL, value: null, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
      }
    }
    if(key === 'pubEarlyLearning'){
      searchCriteriaList.push({key: 'schoolCategoryCode', operation: FILTER_OPERATION.IN, value: 'EAR_LEARN,PUBLIC', valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
    }
    if(key === 'schoolID'){
      searchCriteriaList.push({key: 'schoolId', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND});
    }
    if(key === 'districtID'){
      searchCriteriaList.push({key: 'districtID', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND});
    }
    if(key === 'authorityID'){
      searchCriteriaList.push({key: 'independentAuthorityId', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND});
    }
    if(key === 'type'){
      searchCriteriaList.push({key: 'facilityTypeCode', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
    }
    if(key === 'category'){
      searchCriteriaList.push({key: 'schoolCategoryCode', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
    }
    if(key === 'schoolReportingRequirementCode'){
      searchCriteriaList.push({key: 'schoolReportingRequirementCode', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
    }
  });

  return searchCriteriaList;
}

async function getAuthorities(req, res) {
  const token = getBackendToken(req);
  try {
    const url = `${config.get('server:institute:instituteAuthorityURL')}`;
    const data = await getData(token, url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getAuthorities', 'Error occurred while attempting to GET all authorities.');
    return errorResponse(res);
  }
}

async function getCachedAuthorities(req, res) {
  try {
    if (req.query.refreshCache === 'true') {
      await cacheService.loadAllAuthoritiesToMap();
    }
    const authorities = req.query.active === 'true' ? cacheService.getAllActiveAuthoritiesJSON() : cacheService.getAllAuthoritiesJSON();
    return res.status(HttpStatus.OK).json(authorities);
  } catch (e) {
    logApiError(e, 'getCachedAuthorities', 'Error occurred while attempting to GET all authorities cached.');
    return errorResponse(res);
  }
}

async function getAuthorityByID(req, res) {
  const token = getBackendToken(req);
  try {
    const url = `${config.get('server:institute:rootURL')}/authority/${req.params.id}`;
    const data = await getData(token, url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getAuthorityByID', 'Error occurred while attempting to GET authority entity.');
    return errorResponse(res);
  }
}

async function addNewAuthorityNote(req, res) {
  try {
    const token = getBackendToken(req);

    let authority = cacheService.getAuthorityJSONByAuthorityId(req.body.independentAuthorityId);

    if(!authority || !hasAuthorityAdminRole(req, authority)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }

    const params = {
      content: req.body.content,
      independentAuthorityId: req.body.independentAuthorityId
    };
    const result = await utils.postData(token, `${config.get('server:institute:instituteAuthorityURL')}/${req.body.independentAuthorityId}/note`, params, null, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'addNewAuthorityNote', 'Error occurred while attempting to add a new authority note.');
    return errorResponse(res);
  }
}

async function updateAuthorityNote(req, res) {
  if (req.params.noteId !== req.body.noteId) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'The noteId in the URL didn\'t match the noteId in the request body.'
    });
  }
  try {
    const token = getBackendToken(req);
    let authority = cacheService.getAuthorityJSONByAuthorityId(req.body.independentAuthorityId);
    if(!authority || !hasAuthorityAdminRole(req, authority)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }
    const payload = {
      noteId: req.body.noteId,
      independentAuthorityId: req.body.independentAuthorityId,
      content: req.body.content
    };
    const result = await utils.putData(token, `${config.get('server:institute:instituteAuthorityURL')}/${req.body.independentAuthorityId}/note/${req.params.noteId}`, payload, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'updateAuthorityNote', 'Error occurred while attempting to save the changes to the authority note.');
    return errorResponse(res);
  }
}

async function deleteAuthorityNote(req, res) {
  try {
    const token = getBackendToken(req);
    let authority = cacheService.getAuthorityJSONByAuthorityId(req.params.independentAuthorityId);
    if(!authority || !hasAuthorityAdminRole(req, authority)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }
    await utils.deleteData(token, `${config.get('server:institute:instituteAuthorityURL')}/${req.params.independentAuthorityId}/note/${req.params.noteId}`);
    return res.status(HttpStatus.OK).json(HttpStatus.NO_CONTENT);
  } catch (e) {
    await logApiError(e, 'deleteAuthorityNote', 'An error occurred while attempting to remove an authority note.');
    return errorResponse(res);
  }
}

async function getCachedAuthorityByAuthorityID(req, res) {
  try {
    const authorityID = req.params.authorityID;
    return res.status(HttpStatus.OK).json(cacheService.getAuthorityJSONByAuthorityId(authorityID));
  } catch (e) {
    logApiError(e, 'getCachedAuthorityByAuthorityID', 'Error occurred while attempting to GET Authority entity.');
    return errorResponse(res);
  }
}

async function getAuthoritiesPaginated(req, res){
  const accessToken = getBackendToken(req);
  validateAccessToken(accessToken, res);

  let parsedParams = '';
  if (req.query.searchParams) {
    parsedParams = req.query.searchParams;
  }

  const authoritySearchCriteria = [{
    condition: null,
    searchCriteriaList: createAuthoritySearchCriteria(parsedParams),
  }];

  const authoritySearchParam = {
    params: {
      pageNumber: req.query.pageNumber,
      pageSize: req.query.pageSize,
      sort: req.query.sort,
      searchCriteriaList: JSON.stringify(authoritySearchCriteria)
    }
  };
  let response = await getData(accessToken, config.get('server:institute:rootURL') + '/authority/paginated', authoritySearchParam);
  return res.status(HttpStatus.OK).json(response);
}

function createAuthoritySearchCriteria(searchParams){
  let searchCriteriaList = [];

  Object.keys(searchParams).forEach(function(key){
    let pValue = searchParams[key];
    if(key === 'status'){
      let currentDate = LocalDateTime.now();

      if(pValue === 'Open'){
        searchCriteriaList.push({key: 'openedDate', operation: FILTER_OPERATION.LESS_THAN_OR_EQUAL_TO, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.AND});
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.EQUAL, value: null, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
      } else if (pValue === 'Closing'){
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.GREATER_THAN, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.AND});
      } else if (pValue === 'Closed'){
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.LESS_THAN_OR_EQUAL_TO, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.AND});
      }
    }
    if(key === 'authorityID'){
      searchCriteriaList.push({key: 'independentAuthorityId', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND});
    }
    if(key === 'type'){
      searchCriteriaList.push({key: 'authorityTypeCode', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
    }
  });

  return searchCriteriaList;
}

module.exports = {
  getCachedDistricts,
  getCachedDistrictByDistrictId,
  getDistrictByDistrictID,
  updateDistrictContact,
  getSchools,
  getDistricts,
  getSchoolsPaginated,
  getAuthorities,
  getAuthoritiesPaginated,
  getAuthorityByID,
  getSchoolByID,
  getCachedSchools,
  getCachedSchoolBySchoolID,
  getCachedAuthorityByAuthorityID,
  getCachedAuthorities,
  addNewSchoolNote,
  updateSchoolNote,
  deleteSchoolNote,
  updateSchoolContact,
  updateAuthority,
  addAuthorityContact,
  deleteAuthorityContact,
  updateAuthorityContact,
  addNewAuthorityNote,
  updateAuthorityNote,
  deleteAuthorityNote,
  getCachedSchoolCategoryFacilityTypes,
  updateSchool,
  addSchool,
  addSchoolContact,
  deleteSchoolContact,
  getCachedInstituteData,
  updateDistrict,
  addAuthority,
  addNewDistrictNote,
  updateDistrictNote,
  deleteDistrictNote,
  addDistrictContact,
  deleteDistrictContact,
  getSchoolHistoryPaginated,
  moveSchool
};
