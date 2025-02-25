'use strict';
const { logApiError, getData, errorResponse } = require('../utils');
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
  try {
    const url = `${config.get('server:institute:instituteDistrictURL')}`;
    const data = await getData(url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getDistricts', 'Error occurred while attempting to GET all districts.');
    return errorResponse(res);
  }
}

async function addDistrictContact(req, res) {
  try {
    let district = cacheService.getDistrictJSONByDistrictId(req.body.districtID);
    if(!district){
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'District not found'
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

    const data = await utils.postData(url, payload, null, utils.getUser(req).idir_username);

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
  try {
    const url = `${config.get('server:institute:rootURL')}/district/${req.params.districtId}`;
    const data = await getData(url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getDistrictByID', 'Error occurred while attempting to GET district entity.');
    return errorResponse(res);
  }
}

async function updateDistrict(req, res) {
  try {
    let district = cacheService.getDistrictJSONByDistrictId(req.body.districtId);

    if (!district) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'District not found'
      });
    }
    const districtPayload = req.body;

    districtPayload.addresses.forEach(function(addy) {
      addy.updateDate = null;
      addy.createDate = null;
    });

    districtPayload.contacts = null;
    districtPayload.createDate = null;
    districtPayload.updateDate = null;
    districtPayload.updateUser = utils.getUser(req).idir_username;

    const result = await utils.putData(config.get('server:institute:instituteDistrictURL') + '/' + districtPayload.districtId, districtPayload, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);

  }catch(e)
  {
    await logApiError(e, 'updateDistrict', 'Error occurred while attempting to update a district.');
    return errorResponse(res);
  }

}

async function updateDistrictContact(req, res) {
  try {
    let district = cacheService.getDistrictJSONByDistrictId(req.body.districtId);
    if(!district){
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'District not found'
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

    const result = await utils.putData(`${config.get('server:institute:instituteDistrictURL')}/${req.body.districtId}/contact/${req.params.contactId}` , params, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'updateDistrictContact', 'Error occurred while attempting to update a district contact.');
    return errorResponse(res);
  }
}

async function deleteDistrictContact(req, res) {
  try {
    let district = cacheService.getDistrictJSONByDistrictId(req.params.districtId);
    if(!district){
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'District not found'
      });
    }

    if(!isDistrictActive(district)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Unable to delete contact for an inactive district'
      });
    }

    const contact =  await utils.getData(`${config.get('server:institute:instituteDistrictURL')}/${req.params.districtId}/contact/${req.params.contactId}`);

    if (!contact) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'District contact not found'
      });
    }

    contact.createDate = null;
    contact.updateDate = null;
    contact.updateUser = utils.getUser(req).idir_username;
    contact.expiryDate = LocalDate.now().atStartOfDay().format(DateTimeFormatter.ofPattern('yyyy-MM-dd\'T\'HH:mm:ss'));

    await utils.putData(config.get('server:institute:instituteDistrictURL') + '/' + req.params.districtId + '/contact/'+ req.params.contactId , contact, utils.getUser(req).idir_username);

    return res.status(HttpStatus.OK).json(HttpStatus.NO_CONTENT);
  } catch (e) {
    await logApiError(e, 'deleteDistrictContact', 'Error occurred while attempting to remove a district contact.');
    return errorResponse(res);
  }
}

async function getDistrictNotes(req, res) {
  try {
    let district = cacheService.getDistrictJSONByDistrictId(req.params.districtId);
    if(!district){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'You do not have the required access for this function'
      });
    }
    const result = await getData(`${config.get('server:institute:instituteDistrictURL')}/${req.params.districtId}/note`);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'getDistrictNotes', 'Error occurred while attempting to add a retrieve district notes.');
    return errorResponse(res);
  }
}

