const HttpStatus = require('http-status-codes');
const axios = require('axios').default;
const config = require('../config/index');
const jsonwebtoken = require('jsonwebtoken');
const lodash = require('lodash');
const log = require('./logger');
const cache = require('memory-cache');
const {ServiceError, ApiError} = require('./error');
const {LocalDateTime, DateTimeFormatter} = require('@js-joda/core');
const {Locale} = require('@js-joda/locale_en');
const {FILTER_OPERATION, VALUE_TYPE} = require('../util/constants');
const fsStringify = require('fast-safe-stringify').default;

/**
 * @typedef {import('express').Request} ExpressRequest
 * @typedef {import('express').Response} ExpressResponse
 * @typedef {import('express').Handler} ExpressHandler
 * @typedef {import('qs').ParsedQs} ParsedQs
 *
 * @typedef {import('axios').Method} Method
 * @typedef {import('axios').AxiosRequestConfig} RequestConfig
 * @typedef {import('axios').AxiosResponse} AxiosResponse
 * @typedef {import('axios').AxiosError} AxiosError
 *
 * @typedef {import('../../@types/api').RequestConfigWithToken} RequestConfigWithToken
 * @typedef {import('../../@types/api').StatusCode} StatusCode
 * @typedef {import('../../@types/api').EdxDocument} EdxDocument
 * @typedef {import('../../@types/api').CacheKey} CacheKey
 * @typedef {import('../../@types/api').CacheMiddleware} CacheMiddleware
 */

axios.interceptors.request.use((axiosRequestConfig) => {
  axiosRequestConfig.headers = {
    ...axiosRequestConfig.headers,
    ['X-Client-Name']: 'PEN-STUDENT-ADMIN'
  };
  return axiosRequestConfig;
});

let discovery = null;
let memCache = new cache.Cache();

/**
 * @param {ExpressRequest} req
 * @return {string|undefined} jwt token
 */
function getBackendToken(req) {
  const thisSession = req.session;
  return thisSession && thisSession['passport'] && thisSession['passport'].user && thisSession['passport'].user.jwt;
}

/**
 * @param {ExpressResponse} res
 * @returns {ExpressResponse}
 */
function unauthorizedError(res) {
  return res.status(HttpStatus.UNAUTHORIZED).json({
    message: 'No access token'
  });
}

/**
 * @param {ExpressResponse} res
 * @param {string} [msg]
 * @param {number} [code]
 * @returns {ExpressResponse} */
function errorResponse(res, msg, code) {
  return res.status(code || HttpStatus.INTERNAL_SERVER_ERROR).json({
    message: msg || 'INTERNAL SERVER ERROR',
    code: code || HttpStatus.INTERNAL_SERVER_ERROR
  });
}

/**
 * @param {string|undefined} token
 * @param {ExpressResponse} res
 * @returns {ExpressResponse|undefined}
 */
function validateAccessToken(token, res) {
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }
}

/**
 * @param {RequestConfig|undefined} params
 * @param {string} token
 * @returns {RequestConfigWithToken} request config with token header
 */
function addTokenToHeader(params, token) {
  const p = params || {};
  return {
    ...p,
    headers: {
      ...p.headers,
      Authorization: `Bearer ${token}`
    }
  };
}

/**
 * @param {string} token
 * @param {string} url
 */
async function deleteData(token, url) {
  try {
    const delConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    };

    logRequestData('DELETE', url);
    const response = await axios.delete(url, delConfig);
    logResponseData(url, response, 'DELETE');
    return response.data;
  } catch (e) {
    log.error('deleteData Error', e.response ? e.response.status : e.message);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, {message: 'API Delete error'}, e);
  }
}

/**
 * @param {EdxDocument} document
 * @returns {boolean}
 */
function isPdf(document){
  return (
    'fileName' in document &&
    typeof document.fileName === 'string' &&
    document.fileName.toLowerCase().endsWith('.pdf')
  );
}

/**
 * @param {string} token
 * @param {string} url
 * @param {object} data
 */
