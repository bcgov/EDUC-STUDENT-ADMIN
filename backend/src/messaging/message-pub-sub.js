'use strict';
const config = require('../config/index');
const log = require('../components/logger');
let connection;
let connectionClosed = true;
const server = config.get('messaging:natsUrl');
const nats = require('nats');
const natsOptions = {
  url: server,
  servers: [server],
  maxReconnectAttempts: 24,
  name: 'STUDENT-ADMIN-NODE',
  reconnectTimeWait: 5000, // wait 5 seconds before retrying...
  waitOnFirstConnect: true,
  pingInterval: 2000,
};

const NATS = {
  async init() {
    try {
      connection = await nats.connect(natsOptions);
      connectionClosed = false;
      log.info('NATS connected!', connection.getServer());
      connection.closed().then((err) => {
        if (err) {
          log.error(`NATS closed with an error: ${err.message}`);
        } else {
          log.error('NATS closed :');
        }
        connectionClosed = true;
      });
    } catch (e) {
      log.error(`error ${e}`);
    }
  },
  async close() {
    if (connection) {
      await connection.close();
    }
  },
  isConnectionClosed() {
    return connectionClosed;
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
    const opts = {
      timeout
    };
    return new Promise((resolve, reject) => {
      connection.request(topic, nats.StringCodec().encode(payload), opts).then((msg) => {
        return resolve(nats.StringCodec().decode(msg.data));
      }).catch((e) => {
        log.error(`Request to NATS failed for topic ${topic} and payload ${payload}`);
        return reject(e?.message);
      });
    });
  },

  /**
   * This is asynchronous publish of message to a given topic.
   * @param topic the topic to which request will be sent.
   * @param payload the payload to sent to the topic.
   * @returns {Promise<void>}
   */
  publishMessage(topic, payload) {
    return new Promise((resolve) => {
      connection.publish(topic, payload, () => {
        return resolve();
      });
    });
  },
  getConnection() {
    return connection;
  }
};

module.exports = NATS;