async function addNewDistrictNote(req, res) {
  try {
    let district = cacheService.getDistrictJSONByDistrictId(req.body.districtId);
    if(!district){
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'District not found'
      });
    }
    const params = {
      districtId: req.body.districtId,
      content: req.body.content
    };
    const result = await utils.postData(`${config.get('server:institute:instituteDistrictURL')}/${req.body.districtId}/note`, params, null, utils.getUser(req).idir_username);
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
    let district = cacheService.getDistrictJSONByDistrictId(req.body.districtId);
    if(!district){
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'District not found'
      });
    }
    const payload = {
      noteId: req.body.noteId,
      districtId: req.body.districtId,
      content: req.body.content
    };
    const result = await utils.putData(`${config.get('server:institute:instituteDistrictURL')}/${req.body.districtId}/note/${req.params.noteId}`, payload, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'updateDistrictNote', 'Error occurred while attempting to save the changes to the district note.');
    return errorResponse(res);
  }
}

async function deleteDistrictNote(req, res) {
  try {
    let district = cacheService.getDistrictJSONByDistrictId(req.params.districtId);
    if(!district){
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'District not found'
      });
    }
    await utils.deleteData(`${config.get('server:institute:instituteDistrictURL')}/${req.params.districtId}/note/${req.params.noteId}`);
    return res.status(HttpStatus.OK).json(HttpStatus.NO_CONTENT);
  } catch (e) {
    await logApiError(e, 'deleteDistrictNote', 'An error occurred while attempting to remove a district note.');
    return errorResponse(res);
  }
}

async function getSchools(req, res) {
  try {
    const url = `${config.get('server:institute:instituteSchoolURL')}`;
    const data = await getData(url);
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

    if(['INDEPEND', 'INDP_FNS'].includes(payload.schoolCategoryCode)) {
      await setIssueTranscriptAndCertificatesFlags(payload);
    }

    const data = await utils.postData(config.get('server:institute:instituteSchoolURL'), payload, null, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    logApiError(e, 'addSchool', 'Error occurred while attempting to POST School entity.');
    return errorResponse(res, e.data.message);
  }
}

async function addNewSchoolNote(req, res) {
  try {
    const params = {
      content: req.body.content,
      schoolId: req.body.schoolId
    };
    const result = await utils.postData(`${config.get('server:institute:instituteSchoolURL')}/${req.body.schoolId}/note`, params, null, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'addNewSchoolNote', 'Error occurred while attempting to add a new school note.');
    return errorResponse(res);
  }
}

async function getSchoolNotes(req, res) {
  try {
    const result = await getData(`${config.get('server:institute:instituteSchoolURL')}/${req.params.schoolId}/note`);

    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'getSchoolNotes', 'Error occurred while attempting to get school notes.');
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
    const payload = {
      noteId: req.body.noteId,
      schoolId: req.body.schoolId,
      content: req.body.content
    };
    const result = await utils.putData(`${config.get('server:institute:instituteSchoolURL')}/${req.body.schoolId}/note/${req.params.noteId}`, payload, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'updateSchoolNote', 'Error occurred while attempting to save the changes to the school note.');
    return errorResponse(res);
  }
}

async function deleteSchoolNote(req, res) {
  try {
    await utils.deleteData(`${config.get('server:institute:instituteSchoolURL')}/${req.params.schoolId}/note/${req.params.noteId}`);
    return res.status(HttpStatus.OK).json(HttpStatus.NO_CONTENT);
  } catch (e) {
    await logApiError(e, 'deleteSchoolNote', 'An error occurred while attempting to remove a school note.');
    return errorResponse(res);
  }
}

async function addSchoolContact(req, res) {
  try {
    let school = cacheService.getSchoolBySchoolID(req.body.schoolID);
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

    const data = await utils.postData(url, payload, null, utils.getUser(req).idir_username);

    return res.status(HttpStatus.OK).json(data);
  }catch (e) {
    logApiError(e, 'addSchoolContact', 'Error occurred while attempting to create a school contact.');
    return errorResponse(res);
  }
}

async function updateSchoolContact(req, res) {
  try {
    let school = cacheService.getSchoolBySchoolID(req.body.schoolID);
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

    const result = await utils.putData(config.get('server:institute:instituteSchoolURL') + '/' + req.body.schoolID + '/contact/'+ req.params.contactId , params, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'updateSchoolContact', 'Error occurred while attempting to update a school contact.');
    return errorResponse(res);
  }
}

