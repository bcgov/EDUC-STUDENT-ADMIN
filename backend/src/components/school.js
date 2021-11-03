'use strict';
const config = require('../config/index');
const {getBackendToken, getData, putData, getUser, logApiError, errorResponse} = require('./utils');
const HttpStatus = require('http-status-codes');
const cacheService = require('./cache-service');
const lodash = require('lodash');
const retry = require('async-retry');
const {LocalDate, DateTimeFormatter} = require('@js-joda/core');

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

async function updatePenCoordinatorByMincode(req, res) {
  try {
    const token = getBackendToken(req);
    const url = `${config.get('server:schoolAPIURL')}/schools/${req.params.mincode}/pen-coordinator`;

    await retry(async () => {
      const result = await putData(token, url, req.body, getUser(req).idir_username);
      return res.status(HttpStatus.OK).json(result);
    },
    {
      retries: 3
    });
  } catch (e) {
    logApiError(e, 'updatePenCoordinatorByMincode', 'Error occurred while attempting to update a PEN Coordinator.');
    return errorResponse(res);
  }

}

async function getPenCoordinators(req, res) {
  const token = getBackendToken(req);
  try {
    const url = `${config.get('server:schoolAPIURL')}/schools/pen-coordinator`;
    const data = await getData(token, url);
    const coords = lodash.sortBy(data, ['mincode', 'penCoordinatorName']);
    const filteredCords = coords.filter(coord=> {
      const school = cacheService.getSchoolNameJSONByMincode(coord.mincode);
      const openedDate = school?.effectiveDate;
      const closedDate = school?.expiryDate;
      return !(school && school.schoolName && openedDate == null || LocalDate.parse(openedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME).isAfter(LocalDate.now()) || (closedDate != null && LocalDate.parse(closedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME).isBefore(LocalDate.now())));
    }).map(coord=> coord.schoolName = cacheService.getSchoolNameJSONByMincode(coord.mincode)?.schoolName);
    return res.status(200).json(filteredCords);
  } catch (e) {
    logApiError(e, 'getPenCoordinators', 'Error occurred while attempting to GET pen coordinator entities.');
    return errorResponse(res);
  }
}

module.exports = {
  getSchoolByMincode,
  getPenCoordinatorByMincode,
  updatePenCoordinatorByMincode,
  getPenCoordinators,
};
