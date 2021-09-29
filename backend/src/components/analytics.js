'use strict';
const {getBackendToken, getData, errorResponse} = require('./utils');
const config = require('../config/index');
const HttpStatus = require('http-status-codes');


function getStatsByStatsType(url) {
  return function(req, res) {
    const statsType = req.query.statsType;
    if (!statsType) {
      return res.status(HttpStatus.BAD_REQUEST).json({message: 'Missing required parameter statsType'});
    }
    getData(getBackendToken(req), url + '/stats?statsType=' + statsType)
      .then(dataResponse => {
        return res.status(HttpStatus.OK).json(dataResponse);
      })
      .catch(e => {
        return errorResponse(res, e.data, e.status);
      });
  };
}


module.exports = {
  getGMPStatsByStatsType: getStatsByStatsType(config.get('server:penRequest:rootURL')),
  getUMPStatsByStatsType: getStatsByStatsType(config.get('server:studentRequest:rootURL'))
};
