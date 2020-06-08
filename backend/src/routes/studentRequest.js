const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const utils = require('../components/utils');
const { createStudentRequestApiServiceReq, createStudentRequestCommentApiServiceReq } = require('../components/studentRequests');
const { completeRequest, getAllRequests, getMacros, getRequestById, getRequestCommentById, putRequest, rejectRequest, returnRequest } = require('../components/requests');

const { getDocuments, getDocumentById, updateDocumentTypeById } = require('../components/documents');

const requestType = 'studentRequest';
const verifyStudentRequestInSession = utils.verifyRequestInSession(requestType);

/**
 * Gets all the comments for a request by request id
 */
router.get('/:id/comments', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, getRequestCommentById(requestType));

/**
 * Updates a request
 * */
router.put('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, verifyStudentRequestInSession, putRequest(requestType, createStudentRequestApiServiceReq));

/*
 * Get all requests
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, getAllRequests(requestType));

/*
 * Get all requests for a given pen number in the query parameter.
 */
//router.get('/duplicateRequests', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, findPenRequestsByPen);

router.get('/macros', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, utils.cacheMiddleware(), getMacros(requestType));

/*
 * Get a request by id
 */
router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, getRequestById(requestType));

router.post('/complete', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, verifyStudentRequestInSession, completeRequest(requestType, createStudentRequestApiServiceReq));

router.post('/reject', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, verifyStudentRequestInSession, rejectRequest(requestType, createStudentRequestApiServiceReq));

router.post('/:id/return', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, verifyStudentRequestInSession, returnRequest(requestType, createStudentRequestApiServiceReq, createStudentRequestCommentApiServiceReq));

// retrieve all the documents.
router.get('/:id/documents', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, getDocuments(requestType));

// retrieve the document by its id.
router.get('/:id/documents/:documentId', auth.isValidUserToken, getDocumentById(requestType));

// Updates the type of a document by its id.
router.put('/:id/documents/:documentId', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, updateDocumentTypeById(requestType));

module.exports = router;