async function deleteDataWithBody(token, url, data) {
  if (!data) {
    throw new ApiError(400, {message: 'Invalid request for delete with body'}, new Error('Empty body'));
  }
  try {
    /** @type {RequestConfigWithToken} */
    const delConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: data
    };

    logRequestData('DELETE', url);
    const response = await axios.delete(url, delConfig);
    logResponseData(url, response, 'DELETE');
    return response.data;
  } catch (e) {
    log.error('deleteDataWithBody Error', e.response ? e.response.status : e.message);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, {message: 'API deleteDataWithBody error'}, e);
  }
}

/**
 * @param {string} token
 * @param {string} url
 * @param {RequestConfig} [params]
 */
async function getData(token, url, params) {
  try {
    const paramsWithToken = addTokenToHeader(params, token);
    logRequestData('GET', url);
    const response = await axios.get(url, paramsWithToken);
    logResponseData(url, response, 'GET');
    return response.data;
  } catch (e) {
    throwError(e, url, 'GET');
  }
}

/**
 * @param {AxiosError} e
 * @param {string} functionName
 * @param {string} message
 */
async function logApiError(e, functionName, message) {
  if (e?.response?.status === 404) {
    log.info('Entity not found', e);
  } else if (e?.response?.data) {
    log.error(fsStringify(e.response.data));
  } else if (message) {
    log.error(message);
    log.error(functionName, ' Error', e.stack);
  } else {
    log.error(functionName, ' Error', e.stack);
  }
}

/**
 * @param {object} obj
 * @param {(keyof obj)[]} [keys] to minify
 * @returns {object} a minified object
 */
function minify(obj, keys = ['documentData']) {
  return lodash.transform(obj, (result, value, key) =>
    result[key] = keys.includes(key) && lodash.isString(value) ? value.substring(0, 1) + ' ...' : value);
}

/**
 * @param {string} url
 * @param {AxiosResponse} response
 * @param {Method} operationType
 */
async function logResponseData(url, response, operationType) {
  log.info(`${operationType} Data Status for url ${url} :: is :: `, response.status);
  log.info(`${operationType} Data StatusText for url ${url}  :: is :: `, response.statusText);
  log.verbose(`${operationType} Data Response for url ${url}  :: is :: `, typeof response.data === 'string' ? response.data : minify(response.data));
}

/**
 * @param {Method} operationType the type of Operation {POST, PUT, GET, DELETE}
 * @param {string} url the url being hit
 * @param {object} [data] the data passed onto the http request.
 * @returns {Promise<void>}
 */
async function logRequestData(operationType, url, data) {
  log.info(`${operationType} Data Url`, url);
  if (data) {
    log.verbose(`${operationType} Data Req`, typeof data === 'string' ? data : minify(data));
  }
}

/**
 * @param {string} token
 * @param {string} url
 * @param {object} data
 * @param {RequestConfig} params
 * @param {string} user
 */
async function postData(token, url, data, params, user) {
  try {
    params = addTokenToHeader(params, token);
    params.maxContentLength = Infinity;
    params.maxBodyLength = Infinity;

    if (user && typeof user === 'string') {
      data.createUser = user;
      data.updateUser = user;
    }

    logRequestData('POST', url, data);
    const response = await axios.post(url, data, params);
    logResponseData(url, response, 'POST');
    return response.data;
  } catch (e) {
    throwError(e, url, 'POST');
  }
}

/**
 * @param {AxiosError} e
 * @param {string} url
 * @param {Method} operationType
 */
function throwError(e, url, operationType) {
  logApiError(e, operationType, `Error during ${operationType} on ${url}`);
  const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
  let data;
  if (e?.response?.data) {
    data = e.response.data;
  } else {
    data = {message: `API  ${operationType} error, on ${url}`};
  }
  throw new ApiError(status, data, e);
}

/**
 * @param {string} token
 * @param {string} url
 * @param {object} data
 * @param {string} user
 */
