'use strict';

const {errorResponse} = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const {postData, getData} = require('./utils');
const utils = require('./utils');
const {LocalDate, LocalDateTime} = require('@js-joda/core');

const postNominalRollFile = async (req, res) => {
  try {
    const token = utils.getBackendToken(req);
    const document = {
      fileExtension: req.body.fileExtension.replace('.', ''),
      fileContents: req.body.documentData
    };
    const params = {
      headers: {
        correlationID: req.session.correlationID,
      }
    };
    const result = await postData(token, config.get('server:nominalRoll:rootURL'), document, params, utils.getUser(req).idir_username);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    return errorResponse(res, e.data?.message, e.status);
  }
};
const isBeingProcessed = async (req, res) => {
  try {
    const token = utils.getBackendToken(req);
    const params = {
      headers: {
        correlationID: req.session.correlationID,
      },
      params: {
        processingYear: LocalDate.now().year()
      }
    };
    const result = await getData(token, config.get('server:nominalRoll:rootURL'), params);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    return errorResponse(res, e.data?.message, e.status);
  }
};
const startProcessing = async (req, res) => {
  try {
    const token = utils.getBackendToken(req);
    const params = {
      headers: {
        correlationID: req.session.correlationID,
      }
    };
    const userName = utils.getUser(req).idir_username;
    const body = req.body.nominalRollStudents.map(el => {
      el.processingYear = LocalDate.now().year();
      el.createUser = userName;
      el.updateUser = userName;
      el.createDate = LocalDateTime.now().toJSON();
      el.updateDate = LocalDateTime.now().toJSON();
      return el;
    });
    await postData(token, config.get('server:nominalRoll:rootURL') + '/process', body, params, utils.getUser(req).idir_username);
    return res.status(HttpStatus.ACCEPTED).json();
  } catch (e) {
    return errorResponse(res, e.data?.message, e.status);
  }
};
module.exports = {
  postNominalRollFile,
  isBeingProcessed,
  startProcessing
};
