
const file =require('../components/file');
const passport = require('passport');
const config = require('../config/index');
const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../components/auth');
const utils = require('../components/utils');
const { completePenRequest, getAllPenRequests, getMacros, getPenRequestById, getPenRequestCommentById, putPenRequest, rejectPenRequest, returnPenRequest,findPenRequestsByPen } = require('../components/penRequests');
const log = require('npmlog');
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
router.get('/:id/documents', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken,
  async (req, res) => {
    const token = utils.getBackendToken(req);
    axios.defaults.headers['common']['Authorization'] = `Bearer ${token}`;
    const url = `${config.get('server:penRequestURL')}/${req.params.id}/documents`;
    log.debug(`url is ${url}`);
    axios.get(url).then(documentResponse =>{
      const results=[];
      for(const element of documentResponse.data)  {
        if(element.fileSize)
          element.fileSize = file.humanFileSize(element.fileSize);
        results.push(element);
      }
      return res.status(200).json(results);
    }).catch(error=>{
      log.error('An error occurred attempting to get documents.');
      log.error(error);
      log.error(JSON.stringify(error.response.data));
      return res.status(500).json();
    });
  });
// retrieve the document by its id.
router.get('/:id/documents/:documentId', auth.isValidAdminToken,
  async (req, res) => {
    const token = utils.getBackendToken(req);
    if(!token){
      return res.status(401).json({
        status: 401,
        message: 'You are not authorised to access this page.'
      });
    }
    axios.defaults.headers['common']['Authorization'] = `Bearer ${token}`;
    const url = `${config.get('server:penRequestURL')}/${req.params.id}/documents/${req.params.documentId}`;
    log.debug(`url is ${url}`);
    axios.get(url).then(resData =>{
      res.setHeader('Content-disposition', 'attachment; filename=' + resData.data.fileName);
      res.setHeader('Content-type', resData.data.fileExtension);
      return res.status(200).send(Buffer.from(resData.data.documentData, 'base64'));
    }).catch(error=>{
      log.error('An error occurred attempting to get documents.');
      log.error(error);
      return res.status(500).json();
    });
  });
module.exports = router;
