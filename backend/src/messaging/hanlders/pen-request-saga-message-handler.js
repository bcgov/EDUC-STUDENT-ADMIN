'use strict';
const log = require('npmlog');

const penRequestReturnSagaTopic = 'PEN_REQUEST_RETURN_SAGA_TOPIC';
const penRequestUnlinkSagaTopic = 'PEN_REQUEST_UNLINK_SAGA_TOPIC';
const redisUtil = require('../../util/redis/redis-utils');
const webSocket = require('../../socket/web-socket');


const PenRequestSagaMessageHandler = {
  penRequestReturnSagaSubscription(stan, opts) {
    const penReqReturnSagaSubscription = stan.subscribe(penRequestReturnSagaTopic, 'student-admin-pen-request-event', opts);
    penReqReturnSagaSubscription.on('error', (err) => {
      log.error(`subscription for ${penRequestReturnSagaTopic} raised an error: ${err}`);
    });
    penReqReturnSagaSubscription.on('message', async (msg) => {
      await this.handlePenRequestSagaMessage(msg);
    });
  },
  penRequestUnlinkSagaSubscription(stan, opts) {
    const penReqReturnSagaSubscription = stan.subscribe(penRequestUnlinkSagaTopic, 'student-admin-pen-request-event', opts);
    penReqReturnSagaSubscription.on('error', (err) => {
      log.error(`subscription for ${penRequestReturnSagaTopic} raised an error: ${err}`);
    });
    penReqReturnSagaSubscription.on('message', async (msg) => {
      await this.handlePenRequestSagaMessage(msg);
    });
  },
  /**
   * This is where all the subscription will be done related pen requests
   * @param stan
   */
  subscribe(stan) {
    const opts = stan.subscriptionOptions();
    opts.setDeliverAllAvailable();
    opts.setDurableName('student-admin-node-consumer');
    this.penRequestReturnSagaSubscription(stan, opts);
    this.penRequestUnlinkSagaSubscription(stan, opts);
  },
  async handlePenRequestSagaMessage(msg) {
    const event = JSON.parse(msg.getData()); // it is always a JSON string of Event object.
    log.silly(`received message for SAGA ID :: ${event.sagaId} :: event ${JSON.stringify(event)}`);
    event.penRequestID = await redisUtil.createOrUpdatePenRequestSagaRecordInRedis(event);
    log.silly(`updated record in Redis for SAGA ID :: ${event.sagaId} :: event ${JSON.stringify(event)}`);
    const connectedClients = webSocket.getWebSocketClients();

    if (connectedClients && connectedClients.length > 0) {
      for (const connectedClient of connectedClients) {
        try {
          connectedClient.send(JSON.stringify(event));
        } catch (e) {
          log.error(`Error while sending message to connected client ${connectedClient} :: ${e}`);
        }
      }
    }
  },
};

module.exports = PenRequestSagaMessageHandler;
