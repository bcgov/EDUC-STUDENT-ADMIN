'use strict';
const {getBackendToken, getData, errorResponse} = require('./utils');
const config = require('../config/index');
const HttpStatus = require('http-status-codes');


const getGMPStatsByStatsType = async (req, res) => {
  const statsType = req.query.statsType;
  if(!statsType){
    return res.status(HttpStatus.BAD_REQUEST).json({message: 'Missing required parameter statsType'});
  }
  try {
    const dataResponse = await getData(getBackendToken(req), config.get('server:penRequest:rootURL') + '/stats?statsType=' + statsType);
    return res.status(HttpStatus.OK).json(dataResponse);
  } catch (e) {
    return errorResponse(res, e.data, e.status);
  }
};


module.exports = {
  getGMPStatsByStatsType
};
