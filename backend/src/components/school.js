'use strict';
const {logApiError, errorResponse} = require('./utils');
const config = require('../config/index');
const HttpStatus = require('http-status-codes');
const utils = require('./utils');

async function getSchoolByMincode(req, res) {
  const token = utils.getBackendToken(req);
  const params = {
    params: {
      mincode: req.query.mincode
    }
  };
  try{
    return res.status(200).json(await utils.getData(token, `${config.get('server:schoolAPIURL')}/schools`, params));
  }catch (e) {
    if (e.status === HttpStatus.NOT_FOUND) {
      return res.status(200).json();
    }
    logApiError(e, 'getSchoolByMincode', 'Error occurred while attempting to GET school entity.');
    return errorResponse(res);
  }
}

module.exports = {
  getSchoolByMincode,
};
