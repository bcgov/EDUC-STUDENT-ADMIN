'use strict';
const { logApiError } = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const { getBackendToken, postData } = require('./utils');

async function getPenMatch(req, res) {
  try {
    const token = getBackendToken(req);
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }
    if(req.body.dob) {
      req.body.dob = req.body.dob.replace(/\//g, '');
    }
    const dataResponse = await postData(token, config.get('server:penMatch:rootURL'), req.body, null);
    return res.status(200).json(dataResponse);

  } catch (e) {
    logApiError(e, 'getPenMatch', 'Error occurred while attempting to get pen matches.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}

module.exports = {
  getPenMatch
};
