'use strict';
const log = require('npmlog');

const penRequestReturnSagaEvent = 'PEN_REQUEST_RETURN_SAGA_TOPIC';
const redisUtil = require('../../util/redis/redis-utils');
const webSocket = require('../../socket/web-socket');
const PenRequestSagaMessageHandler = {

  /**
   * This is where all the subscription will be done related pen requests
   * @param stan
   */
  subscribe(stan) {
    const opts = stan.subscriptionOptions();
    opts.setDeliverAllAvailable();
    opts.setDurableName('student-admin-node-consumer');
    const penReqReturnSagaSubscription = stan.subscribe(penRequestReturnSagaEvent, 'student-admin-pen-request-event', opts);
    penReqReturnSagaSubscription.on('error', (err) => {
      log.info(`subscription for ${penRequestReturnSagaEvent} raised an error: ${err}`);
    });
    penReqReturnSagaSubscription.on('message', async (msg) => {
      await this.handlePenRequestReturnSagaMessage(msg);
    });
  },
  async handlePenRequestReturnSagaMessage(msg) {
    const event = JSON.parse(msg.getData());
    log.info(`received message for SAGA ID :: ${event.sagaId} :: event ${event}`);
    await redisUtil.createOrUpdatePenRequestSagaRecordInRedis(event);
    const connectedClients = webSocket.getWebSocketClients();
    if (connectedClients && connectedClients.length > 0) {
      for (const connectedClient of connectedClients) {
        try {
          connectedClient.send(msg.getData());
        } catch (e) {
          log.error(`Error while sending message to connected client ${connectedClient} :: ${e}`);
        }
      }
    }
  }
};

module.exports = PenRequestSagaMessageHandler;
