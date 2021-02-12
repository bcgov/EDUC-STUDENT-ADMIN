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
    const data = await utils.getData(token, `${config.get('server:sld:studentHistoryURL')}`, params);
    if (!!data && data.length > 0) {
      const convertedData = data.map(item => convert(item));
      return res.status(200).json(convertedData);
    } else {
      return res.status(200).json([]);
    }
  }catch (e) {
    await logApiError(e, 'getSldStudentHistoryByPen', 'Error occurred while attempting to GET sld student history.');
    return errorResponse(res);
  }
}

function convert(obj) {
  const renameKeys = [
    {old: 'legalSurName', new: 'legalSurname'},
    {old: 'usualSurName', new: 'usualSurname'}
  ];
  let data = {};
  Object.keys(obj).forEach(key => {
    const newKey = renameKeys.find(i => i.old === key)?.new;
    if (newKey) {
      data = {...data, [newKey]: obj[key]};
    } else {
      data = {...data, [key]: obj[key]};
    }
  });
  return data;
}

module.exports = {
  getSldStudentHistoryByPen,
};
