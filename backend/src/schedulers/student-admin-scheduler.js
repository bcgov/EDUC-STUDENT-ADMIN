'use strict';
const CronJob = require('cron').CronJob;
const config = require('../config/index');
const log = require('../components/logger');
const {getApiCredentials} = require('../components/auth');
const safeStringify = require('fast-safe-stringify');
const {getData} = require('../components/utils');
const schedulerCronStaleSagaRecordRedis = config.get('scheduler:schedulerCronStaleSagaRecordRedis');
const minimumTimeBeforeSagaIsStale = config.get('scheduler:minTimeBeforeSagaIsStaleInSeconds'); // should be in seconds.
log.info(`${schedulerCronStaleSagaRecordRedis} :: ${minimumTimeBeforeSagaIsStale}`);
const redisUtil = require('../util/redis/redis-utils');
const {LocalDateTime} = require('@js-joda/core');
const NATS = require('../messaging/message-pub-sub');
const CONSTANTS = require('../util/constants');
/**
 * @property minimumTimeBeforeSagaIsStale - this is the value which will be subtracted from current time.
 * This method will check whether the saga record was created @property minimumTimeBeforeSagaIsStale before, if so add it to the list
 * @param inProgressSagas the records from redis.
 * @returns {[]} array of saga records, if nothing matches criteria, blank array.
 */
function findStaleSagaRecords(inProgressSagas) {
  let staleSagas = [];
  if (inProgressSagas && inProgressSagas.length > 0) {
    for (const sagaString of inProgressSagas) {
      const saga = JSON.parse(sagaString);
      const isStaleRecord = LocalDateTime.parse(saga.createDateTime).isBefore(LocalDateTime.now().minusSeconds(minimumTimeBeforeSagaIsStale));
      if (isStaleRecord) {
        staleSagas.push(saga);
      }
    }
  }
  return staleSagas;
}

/**
 *
 * @param staleSagas the sagas which are considered stale, as it took more than desired time to be completed.
 * @param sagaType the saga type, whether GMP/UMP or PEN_REQUEST_BATCH
 * @returns {Promise<void>}
 */
async function removeStaleSagas(staleSagas, sagaType) {
  let sagaRecordFromAPIPromises = [];
  try {
    const data = await getApiCredentials(); // get the tokens first to make api calls.
    for (const saga of staleSagas) {
      switch(sagaType) {
      case 'GMP_UMP':
        sagaRecordFromAPIPromises.push(getData(data.accessToken, `${config.get('server:profileSagaAPIURL')}/${saga.sagaId}`));
        break;
      case 'PEN_REQUEST_BATCH':
        sagaRecordFromAPIPromises.push(getData(data.accessToken, `${config.get('server:penRequestBatch:rootURL')}/pen-request-batch-saga/${saga.sagaId}`));
        break;
      case 'PEN_SERVICES':
        sagaRecordFromAPIPromises.push(getData(data.accessToken, `${config.get('server:penServices:rootURL')}/saga/${saga.sagaId}`));
        break;
      }
    }
    const results = await Promise.allSettled(sagaRecordFromAPIPromises);
    for (const result of results) {
      if ('fulfilled' === result.status) {
        let recordFromRedis;
        const sagaFromAPI = result.value;
        if ('COMPLETED' === sagaFromAPI.status || 'FORCE_STOPPED' === sagaFromAPI.status) {
          const event = {
            sagaId: sagaFromAPI.sagaId,
            sagaStatus: sagaFromAPI.status
          };
          switch(sagaType) {
          case 'GMP_UMP':
            recordFromRedis = await redisUtil.removeSagaRecordFromRedis(event);
            break;
          case 'PEN_REQUEST_BATCH':
            recordFromRedis = await redisUtil.removePenRequestBatchSagaRecordFromRedis(event);
            break;
          case 'PEN_SERVICES':
            recordFromRedis = await redisUtil.removePenServicesSagaRecordFromRedis(event);
            break;
          }
          if (recordFromRedis) {
            recordFromRedis.sagaStatus = sagaFromAPI.status;
            recordFromRedis.sagaName = sagaFromAPI.sagaName;
            NATS.publishMessage(CONSTANTS.EVENT_WS_TOPIC, safeStringify(recordFromRedis)).then(() => {
              log.info(`message published to ${CONSTANTS.EVENT_WS_TOPIC}`, recordFromRedis);
            });
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
    log.debug('starting findAndRemoveStaleSagaRecord');
    const redLock = redisUtil.getRedLock();
    try {
      await redLock.lock('locks:remove-stale-saga-record', 6000); // no need to release the lock as it will auto expire after 6000 ms.
      const staleSagas = findStaleSagaRecords(await redisUtil.getSagaEvents());
      const stalePRBSagas = findStaleSagaRecords(await redisUtil.getPenRequestBatchSagaEvents());
      const staleServicesSagas = findStaleSagaRecords(await redisUtil.getPenServicesSagaEvents());
      if (staleSagas.length > 0) {
        log.info(`found ${staleSagas.length} stale GMP or UMP saga records`);
        removeStaleSagas(staleSagas, 'GMP_UMP').then(() => {
          log.debug('remove stale sagas completed');
        }).catch((e) => {
          log.error(e);
        });
      }
      if (stalePRBSagas.length > 0) {
        log.info(`found ${stalePRBSagas.length} stale PenRequestBatch saga records`);
        removeStaleSagas(stalePRBSagas, 'PEN_REQUEST_BATCH').then(() => {
          log.debug('remove stale PRB sagas completed');
        }).catch((e) => {
          log.error(e);
        });
      }
      if (staleServicesSagas.length > 0) {
        log.info(`found ${staleServicesSagas.length} stale PenServices saga records`);
        removeStaleSagas(staleServicesSagas, 'PEN_SERVICES').then(() => {
          log.debug('remove stale PenServices sagas completed');
        }).catch((e) => {
          log.error(e);
        });
      }
    } catch (e) {
      log.debug(`locks:remove-stale-saga-record, check other pods. ${e}`);
    }
  });
  removeStaleSagaRecordFromRedis.start();
} catch (e) {
  log.error(e);
}
