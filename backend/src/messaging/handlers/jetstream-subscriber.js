'use strict';
const TOPICS = ['STUDENT_EVENTS_TOPIC'];
const logger = require('../../components/logger');
const CONSTANTS = require('../../util/constants');
const redis = require('../../util/redis/redis-client');
const redisUtil = require('../../util/redis/redis-utils');
const NATS = require('../../messaging/message-pub-sub');
const safeStringify = require('fast-safe-stringify').default;
const {AckPolicy, DeliverPolicy, StringCodec} = require('nats');
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
    NATS.publishMessage(CONSTANTS.EVENT_WS_TOPIC, StringCodec().encode(safeStringify(data))).then(() => { // publish the message only if key was present in redis, otherwise just acknowledge to STAN.
      logger.info(`message published to ${CONSTANTS.EVENT_WS_TOPIC}`, data);
    });
  }
}

const handleJetStreamMessage = async (err, msg) => {
  if (err) {
    logger.error(err);
    return;
  }
  const data = JSON.parse(StringCodec().decode(msg.data)); // it would always be a JSON string. ii will always be choreographed event.
  logger.info(`Received message, on ${msg.subject} , Sequence ::  [${msg.seq}], sid ::  [${msg.sid}], redelivered ::  [${msg.redelivered}] :: Data ::`, data);
  try {
    if (data.eventType === CONSTANTS.EVENT_TYPE.UPDATE_STUDENT && data.eventOutcome === CONSTANTS.EVENT_OUTCOME.STUDENT_UPDATED) {
      await handleStudentUpdatedEvent(data);
    } else if (data.eventType === CONSTANTS.EVENT_TYPE.CREATE_STUDENT && data.eventOutcome === CONSTANTS.EVENT_OUTCOME.STUDENT_CREATED) { // this scenario occurs for GMP complete as data is not migrated from VMS yet
      const student = JSON.parse(data.eventPayload); // the event payload is expected to be a student object as json string, so we parse it here.
      const value = await redis.getRedisClient().del(redisUtil.constructKeyForPenLock(student.pen)); // just delete the pen from redis lock
      if (value) {
        logger.info('locked pen deleted from redis', student.pen);
      }
    }
    msg.ack(); // acknowledge to JetStream
  } catch (e) {
    logger.error('Error while handling student data from update student event', e);
  }
};

const subscribe = () => {
  const jetStream = NATS.getConnection().jetstream();
  TOPICS.forEach(async (key) => {

    const consumerOpts = {
      config: {
        name: 'student-admin',
        durable_name: 'student-admin-node-durable',
        ack_policy: AckPolicy.Explicit,
        deliver_policy: DeliverPolicy.New,
        deliver_subject: 'STUDENT_EVENTS_STUDENT_ADMIN_NODE'
      },
      mack: true,
      queue: 'student-admin-node-js-queue-group',
      stream: 'STUDENT_EVENTS',
      callbackFn: handleJetStreamMessage,
    };

    await jetStream.subscribe(key, consumerOpts);
  });

};
module.exports = {
  subscribe
};
