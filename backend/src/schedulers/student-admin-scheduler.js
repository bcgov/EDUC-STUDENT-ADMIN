'use strict';
const CronJob = require('cron').CronJob;
const config = require('../config/index');
const log = require('../components/logger');
const {getApiCredentials} = require('../components/auth');
const safeStringify = require('fast-safe-stringify');
const {getData} = require('../components/utils');
const schedulerCronStaleSagaRecordRedis = config.get('scheduler:schedulerCronStaleSagaRecordRedis');
const minimumTimeBeforeSagaIsStale = config.get('scheduler:minTimeBeforeSagaIsStaleInMinutes'); // should be in minutes.
log.info(`${schedulerCronStaleSagaRecordRedis} :: ${minimumTimeBeforeSagaIsStale}`);
const redisUtil = require('../util/redis/redis-utils');
const {LocalDateTime} = require('@js-joda/core');

/**
 * This method will check whether the saga record was created 15 minutes before, if so add it to the list
 * @param inProgressSagas the records from redis.
 * @returns {[]} array of saga records, if nothing matches criteria, blank array.
 */
function findStaleSagaRecords(inProgressSagas) {
  let staleSagas = [];
  if (inProgressSagas && inProgressSagas.length > 0) {
    for (const sagaString of inProgressSagas) {
      const saga = JSON.parse(sagaString);
      const isStaleRecord = LocalDateTime.parse(saga.createDateTime).isBefore(LocalDateTime.now().minusMinutes(minimumTimeBeforeSagaIsStale));
      if (isStaleRecord) {
        staleSagas.push(saga);
      }
    }
  }
  return staleSagas;
}

async function removeStaleSagas(staleSagas, sagaType) {
  let sagaRecordFromAPIPromises = [];
  try {
    const data = await getApiCredentials(); // get the tokens first to make api calls.
    for (const saga of staleSagas) {
      if (sagaType === 'GMP_UMP') {
        sagaRecordFromAPIPromises.push(getData(data.accessToken, `${config.get('server:profileSagaAPIURL')}/${saga.sagaId}`));
      } else if (sagaType === 'PEN_REQUEST_BATCH') {
        sagaRecordFromAPIPromises.push(getData(data.accessToken, `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch-saga/${saga.sagaId}`));
      }
    }
    const results = await Promise.allSettled(sagaRecordFromAPIPromises);
    for (const result of results) {
      if ('fulfilled' === result.status) {
        const sagaFromAPI = result.value;
        if ('COMPLETED' === sagaFromAPI.status || 'FORCE_STOPPED' === sagaFromAPI.status) {
          const event = {
            sagaId: sagaFromAPI.sagaId,
            sagaStatus: sagaFromAPI.status
          };
          if (sagaType === 'GMP_UMP') {
            await redisUtil.removeSagaRecordFromRedis(event);
          } else if (sagaType === 'PEN_REQUEST_BATCH') {
            await redisUtil.removePenRequestBatchSagaRecordFromRedis(event);
          }

        } else {
          log.warn(`saga ${sagaFromAPI.sagaId} is not yet completed.`);
        }
      } else {
        log.error(`promise rejected for ${safeStringify(result)}`);
      }
    }
  } catch (e) {
    log.error(`error while executing delete of stale saga records ${sagaType} ${e}`);
  }
}

try {
  const removeStaleSagaRecordFromRedis = new CronJob(schedulerCronStaleSagaRecordRedis, async () => {
    log.info('starting findAndRemoveStaleSagaRecord');
    const redLock = redisUtil.getRedLock();
    try {
      await redLock.lock('locks:remove-stale-saga-record', 6000); // no need to release the lock as it will auto expire after 6000 ms.
      const staleSagas = findStaleSagaRecords(await redisUtil.getSagaEvents());
      const stalePRBSagas = findStaleSagaRecords(await redisUtil.getPenRequestBatchSagaEvents());
      log.info(`found ${staleSagas.length} stale GMP or UMP saga records`);
      log.info(`found ${stalePRBSagas.length} stale PenRequestBatch saga records`);

      if (staleSagas.length > 0) {
        await removeStaleSagas(staleSagas, 'GMP_UMP');
      }
      if(stalePRBSagas.length > 0){
        await removeStaleSagas(stalePRBSagas, 'PEN_REQUEST_BATCH');
      }
    } catch (e) {
      log.info(`locks:remove-stale-saga-record, check other pods. ${e}`);
    }
  });
  removeStaleSagaRecordFromRedis.start();
} catch (e) {
  log.error(e);
}
