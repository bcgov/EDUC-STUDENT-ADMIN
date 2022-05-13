'use strict';

const {errorResponse, logApiError} = require('../utils');
const HttpStatus = require('http-status-codes');
const config = require('../../config');
const {getData, getCodeTable} = require('../utils');
const utils = require('../utils');
const {FILTER_OPERATION, VALUE_TYPE, CACHE_KEYS} = require('../../util/constants');
const {LocalDateTime, DateTimeFormatter} = require('@js-joda/core');
const cacheService = require('../cache-service');

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

async function claimAllExchanges(req, res) {
  try {
    const token = utils.getBackendToken(req);
    const userInfo = utils.getUser(req);

    const params = new URLSearchParams({
      reviewer: userInfo.idir_username,
      secureExchangeIDs: req.body.secureExchangeIDs
    }).toString();

    await utils.postData(token, config.get('server:edx:claimExchangesURL') + '?' + params, null , null , null);
    return res.status(HttpStatus.OK).json({});
  } catch (e) {
    logApiError(e, 'claimAllExchanges', 'Error occurred while attempting to claim a exchanges.');
    return errorResponse(res);
  }
}

async function getExchanges(req, res) {
  const token = utils.getBackendToken(req);
  if (!token && req.session.userMinCodes) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }

  return Promise.all([
    getCodeTable(token, CACHE_KEYS.EDX_SECURE_EXCHANGE_STATUS, config.get('server:edx:exchangeStatusesURL')),
    getCodeTable(token, CACHE_KEYS.EDX_MINISTRY_TEAMS, config.get('server:edx:ministryTeamURL')),
    getExchangesPaginated(req, res)
  ])
    .then(async ([statusCodeResponse, ministryTeamCodeResponse, dataResponse]) => {
      if (statusCodeResponse && ministryTeamCodeResponse && dataResponse?.content) {
        dataResponse['content'].forEach((element) => {
          if (element['secureExchangeStatusCode']) {
            let tempStatus = statusCodeResponse.find(codeStatus => codeStatus['secureExchangeStatusCode'] === element['secureExchangeStatusCode']);
            if (tempStatus?.label) {
              element['secureExchangeStatusCode'] = tempStatus.label;
            }
          }
          if (element['ministryOwnershipTeamID']) {
            let tempMinTeam = ministryTeamCodeResponse.find(minstryTeam => minstryTeam['ministryOwnershipTeamId'] === element['ministryOwnershipTeamID']);
            if (tempMinTeam?.teamName) {
              element['contactIdentifierName'] = tempMinTeam.teamName;
            }
          }
          if (element['createDate']) {
            element['createDate'] = LocalDateTime.parse(element['createDate']).format(DateTimeFormatter.ofPattern('uuuu/MM/dd'));
          }
        });
      }
      return res.status(200).json(dataResponse);
    }).catch(e => {
      logApiError(e, 'getExchanges', 'Error getting paginated list of secure exchanges.');
      return errorResponse(res);
    });
}

async function getExchangesPaginated(req) {
  let criteria = [];
  if (req.query.searchParams) {
    criteria = buildSearchParams(req.query.searchParams);
  }

  if(req.query.searchParams.contactIdentifier){
    criteria.push(getCriteria('secureExchangeContactTypeCode', getContactIdentifierType(req.query.searchParams.contactIdentifier, res), FILTER_OPERATION.EQUAL, VALUE_TYPE.STRING));
  }

  const params = {
    params: {
      pageNumber: req.query.pageNumber,
      pageSize: req.query.pageSize,
      sort: req.query.sort,
      searchCriteriaList: JSON.stringify(criteria),
    }
  };

  return utils.getData(utils.getBackendToken(req), config.get('server:edx:exchangeURL') + '/paginated', params);
}

function getCriteria(key, value, operation, valueType) {
  return {key, value, operation, valueType};
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
  } else if (key === 'ministryOwnershipTeamID') {
    operation = FILTER_OPERATION.EQUAL;
    valueType = VALUE_TYPE.UUID;
  } else if (key === 'createDate') {
    value.forEach((date, index) => {
      value[index] = date + 'T00:00:00';
    });
    if (value.length === 1) {
      value.push(LocalDateTime.parse(value[0]).plusHours(23).plusMinutes(59).plusSeconds(59));
    }
    value = value.join(',');
    operation = FILTER_OPERATION.BETWEEN;
    valueType = VALUE_TYPE.DATE_TIME;
  }else if (key === 'secureExchangeStatusCode') {
    value = value.join(',');
    operation = FILTER_OPERATION.IN;
  }
  return {key, value, operation, valueType};
};

const getContactIdentifierType = (contactIdentifier, res) => {
  let data = cacheService.getAllSchoolsJSON();
  let isPresent = data.some(school => school.mincode === contactIdentifier);
  if (isPresent) {
    return 'SCHOOL';
  }else{
    logApiError(null, 'getContactIdentifierType', 'Error occurred while attempting to get the identifier type.');
    return errorResponse(res);
  }
};

module.exports = {
  getExchangeById,
  getExchanges,
  createExchange,
  getExchange,
  claimAllExchanges,
};
