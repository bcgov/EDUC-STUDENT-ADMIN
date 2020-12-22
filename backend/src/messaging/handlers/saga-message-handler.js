'use strict';
const log = require('../../components/logger');
const config= require('../../config/index');
const redisUtil = require('../../util/redis/redis-utils');
const webSocket = require('../../socket/web-socket');


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
  'PEN_REQUEST_BATCH_USER_UNMATCH_PROCESSING_TOPIC'];

const SagaEventWebSocketTopic = 'SAGA_EVENT_WS_TOPIC';

function subscribeSagaMessages(nats, topic, handleMessage) {
  const opts = {
    queue : config.get('messaging:queueGroupName')//'student-admin-node-queue-group'
  };

  nats.subscribe(topic, opts, (msg, reply, subject, sid) => {
    log.silly(`Received message, on ${subject} , Subscription Id ::  [${sid}], Reply to ::  [${reply}] :: Data ::`, JSON.parse(msg));
    handleMessage(msg, subject, reply, nats);
  });
}

async function handleSagaMessage(msg, subject, replyTo,  nats) {
  let isWebSocketBroadcastingRequired = false;
  const event = JSON.parse(msg); // it is always a JSON string of Event object.
  if ('COMPLETED' === event.sagaStatus || 'FORCE_STOPPED' === event.sagaStatus) {
    let recordFoundInRedis;
    if (subject?.startsWith('PEN_REQUEST_BATCH')) {
      recordFoundInRedis = await redisUtil.removePenRequestBatchSagaRecordFromRedis(event);
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
    nats.publish(SagaEventWebSocketTopic, msg);
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

function subscribeToWebSocketMessageTopic(nats) {
  nats.subscribe(SagaEventWebSocketTopic, {}, (msg, reply, subject, sid) => {
    log.silly(`Received message, on ${subject} , Subscription Id ::  [${sid}], Reply to ::  [${reply}] :: Data ::`, JSON.parse(msg));
    broadCastMessageToWebSocketClients(msg);
  });
}

const SagaMessageHandler = {
  subscribe(nats) {
    SagaTopics.forEach((topic) => {
      subscribeSagaMessages(nats, topic, handleSagaMessage);
    });
    subscribeToWebSocketMessageTopic(nats);
  },

};

module.exports = SagaMessageHandler;
