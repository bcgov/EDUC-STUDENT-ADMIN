const passport = require('passport');
const config = require('../config/index');
const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../components/auth');
const utils = require('../components/utils');
const cache = require('memory-cache');
const log = require('npmlog');

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
router.get('/codes/statuses', passport.authenticate('jwt', {session: false}), auth.isValidAdminToken, cacheMiddleware(),
  async (req, res) => {
    try{
      const token = utils.getBackendToken(req);
      axios.defaults.headers['common']['Authorization'] = `Bearer ${token}`;
      const response = await axios.get(config.get('server:statusCodeURL'));

      if(response.status >= 200 && response.status < 300){
        return res.status(200).json(response.data);
      }
      log.error('Invalid status code received from pen-request-api.  Check pen-request-api logs.');
      return res.status(response.status).json();
    } catch(e) {
      log.error('Error occurred while attempting to GET pen request status codes.');
      log.error(e);
      return res.status(500);
    }
  }
);

router.post('/:id/comments', passport.authenticate('jwt', {session: false}), auth.isValidAdminToken,
  async (req, res) => {
    try{
      const token = utils.getBackendToken(req);
      const userToken = utils.getUser(req);

      //mapping from what comment widget needs to what the comments api needs
      const request = {
        penRetrievalRequestID: req.params.id,
        staffMemberIDIRGUID: userToken['preferred_username'].toUpperCase(),
        staffMemberName: userToken['idir_username'],
        commentContent: req.body.content,
        commentTimestamp: req.body.timestamp
      };

      axios.defaults.headers['common']['Authorization'] = `Bearer ${token}`;
      const penRetrievalResponse = await axios.post(config.get('server:penRequestURL') + '/' + req.params.id + '/comments', request);

      if(penRetrievalResponse.status >= 200 && penRetrievalResponse.status < 300){
        return res.status(200).json(penRetrievalResponse.data);
      }
      log.error('Invalid status code received from pen-request-api.  Check pen-request-api logs.');
      return res.status(500).json();
    } catch(e) {
      log.error('Error occurred while attempting to POST pen request comment.');
      log.error(e);
      return res.status(500);
    }
  });

router.get('/:id/comments', passport.authenticate('jwt', {session: false}), auth.isValidAdminToken,
  async (req, res) => {
    try{
      const token = utils.getBackendToken(req);
      const userToken = utils.getUser(req);

      axios.defaults.headers['common']['Authorization'] = `Bearer ${token}`;
      const penRetrievalResponse = await axios.get(config.get('server:penRequestURL') + '/' + req.params.id + '/comments');

      if(penRetrievalResponse.status < 200 || penRetrievalResponse.status >= 300){
        log.error('Invalid status code received from pen-request-api. Check pen-request-api logs');
        return res.status(500).json();
      }
      //setting response object to the format required by comments widget
      let response = {
        participants: [],
        myself: {
          name: userToken['idir_username'],
          id: userToken['preferred_username'].toUpperCase()
        },
        messages: []
      };
      //sorting comments by date
      penRetrievalResponse.data.sort((a,b) => (a.commentTimestamp > b.commentTimestamp) ? 1 : ((b.commentTimestamp > a.commentTimestamp) ? -1 : 0));

      //if staffMember fields are null then comment was made by the student
      penRetrievalResponse.data.forEach(element => {
        const participant = {
          name: (element.staffMemberName ? element.staffMemberName : 'Student'),
          id: (element.staffMemberIDIRGUID ? element.staffMemberIDIRGUID : '1')
        };
        //push all unique participants that are not myself
        if (participant.id.toUpperCase() !== response.myself.id.toUpperCase()) {
          const index = response.participants.findIndex((e) => e.id === participant.id);
          if (index === -1) {
            response.participants.push(participant);
          }
        }
        let timestamp = new Date(element.commentTimestamp);
        response.messages.push({
          content: element.commentContent,
          participantId: (element.staffMemberIDIRGUID ? element.staffMemberIDIRGUID : '1'),
          timestamp: {
            year: timestamp.getFullYear(),
            month: timestamp.getMonth() + 1,
            day: timestamp.getDate(),
            hour: timestamp.getHours(),
            minute: timestamp.getMinutes(),
            second: timestamp.getSeconds(),
            millisecond: timestamp.getMilliseconds()
          }
        });
      });
      return res.status(200).json(response);
    } catch(e) {
      log.error('Error occurred while attempting to GET all comments.');
      log.error(e);
      return res.status(500);
    }
  });

/**
 * Updates a pen retrieval request
 * */
