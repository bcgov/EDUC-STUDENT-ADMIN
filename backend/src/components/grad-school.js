'use strict';
const { logApiError, getData, putData, handleExceptionResponse } = require('./utils');
const config = require('../config');
const utils = require('./utils');

async function getGradSchool(req, res) {
  try {
    const url = `${config.get('server:gradSchool:rootURL')}/search/${req.params.schoolID}`;
    const data = await getData(url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getGradSchool', 'Error occurred while attempting to GET grad school.');
    return handleExceptionResponse(e, res);
  }
}

async function updateGradSchool(req, res) {
  try {
    req.body.createDate = null;
    req.body.updateDate = null;
    const url = `${config.get('server:gradSchool:rootURL')}/${req.body.gradSchoolID}`;
    const data = await putData(url, req.body, utils.getUser(req).idir_username);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'updateGradSchool', 'Error occurred while attempting to update grad school.');
    return handleExceptionResponse(e, res);
  }
}

module.exports = {
  getGradSchool,
  updateGradSchool
};
