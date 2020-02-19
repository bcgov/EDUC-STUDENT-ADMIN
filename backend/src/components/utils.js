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
  }
};

module.exports = utils;