async function deleteSchoolContact(req, res) {
  try {
    let school = cacheService.getSchoolBySchoolID(req.params.schoolId);
    if (isSchoolOrAuthorityClosedOrNeverOpened(school)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Unable to delete contacts for a closed or never opened school'
      });
    }

    const contact =  await utils.getData(`${config.get('server:institute:instituteSchoolURL')}/${req.params.schoolId}/contact/${req.params.contactId}`);

    if (!contact) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'School contact not found'
      });
    }

    contact.createDate = null;
    contact.updateDate = null;
    contact.updateUser = utils.getUser(req).idir_username;
    contact.expiryDate = LocalDate.now().atStartOfDay().format(DateTimeFormatter.ofPattern('yyyy-MM-dd\'T\'HH:mm:ss'));

    await utils.putData(config.get('server:institute:instituteSchoolURL') + '/' + req.params.schoolId + '/contact/'+ req.params.contactId , contact, utils.getUser(req).idir_username);

    return res.status(HttpStatus.OK).json(HttpStatus.NO_CONTENT);
  } catch (e) {
    await logApiError(e, 'deleteSchoolContact', 'Error occurred while attempting to remove a school contact.');
    return errorResponse(res);
  }
}

async function addAuthorityContact(req, res) {
  try {
    let authority = cacheService.getAuthorityJSONByAuthorityId(req.body.authorityID);

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

    const data = await utils.postData(url, payload, null, utils.getUser(req).idir_username);

    return res.status(HttpStatus.OK).json(data);
  }catch (e) {
    logApiError(e, 'addAuthorityContact', 'Error occurred while attempting to create an authority contact.');
    return errorResponse(res);
  }
}

async function updateAuthorityContact(req, res) {
  try {
    let authority = cacheService.getAuthorityJSONByAuthorityId(req.body.independentAuthorityId);

    if(isSchoolOrAuthorityClosedOrNeverOpened(authority)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Unable to update contact for an closed or never opened authority'
      });
    }

    const params = req.body;
    params.updateDate = null;
    params.createDate = null;
    params.updateUser = utils.getUser(req).idir_username;

    const result = await utils.putData(config.get('server:institute:instituteAuthorityURL') + '/' + req.body.independentAuthorityId + '/contact/'+ req.params.contactId , params, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'updateAuthorityContact', 'Error occurred while attempting to update an authority contact.');
    return errorResponse(res);
  }
}

async function deleteAuthorityContact(req, res) {
  try {
    let authority = cacheService.getAuthorityJSONByAuthorityId(req.params.independentAuthorityId);

    if(isSchoolOrAuthorityClosedOrNeverOpened(authority)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Unable to delete contact for an closed or never opened authority'
      });
    }

    const contact =  await utils.getData(`${config.get('server:institute:instituteAuthorityURL')}/${req.params.independentAuthorityId}/contact/${req.params.contactId}`);

    if (!contact) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'Independent authority contact not found'
      });
    }

    contact.createDate = null;
    contact.updateDate = null;
    contact.updateUser = utils.getUser(req).idir_username;
    contact.expiryDate = LocalDate.now().atStartOfDay().format(DateTimeFormatter.ofPattern('yyyy-MM-dd\'T\'HH:mm:ss'));

    await utils.putData(config.get('server:institute:instituteAuthorityURL') + '/' + req.params.independentAuthorityId + '/contact/'+ req.params.contactId , contact, utils.getUser(req).idir_username);

    return res.status(HttpStatus.OK).json(HttpStatus.NO_CONTENT);
  } catch (e) {
    await logApiError(e, 'deleteAuthorityContact', 'Error occurred while attempting to remove an authority contact.');
    return errorResponse(res);
  }
}

async function addAuthority(req, res) {
  try {
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

    const data = await utils.postData(url, payload, null, utils.getUser(req).idir_username);

    return res.status(HttpStatus.OK).json(data);
  }catch (e) {
    logApiError(e, 'addAuthority', 'Error occurred while attempting to create an authority.');
    return errorResponse(res);
  }
}

