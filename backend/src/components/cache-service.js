'use strict';
const CronJob = require('cron').CronJob;
const config = require('../config/index');
const log = require('../components/logger');
const {getApiCredentials} = require('../components/auth');
const {getData} = require('../components/utils');

let minCodeSchoolMap = new Map();
let minCodeSchools = [];

const cacheService = {

  async loadAllSchoolsToMap() {
    log.debug('loading all schools during start up');
    const data = await getApiCredentials(); // get the tokens first to make api calls.
    const schools = await getData(data.accessToken, `${config.get('server:schoolAPIURL')}/schools`);
    minCodeSchools = []; // reset the value.
    minCodeSchoolMap.clear();// reset the value.
    if (schools && schools.length > 0) {
      for (const school of schools) {
        const minCodeSchool = {
          minCode: `${school.distNo}${school.schlNo}`,
          schoolName: school.schoolName
        };
        minCodeSchoolMap.set(`${school.distNo}${school.schlNo}`, minCodeSchool);
        minCodeSchools.push(minCodeSchool);
      }
    }
    log.info(`loaded ${minCodeSchoolMap.size} schools.`);
  },
  getAllSchoolsJSON() {
    return minCodeSchools;
  },
  getSchoolNameJSONByMincode(mincode) {
    return minCodeSchoolMap.get(mincode);
  }
};

try {
  // reload the cache every midnight at 12.15 AM as the api reloads cache at 12 AM.
  const reloadCache = new CronJob('0 15 0 * * *', async () => {
    log.debug('starting reload cache');
    try {
      await cacheService.loadAllSchoolsToMap();
    } catch (e) {
      log.error(e);
    }
  });
  reloadCache.start();
} catch (e) {
  log.error(e);
}

module.exports = cacheService;
