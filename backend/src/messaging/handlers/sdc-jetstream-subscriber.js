'use strict';
const TOPICS = ['SDC_EVENTS_TOPIC'];
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
    if (data.eventType === CONSTANTS.EVENT_TYPE.CLOSE_CURRENT_COLLECTION_AND_OPEN_NEW_COLLECTION && data.eventOutcome === CONSTANTS.EVENT_OUTCOME.NEW_COLLECTION_CREATED) {
      await handleSdcEvent(data, CONSTANTS.WS_CLOSE_COLLECTION_TOPIC);
    }
    msg.ack(); // acknowledge to JetStream
  } catch (e) {
    logger.error('Error while handling school data from update school event', e);
  }
};

async function handleSdcEvent(data, topic) {
  logger.debug('Received edx message: ' + JSON.stringify(data.eventPayload));
  NATS.publishMessage(topic, StringCodec().encode(safeStringify(data))).then(() => { // publish the message only if key was present in redis, otherwise just acknowledge to STAN.
    logger.info(`Message published to ${topic}`, data);
  });
}

const subscribe = () => {
  const jetStream = NATS.getConnection().jetstream();
  TOPICS.forEach(async (key) => {

    const consumerOpts = {
      config: {
        name: 'student-admin-sdc',
        durable_name: 'student-admin-sdc-node-durable',
        ack_policy: AckPolicy.Explicit,
        deliver_policy: DeliverPolicy.New,
        deliver_subject: 'SDC_EVENTS_STUDENT_ADMIN_NODE'
      },
      mack: true,
      queue: 'student-admin-sdc-node-js-queue-group',
      stream: 'SDC_EVENTS',
      callbackFn: handleJetStreamMessage,
    };

    await jetStream.subscribe(key, consumerOpts);
  });

};
module.exports = {
  subscribe
};