async function updateAuthority(req, res) {
  try {
    let authorityPayload = req.body;

    if(authorityPayload.authorityTypeCode === 'OFFSHORE'){
      authorityPayload.addresses = authorityPayload.addresses.filter(address => address.addressTypeCode !== 'PHYSICAL');
    }

    authorityPayload?.addresses?.forEach(function(addy) {
      addy.updateDate = null;
      addy.createDate = null;
    });

    authorityPayload?.contacts?.forEach(function(contact) {
      contact.updateDate = null;
      contact.createDate = null;
    });

    authorityPayload.createDate = null;
    authorityPayload.updateDate = null;
    authorityPayload.updateUser = utils.getUser(req).idir_username;
    const result = await utils.putData(config.get('server:institute:instituteAuthorityURL') + '/' + req.params.id, authorityPayload, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'updateAuthority', 'Error occurred while attempting to update an authority.');
    return errorResponse(res);
  }
}

async function getSchoolByID(req, res) {
  try {
    const url = `${config.get('server:institute:rootURL')}/school/${req.params.id}`;
    const data = await getData(url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getSchoolByID', 'Error occurred while attempting to GET school entity.');
    return errorResponse(res);
  }
}

async function getSchoolBySchoolID(schoolID) {
  try {
    const url = `${config.get('server:institute:rootURL')}/school/${schoolID}`;
    const data = await getData(url);
    return data;
  } catch (e) {
    logApiError(e, 'getSchoolByID', 'Error occurred while attempting to GET school entity.');
  }
}

async function getSchoolByMincode(req, res) {
  try {
    let school = cacheService.getSchoolJSONByMincode(req.params.mincode);
    const url = `${config.get('server:institute:rootURL')}/school/${school.schoolID}`;
    const data = await getData(url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getSchoolByMincode', 'Error occurred while attempting to GET school entity by mincode.');
    return errorResponse(res);
  }
}


async function getStudentRegistrationContacts(req, res) {
  let contactsList = [];
  try {
    let schoolSearchCriteria = encodeURIComponent(`{"condition":"AND","searchCriteriaList":[{"key":"expiryDate","operation":"gte","value":"${LocalDateTime.now()}","valueType":"DATE_TIME","condition":"OR"},{"key":"expiryDate","operation":"eq","value":null,"valueType":"STRING","condition":"OR"}]}, {"condition":"AND","searchCriteriaList":[{"key":"schoolContactTypeCode","operation":"eq","value":"STUDREGIS","valueType":"STRING","condition":"OR"}]}`);
    let districtSearchCriteria = encodeURIComponent(`{"condition":"AND","searchCriteriaList":[{"key":"expiryDate","operation":"gte","value":"${LocalDateTime.now()}","valueType":"DATE_TIME","condition":"OR"},{"key":"expiryDate","operation":"eq","value":null,"valueType":"STRING","condition":"OR"}]}, {"condition":"AND","searchCriteriaList":[{"key":"districtContactTypeCode","operation":"eq","value":"STUDREGIS","valueType":"STRING","condition":"OR"}]}`);
    const schoolContactURL = `${config.get('server:institute:instituteSchoolURL')}/contact/paginated?pageNumber=0&pageSize=10000&searchCriteriaList=[${schoolSearchCriteria}]`;
    const districtContactURL = `${config.get('server:institute:instituteDistrictURL')}/contact/paginated?pageNumber=0&pageSize=10000&searchCriteriaList=[${districtSearchCriteria}]`;
    Promise.all([
      getData(schoolContactURL),
      getData(districtContactURL),
    ])
      .then(async ([schoolContactResponse, districtContactResponse]) => {
        if (schoolContactResponse && districtContactResponse) {
          schoolContactResponse.content.forEach((element) => {
            let school = cacheService.getSchoolBySchoolID(element.schoolId);
            let schoolRegistrationContact = {};
            schoolRegistrationContact.name = (element.firstName ? element.firstName + ' ' + element.lastName : element.lastName).trim();
            schoolRegistrationContact.email = element.email;
            schoolRegistrationContact.instituteName = school.schoolName;
            schoolRegistrationContact.instituteIdentifier = school.mincode;
            schoolRegistrationContact.instituteGUID = school.schoolID;
            schoolRegistrationContact.instituteType = 'SCHOOL';
            contactsList.push(schoolRegistrationContact);
          });
          districtContactResponse.content.forEach((element) => {
            let district = cacheService.getDistrictJSONByDistrictId(element.districtId);
            let schoolRegistrationContact = {};
            schoolRegistrationContact.name = (element.firstName ? element.firstName + ' ' + element.lastName : element.lastName).trim();
            schoolRegistrationContact.email = element.email;
            schoolRegistrationContact.instituteName = district.name;
            schoolRegistrationContact.instituteGUID = district.districtId;
            schoolRegistrationContact.instituteIdentifier = district.districtNumber;
            schoolRegistrationContact.instituteType = 'DISTRICT';
            contactsList.push(schoolRegistrationContact);
          });
          return res.status(200).json(contactsList);
        }
      });
  } catch (e) {
    logApiError(e, 'getStudentRegistrationContacts', 'Error occurred while attempting to GET student registration contacts.');
    return errorResponse(res);
  }
}

async function getStudentRegistrationContactByMincode(req, res) {
  try {
    let school = cacheService.getSchoolJSONByMincode(req.params.mincode);
    let searchCriteriaList = [];
    searchCriteriaList.push({key: 'schoolContactTypeCode', operation: FILTER_OPERATION.EQUAL, value: 'STUDREGIS', valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
    searchCriteriaList.push({key: 'schoolID', operation: FILTER_OPERATION.EQUAL, value: school.schoolID, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND});

    const schoolSearchCriteria = [{
      condition: null,
      searchCriteriaList: searchCriteriaList,
    }];

    const schoolSearchParam = {
      params: {
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        sort: JSON.stringify(req.query.sort),
        searchCriteriaList: JSON.stringify(schoolSearchCriteria)
      }
    };

    let response = await getData(config.get('server:institute:rootURL') + '/school/contact/paginated', schoolSearchParam);
    let schoolRegistrationContact = {};
    if(response?.content && response.content[0]){
      let firstStudRegContact = response.content[0];
      schoolRegistrationContact.name = (firstStudRegContact.firstName ? firstStudRegContact.firstName + ' ' + firstStudRegContact.lastName : firstStudRegContact.lastName).trim();
      schoolRegistrationContact.email = firstStudRegContact.email;
      schoolRegistrationContact.instituteName = school.schoolName;
      schoolRegistrationContact.instituteIdentifier = school.mincode;
      schoolRegistrationContact.instituteGUID = school.schoolID;
      schoolRegistrationContact.instituteType = 'SCHOOL';
    }

    return res.status(200).json(schoolRegistrationContact);
  } catch (e) {
    logApiError(e, 'getStudentRegistrationContactByMincode', 'Error occurred while attempting to GET student registration contact entity.');
    return errorResponse(res);
  }
}


async function updateSchool(req, res) {
  try {
    return res.status(HttpStatus.OK).json(await updateSchoolDetails(req.body, utils.getUser(req).idir_username));
  }catch(e)
  {
    await logApiError(e, 'updateSchool', 'Error occurred while attempting to update a school.');
    return errorResponse(res);
  }
}

async function updateSchoolDetails(school, idirUsername){
  const payload = school;

  payload.addresses?.forEach(function(addy) {
    addy.updateDate = null;
    addy.createDate = null;
  });

  payload.schoolFundingGroups?.forEach(function(group) {
    group.updateDate = null;
    group.createDate = null;
  });

  payload.contacts?.forEach(function(contact) {
    contact.updateDate = null;
    contact.createDate = null;
  });

  payload.createDate = null;
  payload.updateDate = null;
  payload.updateUser = idirUsername;
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

  if(!['OFFSHORE', 'INDEPEND', 'INDP_FNS'].includes(payload.schoolCategoryCode)){
    payload.independentAuthorityId = null;
  }

  let currentSchool = await getSchoolBySchoolID(payload.schoolId);

  let currentSchoolGradeCodes = currentSchool.grades.map(grade => grade.schoolGradeCode);
  let incomingSchoolGradeCodes = payload.grades.map(grade => grade.schoolGradeCode);

  let all = _.union(currentSchoolGradeCodes, incomingSchoolGradeCodes);
  let common = _.intersection(currentSchoolGradeCodes, incomingSchoolGradeCodes);
  let offset = _.difference(all, common); _.difference(currentSchoolGradeCodes, incomingSchoolGradeCodes);

  if(offset.length !== 0 && ['INDEPEND', 'INDP_FNS'].includes(payload.schoolCategoryCode)){
    await setIssueTranscriptAndCertificatesFlags(payload);
  }

  return await utils.putData(config.get('server:institute:instituteSchoolURL') + '/' + payload.schoolId, payload, idirUsername);
}

async function getSchoolsPaginated(req, res){
  try {
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
        sort: JSON.stringify(req.query.sort),
        searchCriteriaList: JSON.stringify(schoolSearchCriteria)
      }
    };
    
    let response = await getData(config.get('server:institute:rootURL') + '/school/paginated', schoolSearchParam);
    return res.status(HttpStatus.OK).json(response);
  } catch (e) {
    logApiError(e, 'getSchoolsPaginated', 'Error occurred while attempting to GET schools paginated.');
    return errorResponse(res);
  }
}

async function moveSchool(req, res) {
  try {
    let school = cacheService.getSchoolBySchoolID(req.body.fromSchoolId);

    if(!school || school.schoolCategoryCode === 'OFFSHORE') {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Unable to move an offshore school'
      });
    }


    const incomingPayload = req.body;
    incomingPayload.toSchool.openedDate = incomingPayload.toSchool.moveDate;
    incomingPayload.toSchool.createDate = null;
    incomingPayload.toSchool.updateDate = null;
    incomingPayload.toSchool.createUser = utils.getUser(req).idir_username;
    incomingPayload.toSchool.updateUser = utils.getUser(req).idir_username;
    incomingPayload.toSchool.addresses = [];

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

    const data = await utils.postData(config.get('server:edx:moveSchoolSagaURL'), payload, null, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    logApiError(e, 'moveSchool', 'Error occurred while attempting to POST School entity.');
    return errorResponse(res, e.data.message);
  }
}

async function getSchoolHistoryPaginated(req, res) {
  try {
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
        sort: JSON.stringify(req.query.sort),
        searchCriteriaList: JSON.stringify(historySearchCriteria)
      }
    };

    Promise.all([
      getData(config.get('server:edx:edxUsersURL')),
      getData(config.get('server:institute:rootURL') + '/school/history/paginated', schoolHistorySearchParam)
    ])
      .then(async ([edxUserResponse, schoolHistoryResponse]) => {
        if (edxUserResponse && schoolHistoryResponse) {
          schoolHistoryResponse.content.forEach((element) => {
            if(element.updateUser?.length > 10){
              let val = edxUserResponse.find(user => user.edxUserID === element.updateUser.replace('EDX/', ''));
              if(val){
                element.updateUser = (val.firstName + ' ' + val.lastName).trim();
              }
            }
          });

          return res.status(HttpStatus.OK).json(schoolHistoryResponse);
        }
      }).catch(async e => {
        await logApiError(e, 'getSchoolsPaginated', 'Error occurred while attempting to GET schools paginated.');
        return errorResponse(res);
      });
  } catch (e) {
    logApiError(e, 'getSchoolsPaginated', 'Error occurred while attempting to GET schools paginated.');
    return errorResponse(res);
  }
}

