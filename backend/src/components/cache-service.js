'use strict';
const config = require('../config/index');
const log = require('../components/logger');
const {getApiCredentials} = require('../components/auth');
const {getData} = require('../components/utils');
const retry = require('async-retry');
const {generateDistrictObject, isDistrictActive, generateSchoolObject, isSchoolActive, isAuthorityActive,
  generateAuthorityObject
} = require('./institute/instituteUtils');

let mincodeSchoolMap = new Map();
let mincodeSchools = [];
let schoolMap = new Map();
let activeSchools = [];
let activeDistricts = [];
let districts = [];
let districtsMap = new Map();
let activeAuthorities = [];
let authorities = [];
let authoritiesMap = new Map();


let documentTypeCodesMap = new Map();
let documentTypeCodes = [];

const cacheService = {

  async loadAllSchoolsToMap() {
    log.debug('loading all schools during start up');
    await retry(async () => {
      // if anything throws, we retry
      const data = await getApiCredentials(); // get the tokens first to make api calls.
      const schools = await getData(data.accessToken, config.get('server:institute:instituteSchoolURL'));
      mincodeSchoolMap.clear(); // reset the value.
      schoolMap.clear(); // reset the value.
      mincodeSchools = []; // reset the value.
      activeSchools = [];// reset the value.
      if (schools && schools.length > 0) {
        for (const school of schools) {
          const mincodeSchool = generateSchoolObject(school);
          mincodeSchoolMap.set(school.mincode, mincodeSchool);
          schoolMap.set(school.schoolId, mincodeSchool);
          mincodeSchools.push(mincodeSchool);
          if (isSchoolActive(mincodeSchool)) {
            activeSchools.push(mincodeSchool);
          }
        }
      }
      log.info(`loaded ${mincodeSchoolMap.size} schools.`);
      log.info(`Loaded ${activeSchools.length} active schools.`);
    }, {
      retries: 50
    });

  },
  getAllSchoolsJSON() {
    return mincodeSchools;
  },
  getSchoolNameJSONByMincode(mincode) {
    return mincodeSchoolMap.get(mincode);
  },
  getSchoolBySchoolID(schoolID) {
    return schoolMap.get(schoolID);
  },
  getAllActiveSchoolsJSON() {
    return activeSchools;
  },
  async loadAllDistrictsToMap() {
    log.debug('loading all districts during start up');
    await retry(async () => {
      const data = await getApiCredentials();
      const districtsResponse = await getData(data.accessToken, config.get('server:institute:instituteDistrictURL'));
      // reset the value.
      districts = [];
      activeDistricts = [];
      districtsMap.clear();
      if (districtsResponse && districtsResponse.length > 0) {
        for (const district of districtsResponse) {
          const districtData = generateDistrictObject(district);
          districtsMap.set(district.districtId, districtData);
          districts.push(districtData);
          if(isDistrictActive(districtData)){
            activeDistricts.push(districtData);
          }
        }
      }
      log.info(`loaded ${districtsMap.size} districts.`);
    }, {
      retries: 50
    });

  },
  getAllActiveDistrictsJSON(){
    return activeDistricts;
  },
  getAllDistrictsJSON() {
    return districts;
  },
  getDistrictJSONByDistrictId(districtId) {
    return districtsMap.get(districtId);
  },
  async loadAllAuthoritiesToMap() {
    log.debug('loading all authorities during start up');
    await retry(async () => {
      const data = await getApiCredentials();
      const authoritiesResponse = await getData(data.accessToken, config.get('server:institute:instituteAuthorityURL'));
      // reset the value.
      authorities = [];
      activeAuthorities = [];
      authoritiesMap.clear();
      if (authoritiesResponse && authoritiesResponse.length > 0) {
        for (const authority of authoritiesResponse) {
          const authorityData = generateAuthorityObject(authority);
          authoritiesMap.set(authority.independentAuthorityId, authorityData);
          authorities.push(authorityData);
          if(isAuthorityActive(authorityData)){
            activeAuthorities.push(authorityData);
          }
        }
      }
      log.info(`loaded ${authoritiesMap.size} authorities.`);
    }, {
      retries: 50
    });

  },
  getAllActiveAuthoritiesJSON(){
    return activeAuthorities;
  },
  getAllAuthoritiesJSON() {
    return authorities;
  },
  getAuthorityJSONByAuthorityId(authorityId) {
    return authoritiesMap.get(authorityId);
  },

  async loadAllDocumentTypeCodesToMap() {
    log.debug('Loading all document type codes during start up');
    await retry(async () => {
      // if anything throws, we retry
      const data = await getApiCredentials(); // get the tokens first to make api calls.
      const documentTypeCodesList = await getData(data.accessToken, `${config.get('server:edx:exchangeURL')}/document-types`);
      documentTypeCodes = []; // reset the value.
      documentTypeCodesMap.clear();// reset the value.
      if (documentTypeCodesList && documentTypeCodesList.length > 0) {
        for (const documentTypeCode of documentTypeCodesList) {
          const docTypeCode = {
            secureExchangeDocumentTypeCode: documentTypeCode.secureExchangeDocumentTypeCode,
            label: documentTypeCode.label,
            description: documentTypeCode.description,
            effectiveDate: documentTypeCode.effectiveDate,
            expiryDate: documentTypeCode.expiryDate,
          };
          documentTypeCodesMap.set(documentTypeCode.secureExchangeDocumentTypeCode, docTypeCode);
          documentTypeCodes.push(docTypeCode);
        }
      }
      log.info(`Loaded ${documentTypeCodesMap.size} document type codes.`);
    }, {
      retries: 50
    });

  },
  getAllDocumentTypeCodesJSON() {
    return documentTypeCodes;
  },
  getDocumentTypeCodeLabelByCode(code) {
    return documentTypeCodesMap.get(code);
  },
  getSchoolCategoryAllowedFacilityMap(){
    const publicSCAllowedFacilityTypeCodes = [];
    publicSCAllowedFacilityTypeCodes.push('CONT_ED');
    publicSCAllowedFacilityTypeCodes.push('ALT_PROGS');
    publicSCAllowedFacilityTypeCodes.push('YOUTH');
    publicSCAllowedFacilityTypeCodes.push('SHORT_PRP');
    publicSCAllowedFacilityTypeCodes.push('LONG_PRP');
    publicSCAllowedFacilityTypeCodes.push('DIST_LEARN');
    publicSCAllowedFacilityTypeCodes.push('DISTONLINE');
    publicSCAllowedFacilityTypeCodes.push('SUMMER');
    publicSCAllowedFacilityTypeCodes.push('STANDARD');

    const independentSchoolSCFacilityTypeCodes=[];
    independentSchoolSCFacilityTypeCodes.push('STANDARD');
    independentSchoolSCFacilityTypeCodes.push('DIST_LEARN');

    const offshoreLearningSCFacilityTypeCodes=[];
    offshoreLearningSCFacilityTypeCodes.push('STANDARD');

    const federallyOpSCFacilityTypeCodes=[];
    federallyOpSCFacilityTypeCodes.push('STANDARD');

    const yukonSCFacilityTypeCodes=[];
    yukonSCFacilityTypeCodes.push('STANDARD');
    yukonSCFacilityTypeCodes.push('DIST_CONT');
    yukonSCFacilityTypeCodes.push('SUMMER');

    const postSecondarySCFacilityTypeCodes=[];

    const earlyLearningSCFacilityTypeCodes=[];
    earlyLearningSCFacilityTypeCodes.push('STRONG_CEN');
    earlyLearningSCFacilityTypeCodes.push('STRONG_OUT');
    earlyLearningSCFacilityTypeCodes.push('JUSTB4PRO');
    return {
      'PUBLIC':publicSCAllowedFacilityTypeCodes,
      'INDEPEND':independentSchoolSCFacilityTypeCodes,
      'OFFSHORE':offshoreLearningSCFacilityTypeCodes,
      'FED_BAND':federallyOpSCFacilityTypeCodes,
      'YUKON':yukonSCFacilityTypeCodes,
      'POST_SEC':postSecondarySCFacilityTypeCodes,
      'EAR_LEARN':earlyLearningSCFacilityTypeCodes

    };
  },
};

module.exports = cacheService;
