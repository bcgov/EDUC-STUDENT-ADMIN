'use strict';
const config = require('../config/index');
const log = require('../components/logger');
const {getApiCredentials} = require('../components/auth');
const {getData} = require('../components/utils');
const retry = require('async-retry');
const {generateSchoolObject,isSchoolActive} = require('./schoolUtils');

let mincodeSchoolMap = new Map();
let mincodeSchools = [];
let schoolMap = new Map();
let activeSchools = [];
let districts = [];
let districtsMap = new Map();

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
      districtsMap.clear();
      if (districtsResponse && districtsResponse.length > 0) {
        for (const district of districtsResponse) {
          const districtData = {
            districtId: district.districtId,
            districtNumber: district.districtNumber,
            name: district.displayName,
            districtRegionCode: district.districtRegionCode,
            districtStatusCode: district.districtStatusCode,
            phoneNumber: district.phoneNumber,
          };
          districtsMap.set(district.districtId, districtData);
          districts.push(districtData);
        }
      }
      log.info(`loaded ${districtsMap.size} districts.`);
    }, {
      retries: 50
    });

  },
  getAllDistrictsJSON() {
    return districts;
  },
  getDistrictJSONByDistrictId(districtId) {
    return districtsMap.get(districtId);
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
  }
};

module.exports = cacheService;
