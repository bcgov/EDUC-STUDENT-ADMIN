'use strict';

const {errorResponse, logApiError} = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const {getData} = require('./utils');
const utils = require('./utils');

async function getExchangeById(req, res) {
  try {
    const token = utils.getBackendToken(req);
    const params = {
      headers: {
        correlationID: req.session.correlationID,
      },
    };
    const url = `${config.get('server:exchange:rootURL')}/${req.params.id}`;
    const result = await getData(token, url, params);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'getExchangeById', 'Error getting a secure exchange by ID.');
    return errorResponse(res);
  }
}

async function getExchanges(req, res) {
  try {
    const token = utils.getBackendToken(req);

    const response = await utils.getData(token, config.get('server:exchange:rootURL')+'/paginated', {params: req.query});
    return res.status(HttpStatus.OK).json(response);
  } catch (e) {
    logApiError(e, 'getExchanges', 'Error getting paginated list of secure exchanges.');
    return errorResponse(res);
  }
}

module.exports = {
  getExchangeById,
  getExchanges,
};
