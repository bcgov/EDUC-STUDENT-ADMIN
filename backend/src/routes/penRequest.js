const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const utils = require('../components/utils');
const {findPenRequestsByPen, createPenRequestApiServiceReq, returnPenRequest, unlinkRequest, rejectPenRequest, completePenRequest, getPENRequestStats} = require('../components/penRequests');
const {getAllRequests, getRequestById, getRequestCommentById, putRequest} = require('../components/requests');

const {getDocuments, getDocumentById, updateDocumentTypeById} = require('../components/documents');
const atomicStudentUpdate = require('../middlewares/atomic-student-update');
const permUtils = require('../components/permissionUtils');
const requestType = 'penRequest';
const verifyPenRequestInSession = utils.verifyRequestInSession(requestType);

/**
 * Gets all the comments for a pen request by pen request id
 */
router.get('/:id/comments', passport.authenticate('jwt', {session: false}, undefined), auth.isValidGMPUserToken, permUtils.isValidUUIDParam('id'), getRequestCommentById(requestType));

/**
 * Updates a pen retrieval request
 * */
router.put('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidGMPAdmin, verifyPenRequestInSession, putRequest(requestType, createPenRequestApiServiceReq));

/*
 * Get all pen retrieval requests
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidGMPUserToken, getAllRequests(requestType));

/*
 * Get all pen retrieval requests for a given pen number in the query parameter.
 */
router.get('/duplicatePenRequests', passport.authenticate('jwt', {session: false}, undefined), auth.isValidGMPAdmin, permUtils.isValidUUIDQueryParam('pen'), findPenRequestsByPen);

//Returns the number of pen requests in initial and subsequent review
router.get('/stats', passport.authenticate('jwt', {session: false}, undefined), auth.isValidGMPUserToken, getPENRequestStats);

/*
 * Get a pen request by id
 */
router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isValidGMPUserToken, permUtils.isValidUUIDParam('id'), getRequestById(requestType));

router.post('/complete', passport.authenticate('jwt', {session: false}, undefined), auth.isValidGMPAdmin, verifyPenRequestInSession, atomicStudentUpdate.handleConcurrentStudentModification, completePenRequest);

router.post('/reject', passport.authenticate('jwt', {session: false}, undefined), auth.isValidGMPAdmin, verifyPenRequestInSession, rejectPenRequest);

router.post('/:id/return', passport.authenticate('jwt', {session: false}, undefined), auth.isValidGMPAdmin, verifyPenRequestInSession, returnPenRequest);

// retrieve all the documents.
router.get('/:id/documents', passport.authenticate('jwt', {session: false}, undefined), auth.isValidGMPUserToken, permUtils.isValidUUIDParam('id'), getDocuments(requestType));

// retrieve the document by its id.
router.get('/:id/documents/:documentId', auth.isValidGMPUserToken, permUtils.isValidUUIDParam('id'), permUtils.isValidUUIDParam('documentId'), getDocumentById(requestType));

// Updates the type of a document by its id.
router.put('/:id/documents/:documentId', passport.authenticate('jwt', {session: false}, undefined), auth.isValidGMPAdmin, permUtils.isValidUUIDParam('id'), updateDocumentTypeById(requestType));

router.post('/unlink', passport.authenticate('jwt', {session: false}, undefined), auth.isValidGMPAdmin, verifyPenRequestInSession, unlinkRequest);

module.exports = router;
