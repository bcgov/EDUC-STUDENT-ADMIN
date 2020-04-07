const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const utils = require('../components/utils');
const { completePenRequest, getAllPenRequests, getMacros, getPenRequestById, getPenRequestCommentById, postPenRequestComment, putPenRequest, rejectPenRequest, returnPenRequest,findPenRequestsByPen } = require('../components/penRequests');
const { getDocuments, getDocumentById, updateDocumentTypeById } = require('../components/documents');
const cache = require('memory-cache');


let memCache = new cache.Cache();
let cacheMiddleware = () => {
  return (req, res, next) => {
    let key =  '__express__' + req.originalUrl || req.url;
    let cacheContent = memCache.get(key);
    if(cacheContent){
      res.send( cacheContent );

    }else{
      res.sendResponse = res.send;
      res.send = (body) => {
        memCache.put(key,body);
        res.sendResponse(body);
      };
      next();
    }
  };
};

/**
 * Gets all the comments for a pen request by pen request id
 */
router.get('/:id/comments', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, getPenRequestCommentById);

/**
 * Updates a pen retrieval request
 * */
router.put('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, putPenRequest);

/*
 * Get all pen retrieval requests
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, getAllPenRequests);

/*
 * Get all pen retrieval requests for a given pen number in the query parameter.
 */
router.get('/duplicatePenRequests', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, findPenRequestsByPen);

router.get('/macros', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, cacheMiddleware(), getMacros);

/*
 * Get a pen request by id
 */
router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, getPenRequestById);

router.post('/complete', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, completePenRequest);

router.post('/reject', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, rejectPenRequest);

router.post('/:id/return', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, returnPenRequest);

// retrieve all the documents.
router.get('/:id/documents', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, getDocuments);

// retrieve the document by its id.
router.get('/:id/documents/:documentId', auth.isValidAdminToken, getDocumentById);

// Updates the type of a document by its id.
router.put('/:id/documents/:documentId', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, updateDocumentTypeById);

module.exports = router;
