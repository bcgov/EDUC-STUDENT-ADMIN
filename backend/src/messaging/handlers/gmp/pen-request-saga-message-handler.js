'use strict';
const log = require('../../../components/logger');

const redisUtil = require('../../../util/redis/redis-utils');
const webSocket = require('../../../socket/web-socket');

const SagaTopics = ['PEN_REQUEST_RETURN_SAGA_TOPIC', 'PEN_REQUEST_UNLINK_SAGA_TOPIC', 'PEN_REQUEST_REJECT_SAGA_TOPIC', 'PEN_REQUEST_COMPLETE_SAGA_TOPIC'];

function subscribeSagaMessages(stan, opts, topic, handleMessage) {
  const sagaSubscription = stan.subscribe(topic, '', opts);// no queue group as all the pods need the messages to broadcast to websocket clients.
  sagaSubscription.on('error', (err) => {
    log.error(`subscription for ${topic} raised an error: ${err}`);
  });
  sagaSubscription.on('message', (msg) => {
    handleMessage(msg);
  });
}

async function handlePenRequestSagaMessage(msg) {
  const event = JSON.parse(msg.getData()); // it is always a JSON string of Event object.
  log.silly(`received message for SAGA ID :: ${event.sagaId} :: getSequence ${msg.getSequence()} :: event :: `, event);
  if('COMPLETED' === event.sagaStatus || 'FORCE_STOPPED' === event.sagaStatus){
    const recordFoundInRedis = await redisUtil.removePenRequestSagaRecordFromRedis(event); // if record is not found in redis means duplicate message which was already processed.
    if(recordFoundInRedis){
      broadCastMessageToWebSocketClients(msg.getData());
    }
  }else if('INITIATED' === event.sagaStatus) {
    broadCastMessageToWebSocketClients(msg.getData());
  }
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

const PenRequestSagaMessageHandler = {
  /**
   * This is where all the subscription will be done related pen requests
   * @param stan
   */
  subscribe(stan) {
    const opts = stan.subscriptionOptions().setStartAt(0);
    opts.setDurableName('student-admin-node-consumer');
    SagaTopics.forEach((topic) => {
      subscribeSagaMessages(stan, opts, topic, handlePenRequestSagaMessage);
    });
  },

};

module.exports = PenRequestSagaMessageHandler;
