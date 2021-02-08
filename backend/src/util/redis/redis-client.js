'use strict';
let redisClient;
let connectionClosed = false;
const Redis = {

  /**
   * This method is called during application start and redis client is obtained.
   * The redis client can be reused rather than creating multiple clients.
   */
  init() {
    const IOREDIS = require('ioredis');
    const config = require('../../config');
    const log = require('../../components/logger');
    if('local' === config.get('environment')){
      redisClient = new IOREDIS({
        host: config.get('redis:host'),
        port: config.get('redis:port')
      });
    } else {
      redisClient = new IOREDIS.Cluster([{
        host: config.get('redis:host'),
        port: config.get('redis:port')
      }]);
    }
    redisClient.on('error', (error) => {
      log.error(`error occurred in redis client. ${error}`);
    });
    redisClient.on('end', (error) => {
      log.error(`redis client end. ${error}`);
      connectionClosed = true;
    });
    redisClient.on('ready', () => {
      log.info('Redis Ready.');
    });
    redisClient.on('connect', () => {
      log.info('connected to redis.');
    });
  },
  isConnectionClosed() {
    return connectionClosed;
  },
  getRedisClient() {
    return redisClient;
  }
};
module.exports = Redis;
