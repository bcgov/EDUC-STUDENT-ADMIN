'use strict';
const Redis = require('./redis-client');
const log = require('../../components/logger');
const penReqSagaEventKey = 'PEN_REQUEST_SAGA_EVENTS';
const redisUtil = {

  /**
     *
     * @param event the event object to be stored , this contains sagaId, penRequestId,digitalId, eventPayload etc..
     * @returns {Promise<void>}
     */
  async createOrUpdatePenRequestSagaRecordInRedis(event) {
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
          log.silly(result);
          if (Array.isArray(eventArray) && eventArray.length > 0) {
            for (let i = eventArray.length - 1; i >= 0; --i) {
              const eventArrayElement = eventArray[i];
              if ((eventArrayElement.sagaId && event.sagaId && eventArrayElement.sagaId === event.sagaId) && ('COMPLETED' === event.sagaStatus)) {
                log.silly(`going to delete this event record as it is completed. ${eventArrayElement.sagaId}`);
                penRequestID = eventArrayElement.penRequestID;
                eventArray.splice(i, 1); // remove this record as the saga is completed.
              } else if (eventArrayElement.sagaId && event.sagaId && eventArrayElement.sagaId === event.sagaId) { //update the record data.
                log.silly(`going to update this event record . ${eventArrayElement.sagaId}`);
                penRequestID = eventArrayElement.penRequestID;
                eventArrayElement.eventType = event.eventType;
                eventArrayElement.eventOutcome = event.eventOutcome;
                eventArrayElement.eventPayload = event.eventPayload;
              }
            }
          } else {
            log.silly('did not find any data in the array adding fresh one .');
            eventArray.push(event);
          }
        } else {
          log.silly('did not find any data in redis for the given key adding fresh one .');
          eventArray.push(event);
        }
        await redisClient.set(penReqSagaEventKey, JSON.stringify(eventArray));
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
