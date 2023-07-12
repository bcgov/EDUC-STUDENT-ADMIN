'use strict';
const TOPICS = ['EDX_EVENT_TOPIC'];
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
  logger.debug(`Received message, on ${msg.subject} , Sequence ::  [${msg.seq}], sid ::  [${msg.sid}], redelivered ::  [${msg.redelivered}] :: Data ::`, data);
  try {
    if (data.eventType === CONSTANTS.EVENT_TYPE.COPY_USERS_TO_NEW_SCHOOL && data.eventOutcome === CONSTANTS.EVENT_OUTCOME.USERS_TO_NEW_SCHOOL_COPIED) {
      await handleEdxEvent(data, CONSTANTS.WS_MOVE_SCHOOL_TOPIC);
    }
    else if (data.eventType === CONSTANTS.EVENT_TYPE.SEND_EMAIL_NOTIFICATION_FOR_NEW_SECURE_EXCHANGE && data.eventOutcome === CONSTANTS.EVENT_OUTCOME.EMAIL_NOTIFICATION_FOR_NEW_SECURE_EXCHANGE_SENT) {
      await handleEdxEvent(data, CONSTANTS.WS_NEW_SECURE_MESSAGE_TOPIC);
    }
    msg.ack(); // acknowledge to JetStream
  } catch (e) {
    logger.error('Error while handling school data from update school event', e);
  }
};

async function handleEdxEvent(data, topic) {
  NATS.publishMessage(topic, StringCodec().encode(safeStringify(data))).then(() => { // publish the message only if key was present in redis, otherwise just acknowledge to STAN.
    logger.info(`Message published to ${topic}`, data);
  });
}

const subscribe = () => {
  const jetStream = NATS.getConnection().jetstream();
  TOPICS.forEach(async (key) => {

    const consumerOpts = {
      config: {
        name: 'student-admin-edx',
        durable_name: 'student-admin-edx-node-durable',
        ack_policy: AckPolicy.Explicit,
        deliver_policy: DeliverPolicy.New,
        deliver_subject: 'EDX_EVENTS_STUDENT_ADMIN_NODE'
      },
      mack: true,
      queue: 'student-admin-edx-node-js-queue-group',
      stream: 'EDX_EVENTS',
      callbackFn: handleJetStreamMessage,
    };

    await jetStream.subscribe(key, consumerOpts);
  });

};
module.exports = {
  subscribe
};
