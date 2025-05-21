'use strict';
const log = require('../../components/logger');
const webSocket = require('../../socket/web-socket');
const CONSTANTS = require('../../util/constants');
const NATS = require('../message-pub-sub');
const {StringCodec} = require('nats');
const cacheService = require('../../components/cache-service');
const sc = StringCodec();

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

async function subscribeToGradSchoolAPIMessageTopic(nats) {
  const opts = {};
  const sub = nats.subscribe(CONSTANTS.GRAD_SCHOOL_CACHE_REFRESH_TOPIC, opts);
  log.info(`Service listening to ${CONSTANTS.GRAD_SCHOOL_CACHE_REFRESH_TOPIC}`);
  for await (const msg of sub) {
    const dataStr = sc.decode(msg.data);
    log.info(`Received message, on ${msg.subject} , Subscription Id ::  [${msg.sid}], Reply to ::  [${msg.reply}] ::`);
    await cacheService.loadAllGradSchools();
    await cacheService.loadAllSchoolsToMap();
    broadCastMessageToWebSocketClients(dataStr);
  }
}

const InstituteMessageHandler = {
  subscribe() {
    subscribeToGradSchoolAPIMessageTopic(NATS.getConnection());
  },

};

module.exports = InstituteMessageHandler;
