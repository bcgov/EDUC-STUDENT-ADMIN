'use strict';
const { logApiError, errorResponse, getBackendToken, getData } = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');

async function getTraxDataByPen(req, res) {
  try {
    const token = getBackendToken(req);
    const pen = req.query.pen;
    const result = await getData(token, `${config.get('server:penTraxURL')}/students`, {params: {studNo: pen}});
    return res.status(200).json(result);
  } catch (e) {
    if (e.status === HttpStatus.NOT_FOUND) {
      return res.status(200).json();
    }
    logApiError(e, 'getTraxDataByPen', 'Error occurred while attempting to GET TRAX data.');
    return errorResponse(res);
  }
}

module.exports = {
  getTraxDataByPen
};
