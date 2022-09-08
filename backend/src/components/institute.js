'use strict';
const { logApiError, errorResponse} = require('./utils');
const HttpStatus = require('http-status-codes');
const cacheService = require('./cache-service');


async function getDistricts(req, res) {
  try {
    if (req.query.refreshCache === 'true') {
      await cacheService.loadAllDistrictsToMap();
    }
    const districts = req.query.active === '1' ? cacheService.getAllActiveDistrictsJSON() : cacheService.getAllDistrictsJSON();
    return res.status(HttpStatus.OK).json(districts);
  } catch (e) {
    logApiError(e, 'getDistricts', 'Error occurred while attempting to GET district entity.');
    return errorResponse(res);
  }
}
async function getDistrictByDistrictId(req, res) {
  try {
    const districtId = req.params.districtId;
    return res.status(HttpStatus.OK).json(cacheService.getDistrictJSONByDistrictId(districtId));
  } catch (e) {
    logApiError(e, 'getDistrictByDistrictId', 'Error occurred while attempting to GET District entity.');
    return errorResponse(res);
  }
}

async function getSchools(req, res) {
  try {
    let schools = req.query.active === '1' ? cacheService.getAllActiveSchoolsJSON() : cacheService.getAllSchoolsJSON();
    return res.status(HttpStatus.OK).json(schools);
  } catch (e) {
    logApiError(e, 'getSchools', 'Error occurred while attempting to GET school entity.');
    return errorResponse(res);
  }
}

module.exports = {
  getDistricts,
  getDistrictByDistrictId,
  getSchools
};
