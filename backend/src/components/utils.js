'use strict';

const axios = require('axios');
const config = require('../config/index');
const jsonwebtoken = require('jsonwebtoken');
const log = require('npmlog');

let discovery = null;

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

      return new Date(year, month - 1, day);
    }
    else {
      log.error('Invalid date received from VMS. Using null instead. Check the data.');
      return null;
    }
  }
};

module.exports = utils;
