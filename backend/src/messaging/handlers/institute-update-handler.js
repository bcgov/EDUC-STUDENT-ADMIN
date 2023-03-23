'use strict';
const log = require('../../components/logger');
const CONSTANTS = require('../../util/constants');
const NATS = require('../message-pub-sub');
const cacheService = require('../../components/cache-service');

async function subscribeToInstituteAPIMessageTopic(nats) {
  const opts = {};
  const sub = nats.subscribe(CONSTANTS.INSTITUTE_CACHE_REFRESH_TOPIC, opts);
  log.info(`Service listening to ${CONSTANTS.INSTITUTE_CACHE_REFRESH_TOPIC}`);
  for await (const msg of sub) {
    log.info(`Received message, on ${msg.subject} , Subscription Id ::  [${msg.sid}], Reply to ::  [${msg.reply}] ::`);
    await cacheService.loadAllSchoolsToMap();
    await cacheService.loadAllDistrictsToMap();
    await cacheService.loadAllAuthoritiesToMap();
  }
}

const InstituteMessageHandler = {
  subscribe() {
    subscribeToInstituteAPIMessageTopic(NATS.getConnection());
  },

};

module.exports = InstituteMessageHandler;
