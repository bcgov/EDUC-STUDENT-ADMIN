'use strict';
const {getBackendToken, getData, errorResponse} = require('./utils');
const config = require('../config/index');
const HttpStatus = require('http-status-codes');


function getGUMPStatsByStatsType(type) {
  return function(req, res) {
    const statsType = req.query.statsType;
    if (!statsType) {
      return res.status(HttpStatus.BAD_REQUEST).json({message: 'Missing required parameter statsType'});
    }
    let url;
    if (type === 'GMP') {
      url = config.get('server:penRequest:rootURL') + '/stats?statsType=' + statsType;
    } else {
      url = config.get('server:studentRequest:rootURL') + '/stats?statsType=' + statsType;
    }
    getData(getBackendToken(req), url)
      .then(dataResponse => {
        return res.status(HttpStatus.OK).json(dataResponse);
      })
      .catch(e => {
        return errorResponse(res, e.data, e.status);
      });
  };
}


module.exports = {
  getGMPStatsByStatsType: getGUMPStatsByStatsType('GMP'),
  getUMPStatsByStatsType: getGUMPStatsByStatsType('UMP')
};
