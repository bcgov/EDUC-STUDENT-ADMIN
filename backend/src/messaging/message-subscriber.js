'use strict';
const config = require('../config/index');
const log = require('../components/logger');
const SagaMessageHandler = require('./handlers/saga-message-handler');
let connection={};
const server = config.get('messaging:natsUrl');
const nats = require('nats');
const natsOptions = {
  url: server,
  servers: [server],
  maxReconnectAttempts: -1, //forever retry
  waitOnFirstConnect: true,
};

const NATS = {
  init(){
    try {
      connection = nats.connect(server, natsOptions);
    }catch (e) {
      log.error(`error ${e}`);
    }
  },
  callbacks(){
    connection.on('connect', function () {
      log.info('NATS connected!', connection?.currentServer?.url?.host);
      SagaMessageHandler.subscribe(connection);
    });

    connection.on('error', function (reason) {
      log.error(`error on NATS ${reason}`);
    });
    connection.on('connection_lost', (error) => {
      log.error('disconnected from NATS', error);
    });
    connection.on('close', (error) => {
      log.error('NATS closed', error);
      process.exit(1);
    });
    connection.on('reconnecting', () => {
      log.error('NATS reconnecting');
    });
    connection.on('reconnect', () => {
      log.info('NATS reconnected');
    });
  },
  close(){
    if(connection){
      connection.close();
    }
  }

};

module.exports = NATS;
