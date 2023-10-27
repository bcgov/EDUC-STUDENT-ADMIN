'use strict';
const TOPICS = ['INSTITUTE_EVENTS_TOPIC'];
const logger = require('../../components/logger');
const CONSTANTS = require('../../util/constants');
const NATS = require('../../messaging/message-pub-sub');
const {AckPolicy, DeliverPolicy, StringCodec} = require('nats');
const safeStringify = require('fast-safe-stringify');

const handleJetStreamMessage = async (err, msg) => {
  if (err) {
    logger.error(err);
    return;
  }
  const data = JSON.parse(StringCodec().decode(msg.data)); // it would always be a JSON string. ii will always be choreographed event.
  logger.info(`Received message, on ${msg.subject} , Sequence ::  [${msg.seq}], sid ::  [${msg.sid}], redelivered ::  [${msg.redelivered}] :: Data ::`, data);
  try {
    if (data.eventType === CONSTANTS.EVENT_TYPE.UPDATE_SCHOOL || data.eventType === CONSTANTS.EVENT_TYPE.CREATE_SCHOOL
      || data.eventType === CONSTANTS.EVENT_TYPE.UPDATE_AUTHORITY || data.eventType === CONSTANTS.EVENT_TYPE.CREATE_AUTHORITY
      || data.eventType === CONSTANTS.EVENT_TYPE.UPDATE_DISTRICT || data.eventType === CONSTANTS.EVENT_TYPE.CREATE_DISTRICT) {
      await handleInstituteEvent('NT');
    }
    msg.ack(); // acknowledge to JetStream
  } catch (e) {
    logger.error('Error while handling school data from update school event', e);
  }
};

async function handleInstituteEvent(data) {
  logger.info('Received institute message: ' + JSON.stringify(data));
  NATS.publishMessage(CONSTANTS.INSTITUTE_CACHE_REFRESH_TOPIC, StringCodec().encode(safeStringify(data))).then(() => { // publish the message only if key was present in redis, otherwise just acknowledge to STAN.
    logger.info(`Message published to ${CONSTANTS.INSTITUTE_CACHE_REFRESH_TOPIC}`, data);
  });
}

const subscribe = () => {
  const jetStream = NATS.getConnection().jetstream();
  TOPICS.forEach(async (key) => {

    const consumerOpts = {
      config: {
        name: 'student-admin-institute',
        durable_name: 'student-admin-institute-node-durable',
        ack_policy: AckPolicy.Explicit,
        deliver_policy: DeliverPolicy.New,
        deliver_subject: 'INSTITUTE_EVENTS_STUDENT_ADMIN_NODE'
      },
      mack: true,
      queue: 'student-admin-institute-node-js-queue-group',
      stream: 'INSTITUTE_EVENTS',
      callbackFn: handleJetStreamMessage,
    };

    await jetStream.subscribe(key, consumerOpts);
  });

};
module.exports = {
  subscribe
};
