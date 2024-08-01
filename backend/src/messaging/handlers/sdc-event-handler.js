'use strict';
const log = require('../../components/logger');
const webSocket = require('../../socket/web-socket');
const CONSTANTS = require('../../util/constants');
const NATS = require('../message-pub-sub');
const {StringCodec} = require('nats');
const sc = StringCodec();
const TOPICS = [CONSTANTS.WS_CLOSE_COLLECTION_TOPIC];


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

async function subscribeToWebSocketMessageTopic(nats, topic) {
  const opts = {};
  const sub = nats.subscribe(topic, opts);
  log.info(` listening to ${topic}`);
  for await (const msg of sub) {
    const dataStr = sc.decode(msg.data);
    const data = JSON.parse(dataStr);
    log.info(`Received message, on ${msg.subject} , Subscription Id ::  [${msg.sid}], Reply to ::  [${msg.reply}] :: Data ::`, data);
    broadCastMessageToWebSocketClients(dataStr);
  }
}


const SdcSagaMessageHandler = {
  subscribe() {
    TOPICS.forEach((topic) =>{
      subscribeToWebSocketMessageTopic(NATS.getConnection(), topic);
    });
  },

};

module.exports = SdcSagaMessageHandler;
