'use strict';
const Redis = require('./redis-client');
const log = require('../../components/logger');
const penReqSagaEventKey = 'PEN_REQUEST_SAGA_EVENTS';
const safeStringify = require('fast-safe-stringify');
const RedLock = require('redlock');

const redisUtil = {
  /**
     *
     * @param event the event object to be stored , this contains sagaId, penRequestId,digitalId, eventPayload etc..
     * @returns {Promise<void>}
     */
  async createOrUpdatePenRequestSagaRecordInRedis(event) {
    let isDataUpdated = false;
    let penRequestID;
    if(event && event.penRequestID){
      penRequestID =  event.penRequestID;
    }
    try {
      const redisClient = Redis.getRedisClient();
      if (redisClient) {
        const result = await redisClient.get(penReqSagaEventKey);
        let eventArray = [];
        if (result) {
          eventArray = JSON.parse(result);
          if (Array.isArray(eventArray) && eventArray.length > 0) {
            for (let i = eventArray.length - 1; i >= 0; --i) {
              const eventArrayElement = eventArray[i];
              if ((eventArrayElement.sagaId && event.sagaId && eventArrayElement.sagaId === event.sagaId) && ('COMPLETED' === event.sagaStatus)) {
                log.silly(`going to delete this event record as it is completed. ${eventArrayElement.sagaId}`);
                penRequestID = eventArrayElement.penRequestID;
                eventArray.splice(i, 1); // remove this record as the saga is completed.
                isDataUpdated = true;
              } else {
                penRequestID = eventArrayElement.penRequestID; // just return this, so that it will be broadcast via websocket.
              }
            }
          } else {
            log.silly('did not find any data in the array adding fresh one .');
            eventArray.push(event);
            isDataUpdated = true;
          }
        } else {
          log.silly('did not find any data in redis for the given key adding fresh one .');
          eventArray.push(event);
          isDataUpdated = true;
        }
        if (isDataUpdated) { // update in redis only when data is updated.
          try {
            const redLock = new RedLock(
              [Redis.getRedisClient()],
              {
                // the expected clock drift; for more details
                // see http://redis.io/topics/distlock
                driftFactor: 0.01, // time in ms

                // the max number of times Redlock will attempt
                // to lock a resource before erroring
                retryCount: 0,

                // the time in ms between attempts
                retryDelay: 20, // time in ms

                // the max time in ms randomly added to retries
                // to improve performance under high contention
                // see https://www.awsarchitectureblog.com/2015/03/backoff.html
                retryJitter: 20 // time in ms
              }
            );
            redLock.on('clientError', function (err) {
              log.error('A redis connection error has occurred:', err);
            });
            const lock = await redLock.lock('locks:pen-request-saga:updateMessage', 200);
            await redisClient.set(penReqSagaEventKey, safeStringify(eventArray));
            lock.unlock()
              .catch(function (err) {
                // we weren't able to reach redis; your lock will eventually
                // expire, but you probably want to log this error
                log.info(`Error while trying to release lock ${err}`);
              });
          } catch (e) {
            log.info(`this pod could not acquire lock, check other pods. ${e}`);
          }
        }
      } else {
        log.error('Redis client is not available, this should not have happened');
      }
    } catch (e) {
      log.error(`Error ${e}`);
    }
    return penRequestID; // return the pen request ID so that it can be passed to frontend.
  },
  async getPenRequestSagaEvents() {
    const redisClient = Redis.getRedisClient();
    if (redisClient) {
      return await redisClient.get(penReqSagaEventKey);
    } else {
      log.error('Redis client is not available, this should not have happened');
    }
  }
};

module.exports = redisUtil;
