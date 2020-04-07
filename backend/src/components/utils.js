'use strict';

const HttpStatus = require('http-status-codes');
const axios = require('axios');
const config = require('../config/index');
const jsonwebtoken = require('jsonwebtoken');
const lodash = require('lodash');
const log = require('npmlog');
const cache = require('memory-cache');
const { ServiceError, ApiError } = require('./error');
const { LocalDateTime, DateTimeFormatter } = require('@js-joda/core');

let discovery = null;
let memCache = new cache.Cache();

function getBackendToken(req) {
  const thisSession = req.session;
  return thisSession && thisSession['passport']&& thisSession['passport'].user && thisSession['passport'].user.jwt;
}

async function getData(token, url, params) {
  try{
    if(params) {
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
    log.info('get Data Url', url);
    const response = await axios.get(url, params);
    log.info('get Data Status', response.status);
    log.info('get Data StatusText', response.statusText);
    log.verbose('get Data Res', minify(response.data));

    return response.data;
  } catch (e) {
    logApiError(e, 'getData', 'Error during GET on ' + url);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, { message: 'API Get error'}, e);
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

async function postData(token, url, data) {
  try{
    const postDataConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    };

    log.info('post Data Url', url);
    log.verbose('post Data Req', minify(data));

    const response = await axios.post(url, data, postDataConfig);

    log.info('post Data Status', response.status);
    log.info('post Data StatusText', response.statusText);

    log.verbose('post Data Res', response.data);

    return response.data;
  } catch(e) {
    logApiError(e, 'postData', 'Error during POST on ' + url);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, { message: 'API Post error'}, e);
  }
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

    const response = await axios.put(url, data, putDataConfig);

    log.info('put Data Status', response.status);
    log.info('put Data StatusText', response.statusText);

    log.verbose('put Data Res', response.data);

    return response.data;
  } catch(e) {
    logApiError(e, 'putData', 'Error during PUT on ' + url);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, { message: 'API Put error'}, e);
  }
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
  prettyStringify: (obj, indent = 2) => JSON.stringify(obj, null, indent),

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
  //keys = ['identityTypeCodes', 'penStatusCodes', 'genderCodes']
  getCodeTable(token, key, url) {
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
  getBackendToken,
  getData,
  logApiError,
  postData,
  putData
};

module.exports = utils;