async function getDistrictHistoryPaginated(req, res) {
  try {
    let parsedParams = '';
    if (req.query.searchParams) {
      parsedParams = req.query.searchParams;
    }

    const historySearchCriteria = [{
      condition: null,
      searchCriteriaList: createDistrictSearchCriteria(parsedParams),
    }];
    const districtHistorySearchParam = {
      params: {
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        sort: JSON.stringify(req.query.sort),
        searchCriteriaList: JSON.stringify(historySearchCriteria)
      }
    };

    Promise.all([
      getData(config.get('server:edx:edxUsersURL')),
      getData(config.get('server:institute:rootURL') + '/district/history/paginated', districtHistorySearchParam)
    ])
      .then(async ([edxUserResponse, districtHistoryResponse]) => {
        if (edxUserResponse && districtHistoryResponse) {
          districtHistoryResponse.content.forEach((element) => {
            if(element.updateUser?.length > 10){
              let val = edxUserResponse.find(user => user.edxUserID === element.updateUser.replace('EDX/', ''));
              if(val){
                element.updateUser = (val.firstName + ' ' + val.lastName).trim();
              }
            }
          });

          return res.status(HttpStatus.OK).json(districtHistoryResponse);
        }
      }).catch(async e => {
        await logApiError(e, 'getDistrictHistoryPaginated', 'Error occurred while attempting to GET district history paginated.');
        return errorResponse(res);
      });
  } catch (e) {
    logApiError(e, 'getDistrictHistoryPaginated', 'Error occurred while attempting to GET district history paginated.');
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
    if(key === 'gradeCode'){
      searchCriteriaList.push({key: 'grades.schoolGradeCode', operation: FILTER_OPERATION.IN, value: pValue.toString(), valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
    }
    if(key === 'issueTranscripts'){
      searchCriteriaList.push({key: 'canIssueTranscripts', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.BOOLEAN, condition: CONDITION.AND});
    }
    if(key === 'issueCertificates'){
      searchCriteriaList.push({key: 'canIssueCertificates', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.BOOLEAN, condition: CONDITION.AND});
    }
  });

  return searchCriteriaList;
}

function createDistrictSearchCriteria(searchParams){
  let searchCriteriaList = [];

  Object.keys(searchParams).forEach(function(key){
    let pValue = searchParams[key];
    if(key === 'districtID'){
      searchCriteriaList.push({key: 'districtId', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND});
    }
  });

  return searchCriteriaList;
}

async function getAuthorities(req, res) {
  try {
    const url = `${config.get('server:institute:instituteAuthorityURL')}`;
    const data = await getData(url);
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
  try {
    const url = `${config.get('server:institute:rootURL')}/authority/${req.params.id}`;
    const data = await getData(url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getAuthorityByID', 'Error occurred while attempting to GET authority entity.');
    return errorResponse(res);
  }
}

async function addNewAuthorityNote(req, res) {
  try {
    const params = {
      content: req.body.content,
      independentAuthorityId: req.body.independentAuthorityId
    };
    const result = await utils.postData(`${config.get('server:institute:instituteAuthorityURL')}/${req.body.independentAuthorityId}/note`, params, null, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'addNewAuthorityNote', 'Error occurred while attempting to add a new authority note.');
    return errorResponse(res);
  }
}

async function getAuthorityNotes(req, res) {
  try {
    const result = await getData(`${config.get('server:institute:instituteAuthorityURL')}/${req.params.independentAuthorityId}/note`);
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
    const payload = {
      noteId: req.body.noteId,
      independentAuthorityId: req.body.independentAuthorityId,
      content: req.body.content
    };
    const result = await utils.putData(`${config.get('server:institute:instituteAuthorityURL')}/${req.body.independentAuthorityId}/note/${req.params.noteId}`, payload, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'updateAuthorityNote', 'Error occurred while attempting to save the changes to the authority note.');
    return errorResponse(res);
  }
}

async function deleteAuthorityNote(req, res) {
  try {
    await utils.deleteData(`${config.get('server:institute:instituteAuthorityURL')}/${req.params.independentAuthorityId}/note/${req.params.noteId}`);
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
      sort: JSON.stringify(req.query.sort),
      searchCriteriaList: JSON.stringify(authoritySearchCriteria)
    }
  };
  let response = await getData(config.get('server:institute:rootURL') + '/authority/paginated', authoritySearchParam);
  return res.status(HttpStatus.OK).json(response);
}

async function getFundingGroupDataForSchool(req, res) {
  try {
    let school = await getSchoolBySchoolID(req.params.schoolID);
    return res.status(HttpStatus.OK).json(school.schoolFundingGroups);
  } catch (e) {
    await logApiError(e, 'getFundingGroupDataForSchool', 'Error getting funding data for this school');
    return errorResponse(res);
  }
}

async function deleteFundingDataForSchool(req, res) {
  try {
    let school = await getSchoolBySchoolID(req.params.schoolID);
    if(!school){
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'School not found'
      });
    }

    school.schoolFundingGroups = school.schoolFundingGroups.filter(group => group.schoolFundingGroupID !== req.params.schoolFundingGroupID);
    res.body = school;
    await setIssueTranscriptAndCertificatesFlags(school);
    await updateSchoolDetails(school,utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json('{}');
  } catch (e) {
    await logApiError(e, 'deleteFundingDataForSchool', 'Error removing funding data for this school');
    return errorResponse(res);
  }
}

async function updateFundingDataForSchool(req, res) {
  try {
    let school = await getSchoolBySchoolID(req.params.schoolID);

    if(school?.schoolCategoryCode !== 'INDEPEND' && school?.schoolCategoryCode !== 'INDP_FNS') {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Unable to update funding code for this school category'
      });
    }

    let user = utils.getUser(req).idir_username;
    const payload = req.body;
    payload.updateDate = null;
    payload.createDate = null;
    payload.createUser = null;
    payload.updateUser = user;

    school.schoolFundingGroups = school.schoolFundingGroups.filter(group => group.schoolFundingGroupID !== req.body.schoolFundingGroupID);
    school.schoolFundingGroups.push(payload);

    await setIssueTranscriptAndCertificatesFlags(school);

    await updateSchoolDetails(school, user);
    return res.status(HttpStatus.OK).json('{}');
  } catch (e) {
    await logApiError(e, 'updateFundingDataForSchool', 'Error updating funding data for this school');
    return errorResponse(res);
  }
}

