'use strict';
const log = require('../../components/logger');

const redisUtil = require('../../util/redis/redis-utils');
const webSocket = require('../../socket/web-socket');

const SagaTopics = ['PEN_REQUEST_RETURN_SAGA_TOPIC', 'PEN_REQUEST_UNLINK_SAGA_TOPIC', 'PEN_REQUEST_REJECT_SAGA_TOPIC', 'PEN_REQUEST_COMPLETE_SAGA_TOPIC',
  'STUDENT_PROFILE_REQUEST_REJECT_SAGA_TOPIC','STUDENT_PROFILE_REQUEST_RETURN_SAGA_TOPIC','STUDENT_PROFILE_COMPLETE_SAGA_TOPIC'];
const SagaEventWebSocketTopic = 'SAGA_EVENT_WS_TOPIC';

function subscribeSagaMessages(stan, opts, topic, handleMessage) {
  const sagaSubscription = stan.subscribe(topic, 'student-admin-node-saga-queue-group', opts);
  sagaSubscription.on('error', (err) => {
    log.error(`subscription for ${topic} raised an error: ${err}`);
  });
  sagaSubscription.on('ready', () => {
    log.info(`subscribed to ${topic}`);
  });
  sagaSubscription.on('message', (msg) => {
    log.silly(`Received message, on ${msg.getSubject()} , Sequence ::  [${msg.getSequence()}] :: Data ::`, JSON.parse(msg.getData()));
    handleMessage(msg, stan);
  });
}

async function handleSagaMessage(msg, stan) {
  let isWebSocketBroadcastingRequired = false;
  const event = JSON.parse(msg.getData()); // it is always a JSON string of Event object.
  if('COMPLETED' === event.sagaStatus || 'FORCE_STOPPED' === event.sagaStatus){
    const recordFoundInRedis = await redisUtil.removeSagaRecordFromRedis(event); // if record is not found in redis means duplicate message which was already processed.
    if(recordFoundInRedis){
      isWebSocketBroadcastingRequired = true;
    }
  }else if('INITIATED' === event.sagaStatus) {
    isWebSocketBroadcastingRequired = true;
  }
  if(isWebSocketBroadcastingRequired){
    stan.publish(SagaEventWebSocketTopic, msg.getData(), (err, guid) => {
      if (err) {
        log.error(`Error publishing to ${SagaEventWebSocketTopic}`, err);
      } else {
        log.silly(`published to :: ${SagaEventWebSocketTopic} :: (${guid})`);
      }
    });
  }
  msg.ack(); // manual acknowledgement that message was received and processed successfully.
}

function broadCastMessageToWebSocketClients(msg){
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

function subscribeToWebSocketMessageTopic(stan, opts) {
  const SagaEventWebSocketTopicSubscription = stan.subscribe(SagaEventWebSocketTopic, '', opts);
  SagaEventWebSocketTopicSubscription.on('error', (err) => {
    log.error(`subscription for ${SagaEventWebSocketTopic} raised an error: ${err}`);
  });
  SagaEventWebSocketTopicSubscription.on('ready', () => {
    log.info(`subscribed to ${SagaEventWebSocketTopic}`);
  });
  SagaEventWebSocketTopicSubscription.on('message', (msg) => {
    log.silly(`Received message, on ${msg.getSubject()} , Sequence ::  [${msg.getSequence()}] :: Data ::`, JSON.parse(msg.getData()));
    broadCastMessageToWebSocketClients(msg.getData());
    msg.ack(); // manual acknowledgement that message was received and processed successfully.
  });
}

const SagaMessageHandler = {
  /**
   * This is where all the subscription will be done related pen requests
   * due to this issue https://github.com/nats-io/stan.go/issues/208
   * system is needed to have queue group subscription so that message is never lost if all the pod dies,
   * refer to this https://docs.nats.io/nats-streaming-concepts/channels/subscriptions/queue-group
   * create a separate topic for pub sub of messages related to websocket clients.
   * @param stan
   */
  subscribe(stan) {
    const opts = stan.subscriptionOptions().setStartAt(0);
    opts.setManualAckMode(true);
    opts.setAckWait(30000); // 30 seconds
    opts.setDurableName('student-admin-node-consumer');
    SagaTopics.forEach((topic) => {
      subscribeSagaMessages(stan, opts, topic, handleSagaMessage);
    });
    subscribeToWebSocketMessageTopic(stan, opts);
  },

};

module.exports = SagaMessageHandler;
