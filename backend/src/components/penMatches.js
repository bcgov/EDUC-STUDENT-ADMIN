'use strict';
const {logApiError, logInfo} = require('./utils');
const HttpStatus = require('http-status-codes');
const NATS = require('../messaging/message-pub-sub');
const {v4: guid} = require('uuid');
const utils = require('./utils');
const config = require('../config/index');

async function getPenMatch(req, res) {
  try {
    Object.keys(req.body).forEach(key => {
      req.body[key] = req.body[key] || null; // send null than empty string
    });
    if (req.body.dob) {
      req.body.dob = req.body.dob.replace(/\//g, '');
    }
    req.body.usualGivenName = req.body.usualGiven || null; // the match api expects usualGivenName
    delete req.body.usualGiven;
    const event = {
      sagaId: guid(), // this should be a guid, otherwise it would break
      eventType: 'PROCESS_PEN_MATCH',
      eventPayload: JSON.stringify(req.body)
    };
    logInfo('calling pen match via NATS', event);
    // since router times out at 30 seconds on vue side, lets timeout at 29 seconds here.
    const result = await NATS.requestMessage('PEN_MATCH_API_TOPIC', JSON.stringify(event), 29000);
    const parsedEvent = JSON.parse(result);
    logInfo('got result from NATS', parsedEvent);
    return res.status(200).json(JSON.parse(parsedEvent.eventPayload));
  } catch (e) {
    logApiError(e, 'getPenMatch', 'Error occurred while attempting to get pen matches.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}

async function getPossibleMatchesByStudentID(req, res) {
  try {
    const studentID = req.params.studentID;
    if (studentID) {
      return res.status(HttpStatus.OK).json(await utils.getData(utils.getBackendToken(req), `${config.get('server:penMatch:possibleMatch')}/${studentID}`));
    }
    return res.status(HttpStatus.BAD_REQUEST).json();
  } catch (e) {
    logApiError(e, 'getPossibleMatchesByStudentID', 'Error occurred while attempting to getPossibleMatchesByStudentID.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}

async function deletePossibleMatchesByStudentIDAndMatchedStudentID(req, res) {
  try {
    const studentID = req.params.studentID;
    const matchedStudentID = req.params.matchedStudentID;
    if (studentID && matchedStudentID) {
      return res.status(HttpStatus.NO_CONTENT).json(await utils.deleteData(utils.getBackendToken(req), `${config.get('server:penMatch:possibleMatch')}/${studentID}/${matchedStudentID}`));
    }
    return res.status(HttpStatus.BAD_REQUEST).json();
  } catch (e) {
    logApiError(e, 'deletePossibleMatchesByStudentIDAndMatchedStudentID', 'Error occurred while attempting to deletePossibleMatchesByStudentIDAndMatchedStudentID.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}

/**
 * the body expected here is an array of
 String studentID;
 String matchedStudentID;
 String matchReasonCode;
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function savePossibleMatchesForStudent(req, res) {
  try {
    const userName = utils.getUser(req).idir_username;
    const payload = req.body;
    if (payload && payload.length > 0) {

      payload.forEach((item) => {
        item.createUser = userName;
        item.updateUser = userName;
      });
      return res.status(HttpStatus.CREATED).json(await utils.postData(utils.getBackendToken(req), `${config.get('server:penMatch:possibleMatch')}`, payload));
    }
    return res.status(HttpStatus.BAD_REQUEST).json();

  } catch (e) {
    logApiError(e, 'savePossibleMatchesForStudent', 'Error occurred while attempting to savePossibleMatchesForStudent.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}

/**
 * this function will bulk delete the student's associated possible matches.
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function deletePossibleMatches(req, res) {
  try {
    const payload = req.body;
    if (payload && payload.length > 0) {
      await utils.deleteDataWithBody(utils.getBackendToken(req), config.get('server:penMatch:possibleMatch'), payload);
      return res.status(HttpStatus.NO_CONTENT).json();
    }
    return res.status(HttpStatus.BAD_REQUEST).json();
  } catch (e) {
    logApiError(e, 'deletePossibleMatches', 'Error occurred while attempting to deletePossibleMatches.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}

module.exports = {
  getPenMatch,
  getPossibleMatchesByStudentID,
  deletePossibleMatchesByStudentIDAndMatchedStudentID,
  savePossibleMatchesForStudent,
  deletePossibleMatches
};
