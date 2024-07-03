'use strict';
const Redis = require('./redis-client');
const log = require('../../components/logger');
const safeStringify = require('fast-safe-stringify');
const RedLock = require('redlock');
const {LocalDateTime} = require('@js-joda/core');
const HttpStatus = require('http-status-codes');
let redLock;
let redLockNoRetry;

/**
 *
 * @param event the event object to be stored , this contains sagaId, penRequestId,digitalId, eventPayload etc..
 * @returns {Promise<void>}
 */
async function createSagaRecord(event, redisKey) {
  try {
    const redisClient = Redis.getRedisClient();
    if (redisClient) {
      if (event) {
        event.createDateTime = LocalDateTime.now().toString(); // store the timestamp so that it can be checked through scheduler.
      }
      try {
        await this.getRedLock().lock(`locks:${redisKey}:addToSet-${event.sagaId}`, 500);
        await redisClient.sadd(redisKey, safeStringify(event));
      } catch (e) {
        log.info(`this pod could not acquire lock for locks:${redisKey}:addToSet-${event.sagaId}, check other pods. ${e}`);
      }
    } else {
      log.error('Redis client is not available, this should not have happened');
    }
  } catch (e) {
    log.error(`Error ${e}`);
  }
}

async function removeEventRecordFromRedis(event, redisKey) {
  let recordFoundFromRedis;
  const redisClient = Redis.getRedisClient();
  if (redisClient) {
    try {
      const result = await redisClient.smembers(redisKey);
      if (result && result.length > 0) {
        for (const element of result) {
          const eventArrayElement = JSON.parse(element);
          if ((eventArrayElement.sagaId && event.sagaId && eventArrayElement.sagaId === event.sagaId) && ('COMPLETED' === event.sagaStatus || 'FORCE_STOPPED' === event.sagaStatus)) {
            log.info(`going to delete this event record as it is completed or force stopped. SAGA ID :: ${eventArrayElement.sagaId} AND STATUS :: ${event.sagaStatus}`);
            recordFoundFromRedis = eventArrayElement;
            try {
              await this.getRedLock().lock(`locks:saga:deleteFromSet-${event.sagaId}`, 500);
              await redisClient.srem(redisKey, safeStringify(eventArrayElement));
              log.info(`Event record deleted from REDIS. SAGA ID :: ${eventArrayElement.sagaId} AND STATUS :: ${event.sagaStatus}`);
            } catch (e) {
              log.info('this pod could not acquire lock', e);
            }
            break;
          }
        }
      } else {
        log.silly(`no record found in REDIS for :: ${redisKey} :: for Event ::`, event);
      }
    } catch (e) {
      log.error(`Error ${e}`);
    }
  } else {
    log.error('Redis client is not available, this should not have happened');
  }
  return recordFoundFromRedis;
}

function getSagaEventsByRedisKey(redisKey) {
  const redisClient = Redis.getRedisClient();
  if (redisClient) {
    return redisClient.smembers(redisKey);
  } else {
    log.error('Redis client is not available, this should not have happened');
  }
}

async function lockSdcStudentBeingProcessedInRedis(sdcSchoolStudentID) {
  try {
    console.log(this.getRedLock());
    return await this.getRedLockNoRetry().acquire(`locks:edx-sdc-student:${sdcSchoolStudentID}`, 6000);
  } catch (e) {
    log.info(`This pod could not acquire lock for locks:edx-sdc-student:${sdcSchoolStudentID}, check other pods. ${e}`);
    throw new Error(HttpStatus.CONFLICT.toString());
  }
}

async function unlockSdcStudentBeingProcessedInRedis(lock) {
  try {
    await this.getRedLockNoRetry().unlock(lock);
  } catch (e) {
    log.info(`This pod could not release lock for: ${lock}, check other pods. ${e}`);
  }
}

const redisUtil = {
  createSagaRecord,
  removeEventRecordFromRedis,
  getSagaEventsByRedisKey,
  lockSdcStudentBeingProcessedInRedis,
  unlockSdcStudentBeingProcessedInRedis,
  getRedLock() {
    if (redLock) {
      return redLock; // reusable red lock object.
    } else {
      redLock = new RedLock(
        [Redis.getRedisClient()],
        {
          // the expected clock drift; for more details
          // see http://redis.io/topics/distlock
          driftFactor: 0.01, // time in ms

          // the max number of times Redlock will attempt
          // to lock a resource before erroring
          retryCount: 3,

          // the time in ms between attempts
          retryDelay: 25, // time in ms

          // the max time in ms randomly added to retries
          // to improve performance under high contention
          // see https://www.awsarchitectureblog.com/2015/03/backoff.html
          retryJitter: 15 // time in ms
        }
      );
    }

    redLock.on('clientError', function (err) {
      log.error('A redis connection error has occurred in getRedLock of redis-util:', err);
    });
    return redLock;
  },
  getRedLockNoRetry() {
    if (redLockNoRetry) {
      return redLockNoRetry; // reusable red lock object.
    } else {
      redLockNoRetry = new RedLock(
        [Redis.getRedisClient()],
        {
          // the expected clock drift; for more details
          // see http://redis.io/topics/distlock
          driftFactor: 0.01, // time in ms

          // the max number of times Redlock will attempt
          // to lock a resource before erroring
          retryCount: 0,

          // the time in ms between attempts
          retryDelay: 50, // time in ms

          // the max time in ms randomly added to retries
          // to improve performance under high contention
          // see https://www.awsarchitectureblog.com/2015/03/backoff.html
          retryJitter: 25 // time in ms
        }
      );
    }
    redLockNoRetry.on('clientError', function (err) {
      log.error('A redis connection error has occurred in getRedLock of redis-util:', err);
    });
    return redLockNoRetry;
  },
  /**
   * this is central so that it is in one common place accessed by different js , files, accidental update wont cause any damage to the app, as it will be referred from all the files.
   * @param pen
   * @returns {string}
   */
  constructKeyForPenLock(pen) {
    return `{locked-pen}${pen}`;
  },

};

module.exports = redisUtil;
