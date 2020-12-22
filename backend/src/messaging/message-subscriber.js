'use strict';
const config = require('../config/index');
const log = require('../components/logger');
const SagaMessageHandler = require('./handlers/saga-message-handler');
let connection;
const server = config.get('messaging:natsUrl');
const nats = require('nats');
const natsOptions = {
  url: server,
  servers: [server],
  maxReconnectAttempts: -1, //forever retry
  waitOnFirstConnect: true,
  pingInterval: 5000
};

const NATS = {
  init() {
    try {
      connection = nats.connect(server, natsOptions);
    } catch (e) {
      log.error(`error ${e}`);
    }
  },
  callbacks() {
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
  close() {
    if (connection) {
      connection.close();
    }
  },
  /**
   * This is the synchronous request/reply pattern of nats. <b> It expects only one response from the responder.
   *  Below is from NATS docs
   *   <pre>
   *    Publish a message with an implicit inbox listener as the reply. Message is optional.
   *    This should be treated as a subscription. Request one, will terminate the subscription
   *    after the first response is received or the timeout is reached.
   *    The callback can be called with either a message payload or a NatsError to indicate
   *    a timeout has been reached.
   *    The subscription id is returned.
   *   </pre>
   * @param topic the topic to which request will be sent.
   * @param payload the payload to sent to the topic on which a response is requested.
   * @param timeout the timeout in millis, default value is 120000 -> 2 minutes
   * @returns a Promise.
   */
  requestMessage(topic, payload, timeout = 120000) {
    return new Promise((resolve, reject) => {
      connection.requestOne(topic, payload, timeout, (msg) => {
        if (msg instanceof nats.NatsError && msg?.code === nats.REQ_TIMEOUT) {
          log.error(`Request to NATS timed out after 120000 ms for topic ${topic} and payload ${payload}`, msg);
          return reject('request timed out');
        } else {
          return resolve(msg);
        }
      });
    });
  }

};

module.exports = NATS;
