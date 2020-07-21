const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const utils = require('../components/utils');
const { createStudentRequestApiServiceReq, returnProfileRequest, rejectProfileRequest, completeProfileRequest } = require('../components/studentRequests');
const { getAllRequests, getMacros, getRequestById, getRequestCommentById, putRequest } = require('../components/requests');

const { getDocuments, getDocumentById, updateDocumentTypeById } = require('../components/documents');

const requestType = 'studentRequest';
const verifyStudentRequestInSession = utils.verifyRequestInSession(requestType);

/**
 * Gets all the comments for a request by request id
 */
router.get('/:id/comments', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPUserToken, getRequestCommentById(requestType));

/**
 * Updates a request
 * */
router.put('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPAdmin, verifyStudentRequestInSession, putRequest(requestType, createStudentRequestApiServiceReq));

/*
 * Get all requests
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPUserToken, getAllRequests(requestType));

/*
 * Get all requests for a given pen number in the query parameter.
 */
//router.get('/duplicateRequests', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, findPenRequestsByPen);

router.get('/macros', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPAdmin, utils.cacheMiddleware(), getMacros(requestType));

/*
 * Get a request by id
 */
router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPUserToken, getRequestById(requestType));

router.post('/complete', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPAdmin, verifyStudentRequestInSession, completeProfileRequest);

router.post('/reject', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPAdmin, verifyStudentRequestInSession, rejectProfileRequest);

router.post('/:id/return', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPAdmin, verifyStudentRequestInSession, returnProfileRequest);

// retrieve all the documents.
router.get('/:id/documents', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPUserToken, getDocuments(requestType));

// retrieve the document by its id.
router.get('/:id/documents/:documentId', auth.isValidUMPUserToken, getDocumentById(requestType));

// Updates the type of a document by its id.
router.put('/:id/documents/:documentId', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPAdmin, updateDocumentTypeById(requestType));

module.exports = router;
