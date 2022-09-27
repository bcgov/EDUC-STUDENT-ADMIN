'use strict';
const CronJob = require('cron').CronJob;
const log = require('../components/logger');
const cacheService = require('../components/cache-service');

try {
  // reload the cache every midnight at 12.15 AM as the api reloads cache at 12 AM.
  const reloadCache = new CronJob('0 15 0 * * *', async () => {
    log.debug('Starting reload cache');
    try {
      await cacheService.loadAllSchoolsToMap();
      await cacheService.loadAllDocumentTypeCodesToMap();
      await cacheService.loadAllDistrictsToMap();
      await cacheService.loadAllAuthoritiesToMap();
    } catch (e) {
      log.error(e);
    }
  });
  reloadCache.start();
} catch (e) {
  log.error(e);
}

