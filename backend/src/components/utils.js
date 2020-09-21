'use strict';

const HttpStatus = require('http-status-codes');
const axios = require('axios');
const config = require('../config/index');
const jsonwebtoken = require('jsonwebtoken');
const lodash = require('lodash');
const log = require('./logger');
const cache = require('memory-cache');
const { ServiceError, ApiError } = require('./error');
const { LocalDateTime, DateTimeFormatter } = require('@js-joda/core');

let discovery = null;
let memCache = new cache.Cache();

function getBackendToken(req) {
  const thisSession = req.session;
  return thisSession && thisSession['passport']&& thisSession['passport'].user && thisSession['passport'].user.jwt;
}
function unauthorizedError(res) {
  return res.status(HttpStatus.UNAUTHORIZED).json({
    message: 'No access token'
  });
}
function errorResponse(res, msg, code) {
  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    message: msg || 'INTERNAL SERVER ERROR',
    code: code || HttpStatus.INTERNAL_SERVER_ERROR
  });
}
function addTokenToHeader(params, token) {
  if (params) {
    params.headers = {
      Authorization: `Bearer ${token}`,
    };
  } else {
    params = {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    };
  }
  return params;
}

async function getData(token, url, params) {
  try{
    params = addTokenToHeader(params, token);
    log.info('get Data Url', url);
    const response = await axios.get(url, params);
    logResponseData(url, response,'GET');
    return response.data;
  } catch (e) {
    throwError(e, url, 'GET');
  }
}

function logApiError(e, functionName, message) {
  if(message) {
    log.error(message);
  }
  log.error(functionName, ' Error', e.stack);
  if(e.response && e.response.data){
    log.error(JSON.stringify(e.response.data));
  }
}

function minify(obj, keys=['documentData']) {
  return lodash.transform(obj, (result, value, key) =>
    result[key] = keys.includes(key) && lodash.isString(value) ? value.substring(0,1) + ' ...' : value );
}

function logResponseData(url, response, operationType) {
  log.info(`${operationType} Data Status for url ${url} :: is :: `, response.status);
  log.info(`${operationType} Data StatusText for url ${url}  :: is :: `, response.statusText);
  log.verbose(`${operationType} Data Response for url ${url}  :: is :: `, typeof response.data === 'string' ? response.data : minify(response.data));
}

async function postData(token, url, data, params, dontAddUser) {
  try{
    params = addTokenToHeader(params, token);
    log.info('post Data Url', url);
    log.verbose('post Data Req', minify(data));

    if(!dontAddUser) {
      data.createUser = 'STUDENT-ADMIN';
      data.updateUser = 'STUDENT-ADMIN';
    }
    const response = await axios.post(url, data, params);
    logResponseData(url, response,'POST');
    return response.data;
  } catch(e) {
    throwError(e, url, 'POST');
  }
}

function throwError(e, url, operationType) {
  logApiError(e, operationType, `Error during ${operationType} on ${url}`);
  const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
  throw new ApiError(status, {message: 'API Put error'}, e);
}

async function putData(token, url, data) {
  try{
    const putDataConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    };

    log.info('put Data Url', url);
    log.verbose('put Data Req', data);

    data.updateUser='STUDENT-ADMIN';
    const response = await axios.put(url, data, putDataConfig);
    logResponseData(url, response,'PUT');
    return response.data;
  } catch(e) {
    throwError(e, url, 'PUT');
  }
}

//keys = ['identityTypeCodes', 'penStatusCodes', 'genderCodes']
function getCodeTable(token, key, url) {
  try {
    let cacheContent = memCache.get(key);
    if (cacheContent) {
      return cacheContent;
    } else {
      const getDataConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      };
      return axios.get(url, getDataConfig)
        .then(response => {
          memCache.put(key, response.data);
          return response.data;
        })
        .catch(e => {
          logApiError(e, 'getCodeTable', 'Error during get on ' + url);
          const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
          throw new ApiError(status, { message: 'API get error'}, e);
        });
    }
  } catch (e) {
    throw new ServiceError('getCodeTable error', e);
  }
}

function getPaginatedListForSCGroups(apiName, url) {
  return async function getPaginatedListForSCGroupsHandler(req, res) {
    try {
      const token = getBackendToken(req);
      if (!token) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No access token'
        });
      }
  
      const params = {
        params: {
          pageNumber: req.query.pageNumber,
          pageSize: req.query.pageSize,
          sort: req.query.sort,
          searchCriteriaList: JSON.stringify(req.query.searchQueries.map((query) => JSON.parse(query)))
        }
      };
  
      const dataResponse = await getData(token, url, params);
      return res.status(200).json(dataResponse);
  
    } catch (e) {
      logApiError(e, 'getPaginatedListForSCGroups', `Error occurred while attempting to ${apiName}.`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'INTERNAL SERVER ERROR'
      });
    }
  };
}