router.put('/',
  passport.authenticate('jwt', {session: false}),
  auth.isValidAdminToken,
  async (req, res) => {
    try{
      let thisSession = req['session'];
      const token = thisSession['passport'].user.jwt;
      const penRequest = req.body;

      if(!thisSession.penRequest) {
        log.error('Error attempting to update pen request.  There is no pen request stored in session.');
        return res.status(500).json();
      }
      penRequest.digitalID = thisSession.penRequest.digitalID;

      axios.defaults.headers['common']['Authorization'] = `Bearer ${token}`;
      const penRetrievalResponse = await axios.put(config.get('server:penRequestURL'), penRequest);

      if(penRetrievalResponse.status >= 200 && penRetrievalResponse.status < 300){
        req['session'].penRequest = Object.assign({},penRequest);
        delete penRetrievalResponse['digitalID'];
        return res.status(200).json(penRetrievalResponse.data);
      }
      log.error('Invalid status code received from pen request api. Check pen-request-api logs.');
      return res.status(penRetrievalResponse.status).json();
    } catch(e) {
      log.error('Error occurred while attempting a PUT to pen request.');
      log.error(e);
      return res.status(500);
    }
  });

/*
 * Get all pen retrieval requests
 */
router.get('/', passport.authenticate('jwt', {session: false}), auth.isValidAdminToken,
  async (req, res) => {
    try{
      const token = utils.getBackendToken(req);
      axios.defaults.headers['common']['Authorization'] = `Bearer ${token}`;

      const statusCodeResponse = await axios.get(config.get('server:statusCodeURL'));
      if(statusCodeResponse.status < 200 || statusCodeResponse.status >= 300){
        log.error('Invalid status code received from pen-request-api. Check pen-request-api logs.');
        return res.status(500).json();
      }
      const penRetrievalResponse = await axios.get(config.get('server:penRequestURL'));
      if(penRetrievalResponse.status < 200 || penRetrievalResponse.status >= 300){
        log.error('Invalid status code received from pen-request-api. Check pen-request-api logs.');
        return res.status(500).json();
      }
      penRetrievalResponse.data.forEach(element => {
        //replace status code with label
        if(element.penRequestStatusCode){
          let temp = statusCodeResponse.data.find(codeStatus => codeStatus.penRequestStatusCode === element.penRequestStatusCode);
          if(temp){
            element.penRequestStatusCode = temp;
          }
        }
        //dont send digital id to frontend
        delete element['digitalID'];
      });
      return res.status(200).json(penRetrievalResponse.data);
    } catch(e) {
      log.error('Error occurred while attempting to GET all pen requests.');
      log.error(e);
      return res.status(500);
    }
  });

router.get('/:id', passport.authenticate('jwt', {session: false}), auth.isValidAdminToken,
  async (req, res) => {
    try{
      let thisSession = req['session'];
      const userToken = thisSession['passport'].user.jwt;

      axios.defaults.headers['common']['Authorization'] = `Bearer ${userToken}`;
      const penRetrievalResponse = await axios.get(config.get('server:penRequestURL') + '/' + req.params.id);

      if(penRetrievalResponse.status >= 200 && penRetrievalResponse.status < 300){
        req['session'].penRequest = Object.assign({},penRetrievalResponse.data);
        delete penRetrievalResponse.data['digitalID'];
        return res.status(200).json(penRetrievalResponse.data);
      }
      log.error('Invalid status code received from pen-request-api. Check pen-request-api logs');
      return res.status(500).json();
    } catch(e) {
      log.error('Error occurred while attempting to GET pen request');
      log.error(e);
      return res.status(500).json();
    }
  });

router.post('/update-and-email', passport.authenticate('jwt', {session: false}), auth.isValidAdminToken,
  async  (req, res) => {

    let thisSession = req['session'];

    const penRequest = req.body.penRetrievalRequest;

    //Check that request stored in session is valid. This is used to reinsert the digitalId
    if(!thisSession.penRequest) {
      log.error('Error attempting to update pen request.  There is no pen request stored in session.');
      return res.status(500).json();
    }
    else if(penRequest['penRequestId'] !== thisSession.penRequest['penRequestId']) {
      log.error('Error attempting to update pen request.  The request stored in session is different from the one being updated.');
      return res.status(500).json();
    }
    const penRequestStatusCode = thisSession.penRequest.penRequestStatusCode;

    if (penRequestStatusCode) {
      if (penRequestStatusCode.toUpperCase() !== 'REJECTED') {
        const token = thisSession['passport'].user.jwt;
        penRequest.digitalID = thisSession.penRequest.digitalID;
        if(!penRequest.digitalID) {
          log.error('Error attempting to update pen request.  The request stored in session did not have a digitalId.');
          return res.status(500).json();
        }

        axios.defaults.headers['common']['Authorization'] = `Bearer ${token}`;
        axios.put(config.get('server:penRequestURL'), penRequest)
          .then(penResponse => {
            req['session'].penRequest = Object.assign({},penRequest);
            delete penResponse['digitalID'];
            let emailBody = { emailAddress: penRequest['email'] };
            if(req.body.penEmailRequest.type.toLowerCase() === 'reject') {
              emailBody.rejectionReason = req.body.penEmailRequest.message;
            }
            axios.post(config.get('server:penEmails') + '/' + req.body.penEmailRequest.type, emailBody)
              .then(() => {
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
      else {
        log.error('Cannot update or email when pen request is in REJECTED state.');
        return res.status(409).json('Cannot update request in REJECTED status.');
      }
    }
    else {
      log.error('Error attempting to update pen request and send email. Missing penRequestStatusCode.');
      return res.status(500).json();
    }
  }
);


module.exports = router;
