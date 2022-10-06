'use strict';
const config = require('../config/index');
const log = require('../components/logger');
const {getApiCredentials} = require('../components/auth');
const {getData} = require('../components/utils');
const retry = require('async-retry');

let mincodeSchoolMap = new Map();
let mincodeSchools = [];

const schoolApiCacheService = {

  async loadAllSchoolsToMap() {
    log.debug('loading all schools during start up');
    await retry(async () => {
      // if anything throws, we retry
      const data = await getApiCredentials(); // get the tokens first to make api calls.
      const schools = await getData(data.accessToken, `${config.get('server:schoolAPIURL')}/schools`);
      mincodeSchools = []; // reset the value.
      mincodeSchoolMap.clear();// reset the value.
      if (schools && schools.length > 0) {
        for (const school of schools) {
          const mincodeSchool = {
            mincode: `${school.distNo}${school.schlNo}`,
            schoolName: school.schoolName,
            effectiveDate: school.dateOpened,
            expiryDate: school.dateClosed,
          };
          mincodeSchoolMap.set(`${school.distNo}${school.schlNo}`, mincodeSchool);
          mincodeSchools.push(mincodeSchool);
        }
      }
      log.info(`loaded ${mincodeSchoolMap.size} schools to school-api-cache.`);
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

};

module.exports = schoolApiCacheService;
