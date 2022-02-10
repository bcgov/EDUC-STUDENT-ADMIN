'use strict';

const {errorResponse, logApiError} = require('../utils');
const HttpStatus = require('http-status-codes');
const config = require('../../config');
const {getData} = require('../utils');
const utils = require('../utils');

async function getExchangeById(req, res) {
  try {
    const token = utils.getBackendToken(req);
    const params = {
      headers: {
        correlationID: req.session.correlationID,
      },
    };
    const url = `${config.get('server:edx:exchangeURL')}/${req.params.id}`;
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

    const response = await utils.getData(token, config.get('server:edx:exchangeURL')+'/paginated', {params: req.query});
    return res.status(HttpStatus.OK).json(response);
  } catch (e) {
    logApiError(e, 'getExchanges', 'Error getting paginated list of secure exchanges.');
    return errorResponse(res);
  }
}

async function createExchange(req, res) {
  try {
    const token = utils.getBackendToken(req);
    const userInfo = utils.getUser(req);
    const message = req.body;
    const payload = {
      contactIdentifier: message.contactIdentifier,
      secureExchangeContactTypeCode: message.secureExchangeContactTypeCode,
      ministryOwnershipTeamID: message.ministryOwnershipTeamID,
      subject: message.subject,
      reviewer: userInfo.idir_username,
      secureExchangeStatusCode: 'INPROGRESS',
      isReadByMinistry: 'Y',
      isReadByExchangeContact: 'N',
      commentsList: [
        {
          staffUserIdentifier: userInfo.idir_guid?.toUpperCase(),
          commentUserName: userInfo.idir_username,
          content: message.content
        }
      ]
    };

    const result = await utils.postData(token, config.get('server:edx:exchangeURL'), payload, null, userInfo.idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'createExchange', 'Error occurred while attempting to create a new exchange.');
    return errorResponse(res);
  }
}

module.exports = {
  getExchangeById,
  getExchanges,
  createExchange,
};