async function addNewFundingForSchool(req, res) {
  try {
    let school = await getSchoolBySchoolID(req.params.schoolID);
    if(school?.schoolCategoryCode !== 'INDEPEND' && school?.schoolCategoryCode !== 'INDP_FNS') {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Unable to add funding code for this school category'
      });
    }
    const payload = req.body;
    let user = utils.getUser(req).idir_username;
    payload.createUser = user;
    payload.updateUser = user;
    payload.schoolID = req.params.schoolID;
    school.schoolFundingGroups.push(payload);

    await setIssueTranscriptAndCertificatesFlags(school);

    await updateSchoolDetails(school, user);
    return res.status(HttpStatus.OK).json('{}');
  } catch (e) {
    await logApiError(e, 'addNewFundingForSchool', 'Error adding funding data for this school');
    return errorResponse(res);
  }
}

async function setIssueTranscriptAndCertificatesFlags(school){
  let gradesArray = ['GRADE10','GRADE11','GRADE12','SECUNGR'];
  let groupsArray = ['GROUP1','GROUP2','GROUP4'];
  let summerShortPRPArray = ['SHORT_PRP','SUMMER'];
  let canIssueTranscripts = false;
  let canIssueCertificates = false;

  let grade10toSUFundingCodes = school.schoolFundingGroups?.filter(group => gradesArray.includes(group.schoolGradeCode));
  let schoolHas10toSUGrades = school.grades?.some(grade => gradesArray.includes(grade.schoolGradeCode));
  let hasGroup1or2or4 = grade10toSUFundingCodes?.some(group => groupsArray.includes(group.schoolFundingGroupCode));

  switch(school.schoolCategoryCode) {
  case 'PUBLIC':
    if(!summerShortPRPArray.includes(school.facilityTypeCode) && schoolHas10toSUGrades){
      canIssueTranscripts = true;
      canIssueCertificates = true;
    }
    break;
  case 'INDEPEND':
  case 'INDP_FNS':
    if(schoolHas10toSUGrades && hasGroup1or2or4){
      canIssueTranscripts = true;
      canIssueCertificates = true;
    }
    break;
  case 'YUKON':
    if(schoolHas10toSUGrades){
      canIssueTranscripts = true;
    }
    break;
  case 'OFFSHORE':
    if(schoolHas10toSUGrades){
      canIssueTranscripts = true;
      canIssueCertificates = true;
    }
    break;
  }

  school.canIssueTranscripts = canIssueTranscripts;
  school.canIssueCertificates = canIssueCertificates;
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
  addNewFundingForSchool,
  deleteDistrictContact,
  deleteFundingDataForSchool,
  getSchoolHistoryPaginated,
  updateFundingDataForSchool,
  getFundingGroupDataForSchool,
  moveSchool,
  setIssueTranscriptAndCertificatesFlags,
  getStudentRegistrationContacts,
  getStudentRegistrationContactByMincode,
  getSchoolByMincode,
  getDistrictHistoryPaginated,
  getDistrictNotes,
  getAuthorityNotes,
  getSchoolNotes
};
