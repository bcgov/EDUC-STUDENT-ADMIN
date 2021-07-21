'use strict';
const config = require('../config/index');
const {getBackendToken, getData, logApiError, errorResponse} = require('./utils');
const cacheService = require('./cache-service');
const lodash = require('lodash');

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
      }else {
        return res.status(200).json([]);
      }
    }
    return res.status(200).json();
  } catch (e) {
    logApiError(e, 'getSchoolByMincode', 'Error occurred while attempting to GET school entity.');
    return errorResponse(res);
  }
}

async function getPenCoordinatorByMincode(req, res) {
  const token = getBackendToken(req);
  try {
    const url = `${config.get('server:schoolAPIURL')}/schools/${req.params.mincode}/pen-coordinator`;
    const data = await getData(token, url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getPenCoordinatorByMincode', 'Error occurred while attempting to GET pen coordinator entity.');
    return errorResponse(res);
  }
}

async function getPenCoordinators(req, res) {
  const token = getBackendToken(req);
  try {
    const url = `${config.get('server:schoolAPIURL')}/schools/pen-coordinator`;
    const data = await getData(token, url);
    const coords = lodash.sortBy(data, ['mincode', 'penCoordinatorName']);
    coords.forEach(coord => coord.schoolName = cacheService.getSchoolNameJSONByMincode(coord.mincode)?.schoolName || '');
    return res.status(200).json(coords);
  } catch (e) {
    logApiError(e, 'getPenCoordinatorByMincode', 'Error occurred while attempting to GET pen coordinator entity.');
    return errorResponse(res);
  }
}

module.exports = {
  getSchoolByMincode,
  getPenCoordinatorByMincode,
  getPenCoordinators,
};
