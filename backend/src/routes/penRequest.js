const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const utils = require('../components/utils');
const { findPenRequestsByPen, createPenRequestApiServiceReq, createPenRequestCommentApiServiceReq } = require('../components/penRequests');
const { completeRequest, getAllRequests, getMacros, getRequestById, getRequestCommentById, putRequest, rejectRequest, returnRequest } = require('../components/requests');

const { getDocuments, getDocumentById, updateDocumentTypeById } = require('../components/documents');

const requestType = 'penRequest';
const verifyPenRequestInSession = utils.verifyRequestInSession(requestType);
/**
 * Gets all the comments for a pen request by pen request id
 */
router.get('/:id/comments', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, getRequestCommentById(requestType));

/**
 * Updates a pen retrieval request
 * */
router.put('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, verifyPenRequestInSession, putRequest(requestType, createPenRequestApiServiceReq));

/*
 * Get all pen retrieval requests
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, getAllRequests(requestType));

/*
 * Get all pen retrieval requests for a given pen number in the query parameter.
 */
router.get('/duplicatePenRequests', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, findPenRequestsByPen);

router.get('/macros', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, utils.cacheMiddleware(), getMacros(requestType));

/*
 * Get a pen request by id
 */
router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, getRequestById(requestType));

router.post('/complete', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, verifyPenRequestInSession, completeRequest(requestType, createPenRequestApiServiceReq));

router.post('/reject', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, verifyPenRequestInSession, rejectRequest(requestType, createPenRequestApiServiceReq));

router.post('/:id/return', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, verifyPenRequestInSession, returnRequest(requestType, createPenRequestApiServiceReq, createPenRequestCommentApiServiceReq));

// retrieve all the documents.
router.get('/:id/documents', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, getDocuments(requestType));

// retrieve the document by its id.
router.get('/:id/documents/:documentId', auth.isValidUserToken, getDocumentById(requestType));

// Updates the type of a document by its id.
router.put('/:id/documents/:documentId', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, updateDocumentTypeById(requestType));

module.exports = router;
