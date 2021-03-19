'use strict';
const config = require('../config/index');
const logger = require('../components/logger');
const stan = require('node-nats-streaming');
const natsClient = require('./message-pub-sub');
const uuid = require('uuid');
const clientID = `student-admin-node-stan-${uuid.v4()}`;
let connectionClosed = false;
const clusterID = config.get('messaging:natsCluster');
const stanSubscriber = require('./handlers/stan-subscriber');
const stanOptions = {
  nc: natsClient.getConnection(),
  stanMaxPingOut: 6,
  stanPingInterval: 10000,
  encoding: 'binary',
};
const stanClient = {
  init(){
    const connection = stan.connect(clusterID, clientID, stanOptions);
    connection.on('connect', () => {
      logger.info('STAN connected!');
      stanSubscriber.subscribe(connection);
    });
    connection.on('error', (reason) => {
      logger.error(`error on STAN ${reason}`);
    });
    connection.on('connection_lost', (error) => {
      logger.error('disconnected from STAN', error);
      connectionClosed = true;
    });
    connection.on('close', (error) => {
      logger.error('STAN closed', error);
      connectionClosed = true;
    });
    connection.on('reconnecting', () => {
      logger.error('STAN reconnecting');
    });
    connection.on('reconnect', () => {
      logger.info('STAN reconnected');
    });
  },
  isConnectionClosed(){
    return connectionClosed;
  }

};
module.exports=stanClient;
