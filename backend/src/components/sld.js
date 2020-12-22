'use strict';
const {logApiError, errorResponse} = require('./utils');
const config = require('../config/index');
const utils = require('./utils');

async function getSldStudentHistoryByPen(req, res) {
  const token = utils.getBackendToken(req);
  const params = {
    params: {
      pen: req.query.pen
    }
  };
  try{
    return res.status(200).json(await utils.getData(token, `${config.get('server:sld:studentHistoryURL')}`, params));
  }catch (e) {
    await logApiError(e, 'getSldStudentHistoryByPen', 'Error occurred while attempting to GET sld student history.');
    return errorResponse(res);
  }
}

module.exports = {
  getSldStudentHistoryByPen,
};
