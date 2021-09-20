'use strict';

const {errorResponse} = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const {postData} = require('./utils');
const utils = require('./utils');

const postNominalRollFile = async (req,res) =>{
  try {
    const token = utils.getBackendToken(req);
    console.info(`Access is ${token}`);
    const document = {
      fileExtension: req.body.fileExtension.replace('.',''),
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
module.exports = {
  postNominalRollFile,
};
