'use strict';

const axios = require('axios');
const config = require('../config/index');
const jsonwebtoken = require('jsonwebtoken');
const log = require('npmlog');
const cache = require('memory-cache');
const { ServiceError } = require('./error');

let discovery = null;
let memCache = new cache.Cache();

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

  getBackendToken(req) {
    const thisSession = req.session;
    return thisSession['passport'].user.jwt;
  },
  getUser(req) {
    const thisSession = req.session;
    return jsonwebtoken.verify(thisSession['passport'].user.jwt, config.get('oidc:publicKey'));
  },
  saveSession(req, res, penRequest) {
    req['session'].penRequest = Object.assign({},penRequest);
    //req['session'].save();
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
  //keys = ['identityTypeCodes', 'penStatusCodes']
  getCodeTable(key, url) {
    try {
      let cacheContent = memCache.get(key);
      if (cacheContent) {
        return cacheContent;
      } else {
        return axios.get(url)
          .then(response => {
            memCache.put(key, response.data);
            return response.data;
          })
          .catch(error => {
            log.error('Error attempting to get status codes from digitalId-api.');
            log.error(error);
            log.error(JSON.stringify(error.response.data));
            return null;
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
  }
};

module.exports = utils;
