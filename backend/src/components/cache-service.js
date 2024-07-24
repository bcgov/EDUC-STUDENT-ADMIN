'use strict';
const config = require('../config/index');
const log = require('../components/logger');
const {getData} = require('../components/utils');
const retry = require('async-retry');
const {generateDistrictObject, isDistrictActive, generateSchoolObject, isSchoolActive, isAuthorityActive,
  generateAuthorityObject, isActiveRecord
} = require('./institute/instituteUtils');
const constants = require('../util/constants');

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
const cachedData = {};

let documentTypeCodesMap = new Map();
let documentTypeCodes = [];
let bandCodesMap = new Map();
let enrolledProgramCodesMap = new Map();
let careerProgramCodesMap = new Map();
let homeLanguageSpokenCodesMap = new Map();
let schoolFundingCodesMap = new Map();
let schoolCollectionStatusCodesMap = new Map();
let specialEducationCodesMap = new Map();
let duplicateResolutionCodesMap = new Map();
let programDuplicateTypeCodesMap = new Map();

const cacheService = {

  async loadAllSchoolsToMap() {
    log.debug('Loading all schools during start up');
    await retry(async () => {
      // if anything throws, we retry
      const schools = await getData(config.get('server:institute:instituteSchoolURL'));
      let newMincodeSchoolMap = new Map();
      let newSchoolMap = new Map();
      let newMincodeSchools = [];
      let newActiveSchools = [];

      if (schools && schools.length > 0) {
        for (const school of schools) {
          const mincodeSchool = generateSchoolObject(school);
          newMincodeSchoolMap.set(school.mincode, mincodeSchool);
          newSchoolMap.set(school.schoolId, mincodeSchool);
          newMincodeSchools.push(mincodeSchool);
          if (isSchoolActive(mincodeSchool)) {
            newActiveSchools.push(mincodeSchool);
          }
        }
      }

      mincodeSchoolMap = newMincodeSchoolMap;
      schoolMap = newSchoolMap;
      mincodeSchools = newMincodeSchools;
      activeSchools = newActiveSchools;

      log.info(`Loaded ${mincodeSchoolMap.size} schools.`);
      log.info(`Loaded ${activeSchools.length} active schools.`);
    }, {
      retries: 50
    });

  },
  getAllSchoolsJSON() {
    return mincodeSchools;
  },
  getSchoolJSONByMincode(mincode) {
    return mincodeSchoolMap.get(mincode);
  },
  getSchoolBySchoolID(schoolID) {
    return schoolMap.get(schoolID);
  },
  getAllActiveSchoolsJSON() {
    return activeSchools;
  },
  async loadAllDistrictsToMap() {
    log.debug('Loading all districts during start up');
    await retry(async () => {
      const districtsResponse = await getData(config.get('server:institute:instituteDistrictURL'));
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
      log.info(`Loaded ${districtsMap.size} districts.`);
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
    log.debug('Loading all authorities during start up');
    await retry(async () => {
      const authoritiesResponse = await getData(config.get('server:institute:instituteAuthorityURL'));
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
      log.info(`Loaded ${authoritiesMap.size} authorities.`);
      log.info(`Loaded ${activeAuthorities.length} active authorities.`);
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
      const documentTypeCodesList = await getData(`${config.get('server:edx:exchangeURL')}/document-types`);
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

    const yukonSCFacilityTypeCodes=[];
    yukonSCFacilityTypeCodes.push('STANDARD');
    yukonSCFacilityTypeCodes.push('DIST_LEARN');
    yukonSCFacilityTypeCodes.push('SUMMER');

    const postSecondarySCFacilityTypeCodes=[];
    postSecondarySCFacilityTypeCodes.push('POST_SEC');

    const earlyLearningSCFacilityTypeCodes=[];
    earlyLearningSCFacilityTypeCodes.push('STRONG_CEN');
    earlyLearningSCFacilityTypeCodes.push('STRONG_OUT');
    earlyLearningSCFacilityTypeCodes.push('JUSTB4PRO');

    const independentFNSFacilityTypeCodes=[];
    independentFNSFacilityTypeCodes.push('STANDARD');

    const nonIndependentFNSFacilityTypeCodes=[];
    nonIndependentFNSFacilityTypeCodes.push('STANDARD');
    return {
      'PUBLIC':publicSCAllowedFacilityTypeCodes,
      'INDEPEND':independentSchoolSCFacilityTypeCodes,
      'OFFSHORE':offshoreLearningSCFacilityTypeCodes,
      'FED_BAND':nonIndependentFNSFacilityTypeCodes,
      'YUKON':yukonSCFacilityTypeCodes,
      'POST_SEC':postSecondarySCFacilityTypeCodes,
      'EAR_LEARN':earlyLearningSCFacilityTypeCodes,
      'INDP_FNS':independentFNSFacilityTypeCodes,


    };
  },

  async loadDataToCache(cacheKey,url){
    log.debug(` loading all ${cacheKey} during start up`);
    await retry(async () => {
      const responseData = await getData(config.get(url));
      // reset the value.
      const records = [];
      const activeRecords = [];
      if (responseData && responseData.length > 0) {
        for (const data of responseData) {
          records.push(data);
          if(isActiveRecord(data)){
            activeRecords.push(data);
          }
        }
        cachedData[`${cacheKey}`]={
          'activeRecords':activeRecords,
          'records':records
        };
      }
      log.info(`Loaded ${responseData.length} ${cacheKey} Types.`);
    }, {
      retries: 50
    });
  },
  getCachedData(){
    return cachedData;
  },
  getAllActiveBandCodesMap() {
    let bandCodesRaw = cachedData[constants.CACHE_KEYS.SDC_BAND_CODES].activeRecords;
    let bandCodes = bandCodesRaw.map(item => {
      return {...item, dropdownText: `${item.description} (${item.bandCode})`};
    });

    bandCodes.unshift({'bandCode': '', 'dropdownText': 'No Band Code'});
    bandCodes.forEach(bandCode => {
      bandCodesMap.set(bandCode.bandCode, bandCode);
    });
    return bandCodesMap;
  },
  getActiveCareerProgramCodesMap() {
    let careerProgramCodesRaw = cachedData[constants.CACHE_KEYS.SDC_CAREER_PROGRAM_CODES].activeRecords;
    let careerProgramCodes = careerProgramCodesRaw.map(item => {
      return {...item, dropdownText: `${item.description} (${item.careerProgramCode})`};
    });
    careerProgramCodes.unshift({'careerProgramCode': '', 'dropdownText': 'No Career Code'});
    careerProgramCodes.forEach(careerProgramCode => {
      careerProgramCodesMap.set(careerProgramCode.careerProgramCode, careerProgramCode);
    });
    return careerProgramCodesMap;
  },
  getHomeLanguageSpokenCodesMap() {
    let homeLanguageSpokenCodeList = cachedData[constants.CACHE_KEYS.SDC_HOME_LANGUAGE_SPOKEN_CODES].activeRecords;
    let homeLanguageSpokenCodes = homeLanguageSpokenCodeList.map(item => {
      return {...item, dropdownText: `${item.description} (${item.homeLanguageSpokenCode})`};
    });
    homeLanguageSpokenCodes.unshift({'homeLanguageSpokenCode': null, 'dropdownText': 'No Home Language Code'});
    homeLanguageSpokenCodes.forEach(homeLanguageSpokenCode => {
      homeLanguageSpokenCodesMap.set(homeLanguageSpokenCode.homeLanguageSpokenCode, homeLanguageSpokenCode);
    });
    return homeLanguageSpokenCodesMap;
  },
  getEnrolledProgramCodesMap() {
    let enrolledProgramCodesRaw = cachedData[constants.CACHE_KEYS.SDC_ENROLLED_PROGRAM_CODES].activeRecords;
    let enrolledProgramCodes = enrolledProgramCodesRaw.map(item => {
      return {...item, dropdownText: `${item.description} (${item.enrolledProgramCode})`};
    });
    enrolledProgramCodes.forEach(enrolledProgramCode => {
      enrolledProgramCodesMap.set(enrolledProgramCode.enrolledProgramCode, enrolledProgramCode);
    });
    return enrolledProgramCodesMap;
  },
  getActiveSchoolFundingCodesMap() {
    let schoolFundingCodesRaw = cachedData[constants.CACHE_KEYS.SDC_SCHOOL_FUNDING_CODES].activeRecords;
    let schoolFundingCodes = schoolFundingCodesRaw.map(item => {
      return {...item, dropdownText: `${item.description} (${item.schoolFundingCode})`};
    });
    schoolFundingCodes.unshift({'schoolFundingCode': '', 'dropdownText': 'No Funding Code'});
    schoolFundingCodes.forEach(schoolFundingCode => {
      schoolFundingCodesMap.set(schoolFundingCode.schoolFundingCode, schoolFundingCode);
    });
    return schoolFundingCodesMap;
  },
  getActiveSpecialEducationCodesMap() {
    let specialEducationCodesRaw = cachedData[constants.CACHE_KEYS.SDC_SPECIAL_ED_CODES].activeRecords;
    let specialEducationCodes = specialEducationCodesRaw.map(item => {
      return {...item, dropdownText: `${item.description} (${item.specialEducationCategoryCode})`};
    });
    specialEducationCodesMap = new Map();
    specialEducationCodes.unshift({'specialEducationCategoryCode': '', 'dropdownText': 'No Special Ed Category Code'});
    specialEducationCodes.forEach(specialEducationCategoryCode => {
      specialEducationCodesMap.set(specialEducationCategoryCode.specialEducationCategoryCode, specialEducationCategoryCode);
    });
    return specialEducationCodesMap;
  },
  getAllDuplicateResolutionCodesMap() {
    let duplicateResolutionCodes = cachedData[constants.CACHE_KEYS.SDC_DUPLICATE_RESOLUTION_CODES].records;
    duplicateResolutionCodes.forEach(duplicateResolutionCode => {
      duplicateResolutionCodesMap.set(duplicateResolutionCode.duplicateResolutionCode, duplicateResolutionCode);
    });
    return duplicateResolutionCodesMap;
  },
  getAllProgramDuplicateTypeCodesMap() {
    let programDuplicateTypeCodes = cachedData[constants.CACHE_KEYS.SDC_PROGRAM_DUPLICATE_TYPE_CODES].records;
    programDuplicateTypeCodes.forEach(programDuplicateTypeCode => {
      programDuplicateTypeCodesMap.set(programDuplicateTypeCode.programDuplicateTypeCode, programDuplicateTypeCode);
    });
    return programDuplicateTypeCodesMap;
  },
  getActiveSchoolCollectionStatusCodesMap(){
    let schoolCollectionStatusCodesRaw = cachedData[constants.CACHE_KEYS.SDC_SCHOOL_COLLECTION_STATUS_CODES].records;
    let schoolCollectionStatusCodes = schoolCollectionStatusCodesRaw.map(item => {
      return {...item, dropdownText:`${item.label}`};
    });
    schoolCollectionStatusCodes.forEach((statusCode => {
      schoolCollectionStatusCodesMap.set(statusCode, statusCode.label);
    }));
    return schoolCollectionStatusCodesMap;
  },
  getActiveEnrolledGradeCodes() {
    return cachedData[constants.CACHE_KEYS.SDC_ENROLLED_GRADE_CODES].activeRecords;
  },
  getActiveSchoolFundingCodes() {
    return cachedData[constants.CACHE_KEYS.SDC_SCHOOL_FUNDING_CODES].activeRecords;
  },
  getActiveCareerProgramCodes() {
    return cachedData[constants.CACHE_KEYS.SDC_CAREER_PROGRAM_CODES].activeRecords;
  },
  getActiveEnrolledProgramCodes() {
    return cachedData[constants.CACHE_KEYS.SDC_ENROLLED_PROGRAM_CODES].activeRecords;
  },
  getActiveSpecialEducationCodes() {
    return cachedData[constants.CACHE_KEYS.SDC_SPECIAL_ED_CODES].activeRecords;
  }
};

module.exports = cacheService;
