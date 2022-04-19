'use strict';

const {errorResponse, logApiError} = require('../utils');
const HttpStatus = require('http-status-codes');
const config = require('../../config');
const {getData} = require('../utils');
const utils = require('../utils');
const {FILTER_OPERATION, VALUE_TYPE} = require('../../util/constants');
const {LocalDateTime} = require('@js-joda/core');

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

  const params = {
    params: {
      pageNumber: req.query.pageNumber,
      pageSize: req.query.pageSize,
      sort: req.query.sort,
      searchCriteriaList: JSON.stringify(buildSearchParams(req.query.searchParams)),
    }
  };

  try {
    const token = utils.getBackendToken(req);

    const response = await utils.getData(token, config.get('server:edx:exchangeURL')+'/paginated', params);
    return res.status(HttpStatus.OK).json(response);
  } catch (e) {
    logApiError(e, 'getExchanges', 'Error getting paginated list of secure exchanges.');
    return errorResponse(res);
  }
}

async function getExchange(req, res) {

  try {
    const token = utils.getBackendToken(req);
    const response = await utils.getData(token, config.get('server:edx:exchangeURL')+`/${req.params.secureExchangeID}`);
    return res.status(HttpStatus.OK).json(response);
  } catch (e) {
    logApiError(e, 'getExchange', 'Error getting a secure exchange message.');
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
      secureExchangeStatusCode: 'INPROG',
      isReadByMinistry: 'Y',
      isReadByExchangeContact: 'N',
      commentsList: [
        {
          staffUserIdentifier: userInfo.idir_guid?.toUpperCase(),
          commentUserName: userInfo.idir_username,
          content: message.content,
          createUser: userInfo.idir_username,
          updateUser: userInfo.idir_username
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

/**
 * Returns an array of search criteria objects to query EDX API
 *
 * @param searchParams object with keys of the columns we are searching for
 */
const buildSearchParams = (searchParams) => {
  return Object.entries(JSON.parse(searchParams))
    .map(([key, value]) => createSearchParamObject(key, value));
};

/**
 * Returns an object that has the following properties key, value, operation, valueType
 * Helper function when building search params for querying EDX API
 *
 * @param key of what we are searching in
 * @param value of what we are searching for
 */
const createSearchParamObject = (key, value) => {
  let operation = FILTER_OPERATION.CONTAINS_IGNORE_CASE;
  let valueType = VALUE_TYPE.STRING;

  if (key === 'sequenceNumber') {
    operation = FILTER_OPERATION.EQUAL;
  }

  if (key === 'createDate') {
    value.forEach((date, index) => {
      value[index] = date + 'T00:00:01';
    });
    if (value.length === 1) {
      value.push(LocalDateTime.now().toString());
    }
    value = value.join(',');
    operation = FILTER_OPERATION.BETWEEN;
    valueType = VALUE_TYPE.DATE_TIME;
  }
  return {key, value, operation, valueType};
};

module.exports = {
  getExchangeById,
  getExchanges,
  createExchange,
  getExchange,
};
