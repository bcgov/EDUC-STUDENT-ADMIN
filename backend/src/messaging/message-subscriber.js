'use strict';
const config = require('../config/index');
const log = require('../components/logger');
const {uuid} = require('uuidv4');
const SagaMessageHandler = require('./handlers/saga-message-handler');
let connection={};
const clientID = `student-admin-node-subscriber-${uuid()}`;
const clusterID = config.get('messaging:natsCluster');
const server = config.get('messaging:natsUrl');
const stanOptions = {
  maxReconnectAttempts: -1,
  url: server,
  waitOnFirstConnect: true,
  stanMaxPingOut:2000,
  stanPingInterval:10000
};

const STAN = {
  init(){
    try {
      connection = require('node-nats-streaming').connect(clusterID, clientID, stanOptions);
    }catch (e) {
      log.error(`error ${e}`);
    }
  },
  callbacks(){
    connection.on('connect', function () {
      log.info('STAN connected!');
      SagaMessageHandler.subscribe(connection);
    });

    connection.on('error', function (reason) {
      log.error(`error on STAN ${reason}`);
    });
    connection.on('connection_lost', (error) => {
      log.error('disconnected from STAN', error);
    });
    connection.on('close', (error) => {
      log.error('STAN closed', error);
      process.exit(1);
    });
    connection.on('reconnecting', () => {
      log.info('STAN reconnecting');
    });
    connection.on('reconnect', () => {
      log.info('STAN reconnect');
    });
  }

};

module.exports = STAN;
