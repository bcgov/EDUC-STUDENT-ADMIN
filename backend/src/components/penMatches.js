'use strict';
const {logApiError,logInfo} = require('./utils');
const HttpStatus = require('http-status-codes');
const NATS = require('../messaging/message-pub-sub');
const {v4: guid} = require('uuid');

async function getPenMatch(req, res) {
  try {
    if (req.body.dob) {
      req.body.dob = req.body.dob.replace(/\//g, '');
    }
    req.body.usualGivenName = req.body.usualGiven; // the match api expects usualGivenName
    delete req.body.usualGiven;
    const event = {
      sagaId: guid(), // this should be a guid, otherwise it would break
      eventType: 'PROCESS_PEN_MATCH',
      eventPayload: JSON.stringify(req.body)
    };
    logInfo('calling pen match via NATS', event);
    // since router times out at 30 seconds on vue side, lets timeout at 29 seconds here.
    const result = await NATS.requestMessage('PEN_MATCH_API_TOPIC', JSON.stringify(event),29000);
    const parsedEvent = JSON.parse(result);
    logInfo('got result from NATS', parsedEvent);
    return res.status(200).json(JSON.parse(parsedEvent.eventPayload));
  } catch (e) {
    logApiError(e, 'getPenMatch', 'Error occurred while attempting to get pen matches.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}
module.exports = {
  getPenMatch
};
