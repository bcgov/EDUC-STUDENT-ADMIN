'use strict';
const config = require('../config/index');
const {getBackendToken, getData, postData, getUser, logApiError, errorResponse, stripAuditColumns, addSagaStatusToRecords} = require('./utils');
const redisUtil = require('../util/redis/redis-utils');
const log = require('./logger');
const SAGAS = require('./saga');
const { randomInt } = require('crypto');

async function updateMacroByMacroId(req, res) {
  try {
    const token = getBackendToken(req);
    stripAuditColumns(req.body);
    
    const url = `${config.get('server:macro:penMacroURL')}/update-macro`;
    const sagaId = await postData(token, url, req.body, null, getUser(req).idir_username);
    await createMacroSagaRecordInRedis(sagaId, 'MACRO_UPDATE_SAGA', 'update macro', req.params.macroId);

    return res.status(200).json(sagaId);
  } catch (e) {
    logApiError(e, 'updateMacroByMacroId', 'Error updating a Macro.');
    return errorResponse(res);
  }
}

function genRandomMacroCode(length = 3) {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charsLength = chars.length;
  for ( let i = 0; i < length; i++ ) {
    result += chars.charAt(randomInt(charsLength));
  }
  return result;
}

function createMacroCode(macros) {
  let macroCode;
  do {
    macroCode = genRandomMacroCode();
  } while(macros.some(macro => macro.macroCode === macroCode));
  return macroCode;
}

async function createMacro(req, res) {
  try {
    const token = getBackendToken(req);
    const newMacro = req.body;
    stripAuditColumns(newMacro);

    const penMacroURL = config.get('server:macro:penMacroURL');
    const currentMacros = await getData(token, `${penMacroURL}/?businessUseTypeCode=${newMacro.businessUseTypeCode}&macroTypeCode=${newMacro.macroTypeCode}`);
    newMacro.macroCode = createMacroCode(currentMacros);
    
    const sagaId = await postData(token, `${penMacroURL}/create-macro`, newMacro, null, getUser(req).idir_username);

    await createMacroSagaRecordInRedis(sagaId, 'MACRO_CREATE_SAGA', 'create macro', null);

    return res.status(200).json(sagaId);
  } catch (e) {
    logApiError(e, 'createMacro', 'Error creating a Macro.');
    return errorResponse(res);
  }
}

function getMacroSagaEvents() {
  return redisUtil.getSagaEventsByRedisKey(SAGAS.MACRO.sagaEventRedisKey);
}

function addSagaStatus(macros) {
  return addSagaStatusToRecords(macros, 'macroId', getMacroSagaEvents);
}

function createMacroSagaRecordInRedis(sagaId, sagaName, operation, macroId) {
  const event = {
    sagaId,
    macroId,
    sagaStatus: 'INITIATED',
    sagaName
  };
  log.info(`going to store event object in redis for ${operation} request :: `, event);
  return redisUtil.createSagaRecord(event, SAGAS.MACRO.sagaEventRedisKey);
}

module.exports = {
  addSagaStatus,
  updateMacroByMacroId,
  createMacro
};
