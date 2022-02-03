'use strict';

const {errorResponse, logApiError} = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const {getData} = require('./utils');
const utils = require('./utils');

async function getSecureMessageById(req, res) {
  try {
    const token = utils.getBackendToken(req);
    const params = {
      headers: {
        correlationID: req.session.correlationID,
      },
    };
    const url = `${config.get('server:secureMessage:rootURL')}/${req.params.id}`;
    const result = await getData(token, url, params);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'getSecureMessageById', 'Error getting a secure message.');
    return errorResponse(res);
  }
}

module.exports = {
  getSecureMessageById,
  getSecureMessages: utils.getPaginatedListForSCGroups('getSecureMessages', `${config.get('server:secureMessage:rootURL')}/paginated`),
};
