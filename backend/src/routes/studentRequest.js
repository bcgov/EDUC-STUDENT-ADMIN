const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const utils = require('../components/utils');
const atomicStudentUpdate = require('../middlewares/atomic-student-update');
const { createStudentRequestApiServiceReq, getUMPRequestStats, returnProfileRequest, rejectProfileRequest, completeProfileRequest } = require('../components/studentRequests');
const { getAllRequests, getRequestById, getRequestCommentById, putRequest } = require('../components/requests');

const { getDocuments, getDocumentById, updateDocumentTypeById } = require('../components/documents');
const permUtils = require('../components/permissionUtils');

const requestType = 'studentRequest';
const verifyStudentRequestInSession = utils.verifyRequestInSession(requestType);

/**
 * Gets all the comments for a request by request id
 */
router.get('/:id/comments', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPUserToken, permUtils.isValidUUIDParam('id'), getRequestCommentById(requestType));

/**
 * Updates a request
 * */
router.put('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPAdmin, verifyStudentRequestInSession, putRequest(requestType, createStudentRequestApiServiceReq));

/*
 * Get all requests
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPUserToken, getAllRequests(requestType));

//Returns the number of pen requests in initial and subsequent review
router.get('/stats', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPUserToken, getUMPRequestStats);

/*
 * Get a request by id
 */
router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPUserToken, permUtils.isValidUUIDParam('id'), getRequestById(requestType));

router.post('/complete', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPAdmin, verifyStudentRequestInSession,atomicStudentUpdate.handleConcurrentStudentModification, completeProfileRequest);

router.post('/reject', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPAdmin, verifyStudentRequestInSession, rejectProfileRequest);

router.post('/:id/return', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPAdmin, verifyStudentRequestInSession, returnProfileRequest);

// retrieve all the documents.
router.get('/:id/documents', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPUserToken, permUtils.isValidUUIDParam('id'), getDocuments(requestType));

// retrieve the document by its id.
router.get('/:id/documents/:documentId', auth.isValidUMPUserToken, permUtils.isValidUUIDParam('id'), permUtils.isValidUUIDParam('documentId'), getDocumentById(requestType));

// Updates the type of a document by its id.
router.put('/:id/documents/:documentId', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUMPAdmin, permUtils.isValidUUIDParam('id'), updateDocumentTypeById(requestType));

module.exports = router;
