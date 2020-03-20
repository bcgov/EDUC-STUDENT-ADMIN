const file =require('../components/file');
const passport = require('passport');
const config = require('../config/index');
const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../components/auth');
const utils = require('../components/utils');
const { completePenRequest, getAllPenRequests, getPenRequestById, getPenRequestCommentById, postPenRequestComment, putPenRequest, rejectPenRequest, returnPenRequest } = require('../components/penRequests');

const log = require('npmlog');

/**
 * Creates a comment for a pen request given a pen request id
 */
router.post('/:id/comments', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, postPenRequestComment);

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
 * Get a pen request by id
 */
router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, getPenRequestById);

router.post('/complete', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, completePenRequest);

router.post('/reject', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, rejectPenRequest);

router.post('/return', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, returnPenRequest);

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
