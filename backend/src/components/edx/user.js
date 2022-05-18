'use strict';

const {errorResponse, logApiError} = require('../utils');
const HttpStatus = require('http-status-codes');
const config = require('../../config');
const utils = require('../utils');

async function getUsersSchoolByMincode(req, res) {
  try {
    const token = utils.getBackendToken(req);
    const params = {
      params: {
        mincode: req.query.mincode,
      }
    };
    const response = await utils.getData(token, config.get('server:edx:exchangeUsersURL'), params);

    //filter response to provide EdxUser's access for at school with matching mincode
    const filteredResponse = response.map(user => {
      return ({
        ...user,
        edxUserDistricts: [],
        edxUserSchools: user.edxUserSchools.filter(school => school.mincode === req.query.mincode)
      });
    });

    return res.status(HttpStatus.OK).json(filteredResponse);
  } catch (e) {
    logApiError(e, 'getUsersSchoolByMincode', 'Error getting a list of school users.');
    return errorResponse(res);
  }
}

module.exports = {
  getUsersSchoolByMincode
};