async function putData(token, url, data, user) {
  try {
    const putDataConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    };
    if(user && typeof user === 'string'){
      data.updateUser = user;
    }
    logRequestData('PUT', url, data);
    const response = await axios.put(url, data, putDataConfig);
    logResponseData(url, response, 'PUT');
    return response.data;
  } catch (e) {
    throwError(e, url, 'PUT');
  }
}

/**
 * @param {string} token
 * @param {CacheKey} key
 * @param {string} url
 * @param {boolean} [useCache]
 * @returns {Promise<StatusCode[]>} an array of status codes.
 */
async function getCodeTable(token, key, url, useCache = true) {
  try {
    let cacheContent = useCache && memCache.get(key);
    if (cacheContent) {
      return cacheContent;
    } else {
      const getDataConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      };
      return await axios.get(url, getDataConfig)
        .then(response => {
          useCache && memCache.put(key, response.data);
          return response.data;
        })
        .catch(e => {
          logApiError(e, 'getCodeTable', 'Error during get on ' + url);
          const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
          throw new ApiError(status, {message: 'API get error'}, e);
        });
    }
  } catch (e) {
    throw new ServiceError('getCodeTable error', e);
  }
}

/**
 * @param {string | String[] | ParsedQs | ParsedQs[]} [arr]
 * @returns {arr is string[]} arr is string array
 */
function queryParamIsStringArray(arr) {
  return Array.isArray(arr) && typeof arr[0] == 'string';
}

/**
 * @param {string} apiName
 * @param {string} url
 * @param {(data: any) => Promise<void>} handleResponse
 * @returns {ExpressHandler}
 */
function getPaginatedListForSCGroups(apiName, url, handleResponse) {
  return async function getPaginatedListForSCGroupsHandler(req, res) {
    try {
      const token = getBackendToken(req);
      if (!token) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No access token'
        });
      }

      let pageSize = req.query.pageSize;
      if(!req.query.pageSizeOverride && typeof pageSize == 'string' && parseInt(pageSize) > 20) {
        pageSize = '20';
      }

      const searchQueries = queryParamIsStringArray(req.query.searchQueries) ? req.query.searchQueries : [];
      const params = {
        params: {
          pageNumber: req.query.pageNumber,
          pageSize,
          sort: req.query.sort,
          searchCriteriaList: JSON.stringify(searchQueries.map((query) => JSON.parse(query)))
        }
      };

      const dataResponse = await getData(token, url, params);
      if(handleResponse && dataResponse.content) {
        await handleResponse(dataResponse.content);
      }
      return res.status(200).json(dataResponse);

    } catch (e) {
      logApiError(e, 'getPaginatedListForSCGroups', `Error occurred while attempting to ${apiName}.`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'INTERNAL SERVER ERROR'
      });
    }
  };
}

/**
 * @param {SagaRecord[]} records
 * @param {string} recordIdName
 * @param {() => Promise<string[]>} getSagaEvents
 */
async function addSagaStatusToRecords(records, recordIdName, getSagaEvents) {
  const eventsStringArrayFromRedis = await getSagaEvents() || [];

  /** @type {SagaRecord[]} */
  const eventsArrayFromRedis = eventsStringArrayFromRedis.map(event => JSON.parse(event));

  records && records.forEach(record => {
    if (record[recordIdName]) {
      const sagaInProgress = eventsArrayFromRedis.filter(event =>
        event[recordIdName] === record[recordIdName]);
      if(sagaInProgress && sagaInProgress.length > 0){
        record.sagaInProgress = true;
        record.sagaName = sagaInProgress[0].sagaName;
      }else {
        record.sagaInProgress = false;
      }
    }
  });
}

/**
 * @param {string} apiName
 * @param {string} urlKey
 * @param {string} extraPath
 * @param {(data: any) => Promise<void>} handleResponse
 * @returns {ExpressHandler}
 */