const utils = {
  // Returns OIDC Discovery values
  async getOidcDiscovery() {
    if (!discovery) {
      try {
        const response = await axios.get(config.get('oidc:discovery'));
        discovery = response.data;
      } catch (error) {
        log.error('getOidcDiscovery', `OIDC Discovery failed - ${error.message}`);
      }
    }
    return discovery;
  },
  
  getUser(req) {
    const thisSession = req.session;
    if(thisSession && thisSession['passport']&& thisSession['passport'].user && thisSession['passport'].user.jwt) {
      return jsonwebtoken.verify(thisSession['passport'].user.jwt, config.get('oidc:publicKey'));
    }else {
      return false;
    }
  },
  saveSession(req, res, penRequest) {
    req['session'].penRequest = Object.assign({},penRequest);
    //req['session'].save();
  },
  formatCommentTimestamp(time) {
    const timestamp = LocalDateTime.parse(time);
    const formattedTime = timestamp.format(DateTimeFormatter.ofPattern('yyyy-MM-dd h:m'));
    let hour = timestamp.hour();
    let minute =  timestamp.minute();
    if(timestamp.minute() < 10){
      minute = '0' + timestamp.minute();
    }
    let amPm = 'am';
    //let hours = d.hour;
    if(hour > 12){
      amPm = 'pm';
      hour = hour - 12;
      //changes from 24 hour to 12 hour
    }
    //split the hour/minute object, make fixes, then add it back to the dataTime object
    let fixTime = (formattedTime).split(' ');
    fixTime[1] = String(hour) + ':' +  minute;
    fixTime = fixTime.join(' ');
    return fixTime + amPm;
  },
  formatDate(date) {
    if(date && (date.length === 8)) {
      const year = date.substring(0, 4);
      const month = date.substring(4, 6);
      const day = date.substring(6, 8);

      return `${year}-${month}-${day}`;
    }
    else {
      log.error('Invalid date received from VMS. Using null instead. Check the data.');
      return null;
    }
  },
  stripAuditColumns(data) {
    delete data.createUser;
    delete data.updateUser;
    delete data.createDate;
    delete data.updateDate;
    return data;
  },
  //keys = ['identityTypeCodes', 'penStatusCodes', 'studentRequestStatusCodes']
  getCodes(urlKey, cacheKey) {
    return async function getCodesHandler(req, res) {
      try {
        const token = getBackendToken(req);
        if (!token) {
          return unauthorizedError(res);
        }
        const url = config.get(urlKey);
        const codes = await getCodeTable(token, cacheKey, url);
      
        return res.status(HttpStatus.OK).json(codes);
      
      } catch (e) {
        logApiError(e, 'getCodes', `Error occurred while attempting to GET ${cacheKey}.`);
        return errorResponse(res);
      }
    };
  },
  cacheMiddleware() {
    return (req, res, next) => {
      let key =  '__express__' + req.originalUrl || req.url;
      let cacheContent = memCache.get(key);
      if(cacheContent){
        res.send( cacheContent );
      }else{
        res.sendResponse = res.send;
        res.send = (body) => {
          if(res.statusCode < 300  && res.statusCode >= 200) {
            memCache.put(key, body);
          }
          res.sendResponse(body);
        };
        next();
      }
    };
  },
  getCodeLabel(codes, codeKey, codeValue) {
    let label = null;
    codes.some(function (item) {
      if (item[codeKey] === codeValue) {
        label = item.label;
        return true;
      }
    });
    return label;
  },
  getCodeFromLabel(codes, codeKey, label) {
    let code = null;
    codes.some(function (item) {
      if (item['label'] === label) {
        code = item[codeKey];
        return true;
      }
    });
    return code;
  },
  verifyRequestInSession(requestType) {
    const requestIDName = `${requestType}ID`;
    return function verifyRequestInSessionHandler(req, res, next) {
      if(req && req.body && req['session'] && req['session'].penRequest && req.body[requestIDName] === req['session'].penRequest[requestIDName]) {
        return next();
      }
      log.error(`${requestType} Id in request is different than the one in session.  This should NEVER happen!`);
      return res.status(500).json({
        message: 'INTERNAL SERVER ERROR'
      });
    };
  },
  extendSession() {
    return function (req, res, next) {
      if (req && req.session) {
        log.debug('req.session.cookie.maxAge before is ::', req.session.cookie.maxAge);
        req['session'].touch();
        req['session'].tempSessionExtensionIdentifier = Math.random(); // DO NOT USE this key anywhere else in session.
        log.debug('req.session.cookie.maxAge after is ::', req.session.cookie.maxAge);
        return next();
      } else {
        return next(); // let the next handler deal with what to do when no session
      }
    };
  },
  getBackendToken,
  getData,
  logApiError,
  postData,
  putData,
  errorResponse,
  unauthorizedError,
  getCodeTable,
  getPaginatedListForSCGroups
};

module.exports = utils;
