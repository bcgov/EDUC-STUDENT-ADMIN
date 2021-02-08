'use strict';


class HealthCheckController {
  constructor(redis, nats, express) {
    this._redis = redis;
    this._nats = nats;
    this._router = express.Router();
    this._router.get('/api/health', (req, res) => this.healthCheck(req, res));
  }

  get router() {
    return this._router;
  }

  async healthCheck(req, res) {
    if (this._redis.isConnectionClosed() || this._nats.isConnectionClosed()) {
      res.sendStatus(503);
    } else {
      res.sendStatus(200);
    }
  }
}

const REDIS = require('../util/redis/redis-client');
const NATS = require('../messaging/message-pub-sub');
const EXPRESS = require('express');
module.exports = new HealthCheckController(REDIS, NATS, EXPRESS);
