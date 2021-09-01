'use strict';
const log = require('../../components/logger');
const SAGAS = require('../../components/saga');
const config = require('../../config/index');
const redisUtil = require('../../util/redis/redis-utils');
const webSocket = require('../../socket/web-socket');
const CONSTANTS = require('../../util/constants');
const NATS = require('../message-pub-sub');
const {StringCodec} = require('nats');
const sc = StringCodec();

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
  const event = JSON.parse(sc.decode(msg.data)); // it is always a JSON string of Event object.
  log.info(`Received message, on ${msg.subject} , Subscription Id ::  [${msg.sid}], Reply to ::  [${msg.reply}] :: Data ::`, event);
  let isWebSocketBroadcastingRequired = false;
  if ('COMPLETED' === event.sagaStatus || 'FORCE_STOPPED' === event.sagaStatus) {
    const saga = Object.values(SAGAS).find(sagaData => sagaData.sagaTopics.includes(msg.subject));
    if(saga) {
      const recordFoundInRedis = await redisUtil.removeEventRecordFromRedis(event, saga.sagaEventRedisKey);
      // if record is not found in redis means duplicate message which was already processed.
      if (recordFoundInRedis) {
        isWebSocketBroadcastingRequired = true;
      }
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
    log.info(`Received message, on ${msg.subject} , Subscription Id ::  [${msg.sid}], Reply to ::  [${msg.reply}] :: Data ::`, data);
    broadCastMessageToWebSocketClients(dataStr);
  }
}


const SagaMessageHandler = {
  subscribe() {
    const sagaTopics = Object.values(SAGAS).flatMap(saga => saga.sagaTopics);
    sagaTopics.forEach((topic) => {
      subscribeSagaMessages(NATS.getConnection(), topic, handleSagaMessage);
    });
    subscribeToWebSocketMessageTopic(NATS.getConnection());
  },

};

module.exports = SagaMessageHandler;
