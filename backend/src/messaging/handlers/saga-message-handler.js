'use strict';
const log = require('../../components/logger');
const config = require('../../config/index');
const redisUtil = require('../../util/redis/redis-utils');
const webSocket = require('../../socket/web-socket');
const CONSTANTS = require('../../util/constants');
const NATS = require('../message-pub-sub');
const {StringCodec} = require('nats');
const sc = StringCodec();
const SagaTopics = [
  'PEN_REQUEST_RETURN_SAGA_TOPIC',
  'PEN_REQUEST_UNLINK_SAGA_TOPIC',
  'PEN_REQUEST_REJECT_SAGA_TOPIC',
  'PEN_REQUEST_COMPLETE_SAGA_TOPIC',
  'STUDENT_PROFILE_REQUEST_REJECT_SAGA_TOPIC',
  'STUDENT_PROFILE_REQUEST_RETURN_SAGA_TOPIC',
  'STUDENT_PROFILE_COMPLETE_SAGA_TOPIC',
  'PEN_REQUEST_BATCH_NEW_PEN_PROCESSING_TOPIC',
  'PEN_REQUEST_BATCH_USER_MATCH_PROCESSING_TOPIC',
  'PEN_REQUEST_BATCH_USER_UNMATCH_PROCESSING_TOPIC',
  'PEN_SERVICES_MERGE_STUDENTS_SAGA_TOPIC',
  'PEN_SERVICES_DEMERGE_STUDENTS_SAGA_TOPIC',
  'PEN_SERVICES_SPLIT_PEN_SAGA_TOPIC',
  'PEN_REQUEST_BATCH_ARCHIVE_AND_RETURN_TOPIC'];

async function subscribeSagaMessages(nats, topic, handleMessage) {
  const opts = {
    queue: config.get('messaging:queueGroupName'), //'student-admin-node-queue-group'
  };
  const sub = nats.subscribe(topic, opts);
  log.info(`${opts.queue},  listening to ${topic}`);
  for await (const m of sub) {
    handleMessage(m);
  }
}

async function handleSagaMessage(msg) {
  log.debug(`Received message, on ${msg.subject} , Subscription Id ::  [${msg.sid}], Reply to ::  [${msg.reply}] :: Data ::`, JSON.parse(sc.decode(msg.data)));
  let isWebSocketBroadcastingRequired = false;
  const event = JSON.parse(sc.decode(msg.data)); // it is always a JSON string of Event object.
  if ('COMPLETED' === event.sagaStatus || 'FORCE_STOPPED' === event.sagaStatus) {
    let recordFoundInRedis;
    if (msg.subject?.startsWith('PEN_REQUEST_BATCH')) {
      recordFoundInRedis = await redisUtil.removePenRequestBatchSagaRecordFromRedis(event);
    } else if (msg.subject?.startsWith('PEN_SERVICES')) {
      recordFoundInRedis = await redisUtil.removePenServicesSagaRecordFromRedis(event);
    } else {
      recordFoundInRedis = await redisUtil.removeSagaRecordFromRedis(event);
    }
    // if record is not found in redis means duplicate message which was already processed.
    if (recordFoundInRedis) {
      isWebSocketBroadcastingRequired = true;
    }
  } else if ('INITIATED' === event.sagaStatus) {
    isWebSocketBroadcastingRequired = true;
  }
  if (isWebSocketBroadcastingRequired) {
    await NATS.publishMessage(CONSTANTS.EVENT_WS_TOPIC, msg.data);
  }
}


function broadCastMessageToWebSocketClients(msg) {
  const connectedClients = webSocket.getWebSocketClients();
  if (connectedClients && connectedClients.length > 0) {
    for (const connectedClient of connectedClients) {
      try {
        connectedClient.send(msg);
      } catch (e) {
        log.error(`Error while sending message to connected client ${connectedClient} :: ${e}`);
      }
    }
  }
}

async function subscribeToWebSocketMessageTopic(nats) {

  const opts = {};
  const sub = nats.subscribe(CONSTANTS.EVENT_WS_TOPIC, opts);
  log.info(` listening to ${CONSTANTS.EVENT_WS_TOPIC}`);
  for await (const msg of sub) {
    const dataStr = sc.decode(msg.data);
    const data = JSON.parse(dataStr);
    log.debug(`Received message, on ${msg.subject} , Subscription Id ::  [${msg.sid}], Reply to ::  [${msg.reply}] :: Data ::`, data);
    broadCastMessageToWebSocketClients(dataStr);
  }
}


const SagaMessageHandler = {
  subscribe() {
    SagaTopics.forEach((topic) => {
      subscribeSagaMessages(NATS.getConnection(), topic, handleSagaMessage);
    });
    subscribeToWebSocketMessageTopic(NATS.getConnection());
  },

};

module.exports = SagaMessageHandler;