function forwardGet(apiName, urlKey, extraPath, handleResponse) {
  return async function forwardGetHandler(req, res) {
    const token = getBackendToken(req) || '';
    try {
      const params = {
        params: req.query
      };

      const url = config.get(urlKey);
      const data = await getData(token, extraPath ? `${url}${extraPath}` : url, params);
      if (handleResponse && data) {
        await handleResponse(data);
      }

      return res.status(200).json(data);
    } catch (e) {
      logApiError(e, 'forwardGet', `Error getting ${apiName}.`);
      return errorResponse(res);
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
  /** @param {ExpressRequest} req */
  getUser(req) {
    const thisSession = req.session;
    if (thisSession && thisSession['passport'] && thisSession['passport'].user && thisSession['passport'].user.jwt) {
      try {
        return jsonwebtoken.verify(thisSession['passport'].user.jwt, config.get('oidc:publicKey'));
      } catch (e) {
        log.error('error is from verify', e);
        return false;
      }
    } else {
      return false;
    }
  },
  /**
   * @param {ExpressRequest} req
   * @param {ExpressResponse} _res
   * @param {object} penRequest
   */
  saveSession(req, _res, penRequest) {
    req['session'].penRequest = Object.assign({}, penRequest);
  },
  /** @param {string} time */
  formatCommentTimestamp(time) {
    const timestamp = LocalDateTime.parse(time);
    return timestamp.format(DateTimeFormatter.ofPattern('yyy/MM/dd h:mma').withLocale(Locale.CANADA));
  },
  /** @param {string} date */
  formatDate(date) {
    if (date && (date.length === 8)) {
      const year = date.substring(0, 4);
      const month = date.substring(4, 6);
      const day = date.substring(6, 8);

      return `${year}-${month}-${day}`;
    } else {
      log.error('Invalid date received from VMS. Using null instead. Check the data.');
      return null;
    }
  },
  /** @param {object} data */
  stripAuditColumns(data) {
    delete data.createUser;
    delete data.updateUser;
    delete data.createDate;
    delete data.updateDate;
    return data;
  },
  /**
   * @param {string} urlKey
   * @param {CacheKey} cacheKey
   * @returns {ExpressHandler}
   */
  getActiveCodes(urlKey, cacheKey) {
    return async function getActiveCodesHandler(req, res) {
      try {
        const token = getBackendToken(req);
        if (!token) {
          return unauthorizedError(res);
        }
        const url = config.get(urlKey);
        const codes = await getCodeTable(token, cacheKey, url);

        const curDate = LocalDateTime.now();
        const filtered = codes.filter(d => curDate.isAfter(LocalDateTime.parse(d.effectiveDate)) && curDate.isBefore(LocalDateTime.parse(d.expiryDate)));

        return res.status(HttpStatus.OK).json(filtered);
      } catch (e) {
        logApiError(e, 'getActiveCodes', `Error occurred while attempting to GET ${cacheKey}.`);
        return errorResponse(res);
      }
    };
  },
  /**
   * @param {string} urlKey
   * @param {CacheKey} cacheKey
   * @param {string} extraPath
   * @returns {ExpressHandler}
   */
  getCodes(urlKey, cacheKey, extraPath, useCache = true) {
    return async function getCodesHandler(req, res) {
      try {
        const token = getBackendToken(req);
        if (!token) {
          return unauthorizedError(res);
        }
        const url = config.get(urlKey);
        const codes = await getCodeTable(token, cacheKey, extraPath ? `${url}${extraPath}` : url, useCache);

        return res.status(HttpStatus.OK).json(codes);

      } catch (e) {
        logApiError(e, 'getCodes', `Error occurred while attempting to GET ${cacheKey}.`);
        return errorResponse(res);
      }
    };
  },
  /** @returns {CacheMiddleware} */
  cacheMiddleware() {
    return (req, res, next) => {
      let key = '__express__' + req.originalUrl || req.url;
      let cacheContent = memCache.get(key);
      if (cacheContent) {
        res.send(cacheContent);
      } else {
        res.sendResponse = res.send;
        res.send = (body) => {
          if (res.statusCode < 300 && res.statusCode >= 200) {
            memCache.put(key, body);
          }
          res.sendResponse(body);
        };
        next();
      }
    };
  },
  /**
   * @param {StatusCode[]} codes
   * @param {string} codeKey
   * @param {string|number} codeValue
   */
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
  /**
   * @param {StatusCode[]} codes
   * @param {string} codeKey
   * @param {string} label
   */
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
  /**
   * @param {string} requestType
   * @returns {ExpressHandler}
   */
  verifyRequestInSession(requestType) {
    const requestIDName = `${requestType}ID`;
    return function verifyRequestInSessionHandler(req, res, next) {
      log.debug('request body is', req.body);
      log.debug('req[\'session\'].penRequest is', req['session'].penRequest);
      if (req && req.body && req['session'] && req['session'].penRequest && req.body[requestIDName] === req['session'].penRequest[requestIDName]) {
        return next();
      }
      log.error(`${requestType} Id in request is different than the one in session.  This should NEVER happen!`);
      return res.status(500).json({
        message: 'INTERNAL SERVER ERROR'
      });
    };
  },
  /**
  * This function will modify the session by changing `tempSessionExtensionIdentifier`.
  * Please be CAREFUL when using this with parallel api calls from UI Side, when you want to store some data in session in one of the api calls.
  * more documentation found here https://github.com/expressjs/session#readme, look at the resave section.
  * even though our app uses `resave:false` modifying session in parallel api calls will have race condition, which will lead to undesired outcomes based on api call finish times.
  * @returns {ExpressHandler}
  */
  extendSession() {
    return function (req, _res, next) {
      if (req && req.session) {
        log.debug('req.session.cookie.maxAge before is ::', req.session.cookie.maxAge);
        req['session'].touch();
        // NOSONAR
        req['session'].tempSessionExtensionIdentifier = Math.random(); // DO NOT USE this key anywhere else in session.
        log.debug('req.session.cookie.maxAge after is ::', req.session.cookie.maxAge);
        return next();
      } else {
        return next(); // let the next handler deal with what to do when no session
      }
    };
  },
  /**
   * This function will call student api paginated endpoint and get the list of students based on their ids.
   * @param {string} token the token to call api with.
   * @param {string} studentIDs the comma separated ids of student
   * @returns {Promise<undefined>}
   */
  async getStudentsFromStudentAPIByTheirIds(token, studentIDs) {
    const pageSize = studentIDs.split(',').length; // it is expected to get all the student ids as a comma separated string.
    let searchListCriteria = [];
    searchListCriteria.push({
      key: 'studentID',
      operation: FILTER_OPERATION.IN,
      value: studentIDs,
      valueType: VALUE_TYPE.UUID
    });
    const search = [
      {
        searchCriteriaList: searchListCriteria
      }
    ];
    const params = {
      params: {
        pageSize,
        searchCriteriaList: JSON.stringify(search)
      }
    };

    return utils.getData(token, config.get('server:student:rootURL') + '/paginated', params);
  },
  /**
   * @param {string} message
   * @param {object} data
   */
  async logDebug(message, data) {
    log.debug(message, data ?? '');
  },
  /**
   * @param {string} message
   * @param {object} data
   */
  async logInfo(message, data) {
    log.info(message, data ?? '');
  },
  /**
   * @param {string} message
   * @param {object} data
   */
  async logError(message, data) {
    log.error(message, data ?? '');
  },
  /**
   * @param {string} message
   * @param {object} data
   */
  async logSilly(message, data) {
    log.silly(message, data ?? '');
  },
  /**
   * @param {string} message
   * @param {object} data
   */
  async logVerbose(message, data) {
    log.verbose(message, data ?? '');
  },
  getBackendToken,
  getData,
  logApiError,
  postData,
  putData,
  errorResponse,
  unauthorizedError,
  getCodeTable,
  getPaginatedListForSCGroups,
  deleteData,
  deleteDataWithBody,
  addSagaStatusToRecords,
  validateAccessToken,
  forwardGet,
  isPdf
};

module.exports = utils;
