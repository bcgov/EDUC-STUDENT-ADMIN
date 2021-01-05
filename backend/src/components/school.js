'use strict';
const {logApiError, errorResponse} = require('./utils');
const cacheService = require('./cache-service');

async function getSchoolByMincode(req, res) {
  try {
    if(req.query?.mincode){
      const data = cacheService.getSchoolNameJSONByMincode(req.query.mincode);
      if(data){
        return res.status(200).json(data);
      }
    }else {
      const data = cacheService.getAllSchoolsJSON();
      if(data){
        return res.status(200).json(data);
      }
    }
    return res.status(200).json();
  } catch (e) {
    logApiError(e, 'getSchoolByMincode', 'Error occurred while attempting to GET school entity.');
    return errorResponse(res);
  }
}

module.exports = {
  getSchoolByMincode,
};
