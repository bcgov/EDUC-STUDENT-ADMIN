'use strict';

const {errorResponse, logApiError} = require('../utils');
const HttpStatus = require('http-status-codes');
const config = require('../../config');
const {getData, getCodeTable, putData} = require('../utils');
const utils = require('../utils');
const {FILTER_OPERATION, VALUE_TYPE, CACHE_KEYS} = require('../../util/constants');
const {LocalDateTime, DateTimeFormatter} = require('@js-joda/core');
const cacheService = require('../cache-service');

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
    logApiError(e, 'claimAllExchanges', 'Error occurred while attempting to claim exchanges.');
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
    getExchangesPaginated(req, res),
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

async function getExchangesPaginated(req, res) {
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
  const token = utils.getBackendToken(req);
  if (!token && req.session.userMinCodes) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }

  return Promise.all([
    getCodeTable(token, CACHE_KEYS.EDX_SECURE_EXCHANGE_STATUS, config.get('server:edx:exchangeStatusesURL')),
    getCodeTable(token, CACHE_KEYS.EDX_MINISTRY_TEAMS, config.get('server:edx:ministryTeamURL')),
    getData(token, config.get('server:edx:exchangeURL')+`/${req.params.secureExchangeID}`)
  ])
    .then(async ([statusCodeResponse, ministryTeamCodeResponse, dataResponse]) => {

      if (statusCodeResponse && ministryTeamCodeResponse && dataResponse) {
        let school = cacheService.getSchoolNameJSONByMincode(dataResponse['contactIdentifier']);

        if (dataResponse['secureExchangeStatusCode']) {
          let tempStatus = statusCodeResponse.find(codeStatus => codeStatus['secureExchangeStatusCode'] === dataResponse['secureExchangeStatusCode']);
          dataResponse['secureExchangeStatusCode'] = tempStatus?.label ? tempStatus.label : dataResponse['secureExchangeStatusCode'];
        }

        dataResponse['ministryOwnershipTeamName'] = 'Unknown Team';
        if (dataResponse['ministryOwnershipTeamID']) {
          let tempMinTeam = ministryTeamCodeResponse.find(ministryTeam => ministryTeam['ministryOwnershipTeamId'] === dataResponse['ministryOwnershipTeamID']);
          dataResponse['ministryOwnershipTeamName'] = tempMinTeam?.teamName ? tempMinTeam.teamName : dataResponse['ministryOwnershipTeamName'];
        }

        //creating activities list for timeline display on the frontend
        dataResponse['activities'] = [];
        dataResponse['commentsList'].forEach((comment) => {
          let activity = {};
          activity['type'] = 'message';
          activity['timestamp'] = comment['commentTimestamp'] ? LocalDateTime.parse(comment['commentTimestamp']) : '';
          activity['actor'] = comment.edxUserID ? school.schoolName : dataResponse['ministryOwnershipTeamName'];
          activity['title'] =  comment.edxUserID ? school.schoolName : dataResponse['ministryOwnershipTeamName'];
          activity['displayDate'] = comment['commentTimestamp'] ? LocalDateTime.parse(comment['commentTimestamp']).format(DateTimeFormatter.ofPattern('uuuu/MM/dd')) : 'Unknown Date';
          activity['content'] = comment['content'];
          activity['secureExchangeID'] = comment['secureExchangeID'];
          dataResponse['activities'].push(activity);
        });
        dataResponse['activities'].sort((activity1, activity2) => { return activity2.timestamp.compareTo(activity1.timestamp); });
      }
      return res.status(HttpStatus.OK).json(dataResponse);
    }).catch(e => {
      logApiError(e, 'getExchange', 'Error getting secure exchange by ID.');
      return errorResponse(res);
    });
}

async function createExchange(req, res) {
  try {
    const token = utils.getBackendToken(req);
    const userInfo = utils.getUser(req);
    const message = req.body;
    console.log('User Info: ', JSON.stringify(userInfo));
    const payload = {
      contactIdentifier: message.contactIdentifier,
      secureExchangeContactTypeCode: message.secureExchangeContactTypeCode,
      ministryOwnershipTeamID: message.ministryOwnershipTeamID,
      subject: message.subject,
      reviewer: userInfo.idir_username,
      secureExchangeStatusCode: 'INPROG',
      isReadByMinistry: true,
      isReadByExchangeContact: false,
      commentsList: [
        {
          staffUserIdentifier: userInfo.idir_username,
          commentUserName: userInfo.name,
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

async function markAs(req, res) {
  const token = utils.getBackendToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }
  try {
    const currentExchange = await getData(token, config.get('server:edx:exchangeURL') + `/${req.params.secureExchangeID}`);
    currentExchange.isReadByMinistry = !currentExchange.isReadByMinistry;
    currentExchange.createDate = null;
    currentExchange.updateDate = null;

    await putData(token, `${config.get('server:edx:exchangeURL')}`, currentExchange);

    return getExchange(req, res);
  }
  catch (e) {
    logApiError(e, 'markAs', 'Error updating the read status of an exchange');
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
  getExchanges,
  createExchange,
  getExchange,
  claimAllExchanges,
  markAs
};
