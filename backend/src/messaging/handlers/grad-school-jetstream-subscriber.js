'use strict';
const TOPICS = ['GRAD_SCHOOL_EVENTS_TOPIC'];
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
    if (data.eventType === CONSTANTS.EVENT_TYPE.UPDATE_GRAD_SCHOOL) {
      await handleGradSchoolEvent('NT', CONSTANTS.GRAD_SCHOOL_CACHE_REFRESH_TOPIC);
    }
    msg.ack(); // acknowledge to JetStream
  } catch (e) {
    logger.error('Error while handling school data from update school event', e);
  }
};

async function handleGradSchoolEvent(data, topic) {
  logger.debug('Received institute message: ' + JSON.stringify(data));
  NATS.publishMessage(topic, StringCodec().encode(safeStringify(data))).then(() => { // publish the message only if key was present in redis, otherwise just acknowledge to STAN.
    logger.info(`Message published to ${topic}`, data);
  });
}

const subscribe = () => {
  const jetStream = NATS.getConnection().jetstream();
  TOPICS.forEach(async (key) => {

    const consumerOpts = {
      config: {
        name: 'student-admin-grad-school',
        durable_name: 'student-admin-grad-school-node-durable',
        ack_policy: AckPolicy.Explicit,
        deliver_policy: DeliverPolicy.New,
        deliver_subject: 'GRAD_SCHOOL_EVENTS_STUDENT_ADMIN_NODE'
      },
      mack: true,
      queue: 'student-admin-grad-school-node-js-queue-group',
      stream: 'GRAD_SCHOOL_EVENTS',
      callbackFn: handleJetStreamMessage,
    };

    await jetStream.subscribe(key, consumerOpts);
  });

};
module.exports = {
  subscribe
};
