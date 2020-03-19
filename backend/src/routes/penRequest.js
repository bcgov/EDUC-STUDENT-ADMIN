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

router.post('/update-and-email', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken,
  async  (req, res) => {

    let thisSession = req['session'];
    const penRequest = req.body['penRetrievalRequest'];
    delete penRequest.dataSourceCode;
    delete penRequest.penRequestStatusCodeLabel;

    //Check that request stored in session is valid. This is used to reinsert the digitalId
    if(!thisSession.penRequest) {
      log.error('Error attempting to update pen request.  There is no pen request stored in session.');
      return res.status(500).json();
    }
    else if(penRequest['penRequestId'] !== thisSession.penRequest['penRequestId']) {
      log.error('Error attempting to update pen request.  The request stored in session is different from the one being updated.');
      return res.status(500).json();
    }

    const token = thisSession['passport'].user.jwt;
    penRequest.digitalID = thisSession.penRequest.digitalID;
    if(!penRequest.digitalID) {
      log.error('Error attempting to update pen request.  The request stored in session did not have a digitalId.');
      return res.status(500).json();
    }

    axios.defaults.headers['common']['Authorization'] = `Bearer ${token}`;
    axios.put(config.get('server:penRequestURL'), penRequest)
      .then(penResponse => {

        //Get new status code label
        let statusCodes = utils.getCodeTable('penStatusCodes', config.get('server:statusCodeURL'));
        let label = utils.getCodeLabel(statusCodes, 'penRequestStatusCode', penResponse.data.penRequestStatusCode);
        penRequest.penRequestStatusCodeLabel = label;
        penRequest.dataSourceCode = thisSession.penRequest.dataSourceCode;
        utils.saveSession(req, res, penRequest);
        delete penResponse['digitalID'];
        let emailBody = { emailAddress: penRequest['email'] };
        if(!req.body['penEmailRequest'].type) {
          return res.status(400).json();
        }
        if(req.body['penEmailRequest'].type.toLowerCase() === 'reject') {
          emailBody.rejectionReason = req.body['penEmailRequest'].message;
        }
        else if(req.body['penEmailRequest'].type.toLowerCase() === 'complete') {
          emailBody.firstName = req['session'].studentDemographics['studGiven'];
        }
        axios.post(config.get('server:penEmails') + '/' + req.body['penEmailRequest'].type, emailBody)
          .then(() => {
            penResponse.data.dataSourceCode = thisSession.penRequest.dataSourceCode;
            penResponse.data.penRequestStatusCodeLabel = label;
            return res.status(200).json(penResponse.data);
          })
          .catch(error => {
            log.error('Error calling email service.  Check the PEN-REQUEST-EMAIL-API logs.');
            log.error(error);
            return res.status(500).json('Error calling email service.');
          });
      })
      .catch(error => {
        log.error('Error occurred while attempting a PUT to pen request. Check pen-request-api logs.');
        log.error(error);
        return res.status(500).json();
      });
  }
);

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
