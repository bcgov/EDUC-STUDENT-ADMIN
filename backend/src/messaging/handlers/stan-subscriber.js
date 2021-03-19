'use strict';
const TOPICS = ['STUDENT_EVENTS_TOPIC'];
const logger = require('../../components/logger');
const CONSTANTS = require('../../util/constants');
const redis = require('../../util/redis/redis-client');
const redisUtil = require('../../util/redis/redis-utils');
const NATS = require('../../messaging/message-pub-sub');
/**
 * this function will process the choreographed event of student update, remove the record from redis if it is locked and publish the message to websocket
 *
 * @param data ChoreographedEvent
 */
async function handleStudentUpdatedEvent(data) {
  const student = JSON.parse(data.eventPayload); // the event payload is expected to be a student object as json string, so we parse it here.
  const value = await redis.getRedisClient().del(redisUtil.constructKeyForPenLock(student.pen));
  if(value){ // it means the key was present and it was successfully deleted, need to broadcast this to websocket for page refresh.
    logger.info('locked pen deleted from redis', student.pen);
  }
  NATS.publishMessage(CONSTANTS.EVENT_WS_TOPIC, data).then(() => {
    logger.info(`message published to ${CONSTANTS.EVENT_WS_TOPIC}`, data);
  });
}

const subscribe = (stanConnection) => {
  if(!stanConnection){
    logger.error('Stan Connection cant be null or undefined here');
    throw new Error('Stan Connection cant be null or undefined here');
  }
  const stanSubscriptionOpts = stanConnection
    .subscriptionOptions()
    .setManualAckMode(true)
    .setAckWait(120000) // in milli seconds , STAN will wait 2 minutes before resending.
    .setDurableName('student-admin-node-stan-consumer');

  TOPICS.forEach((topic) => {
    const subscription = stanConnection.subscribe(topic, 'student-admin-node-queue', stanSubscriptionOpts);
    subscription.on('error', (err) => {
      logger.error(`subscription for ${topic} raised an error: ${err}`);
    });
    subscription.on('ready', () => {
      logger.info(`subscribed to ${topic}`);
    });
    subscription.on('message', async (msg) => {
      const data = JSON.parse(msg.getData().toString()); // it would always be a JSON string. ii will always be choreographed event.
      logger.silly(`Received message, on ${msg.getSubject()} , Sequence ::  [${msg.getSequence()}] :: Data ::`, data);
      try {
        if (data.eventType === CONSTANTS.EVENT_TYPE.UPDATE_STUDENT && data.eventOutcome === CONSTANTS.EVENT_OUTCOME.STUDENT_UPDATED) {
          await handleStudentUpdatedEvent(data);
        }
        msg.ack(); // acknowledge to STAN
      } catch (e) {
        logger.error('Error while handling student data from update student event', e);
      }

    });
  });
};
module.exports = {
  subscribe
};
