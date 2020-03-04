const passport = require('passport');
const config = require('../config/index');
const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../components/auth');
const utils = require('../components/utils');

const log = require('npmlog');

router.post('/:id/comments', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken,
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
        commentTimestamp: req.body.timestamp.length>23?req.body.timestamp.substring(0,23):req.body.timestamp
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

router.get('/:id/comments', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken,
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
  passport.authenticate('jwt', {session: false}, undefined),
  auth.isValidAdminToken,
  async (req, res) => {
    try{
      let thisSession = req['session'];
      const token = thisSession['passport'].user.jwt;
      const penRequest = req.body;
      delete penRequest.dataSourceCode;
      delete penRequest.penRequestStatusCodeLabel;

      if(!thisSession.penRequest) {
        log.error('Error attempting to update pen request.  There is no pen request stored in session.');
        return res.status(500).json();
      }
      penRequest.digitalID = thisSession.penRequest.digitalID;

      axios.defaults.headers['common']['Authorization'] = `Bearer ${token}`;
      const penRetrievalResponse = await axios.put(config.get('server:penRequestURL'), penRequest);

      if(penRetrievalResponse.status >= 200 && penRetrievalResponse.status < 300){
        utils.saveSession(req, res, penRequest);
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
router.get('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken,
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

router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken,
  async (req, res) => {
    try{
      let thisSession = req['session'];
      const userToken = thisSession['passport'].user.jwt;
      axios.defaults.headers['common']['Authorization'] = `Bearer ${userToken}`;

      Promise.all([
        axios.get(config.get('server:penRequestURL') + '/' + req.params.id),
        utils.getCodeTable('identityTypeCodes', config.get('server:digitalIdIdentityTypeCodesURL')),
        utils.getCodeTable('penStatusCodes', config.get('server:statusCodeURL'))
      ])
        .then(async ([penRetrievalResponse, digitalIdIdentityTypeCodesResponse, statusCodesResponse]) => {
          axios.get(config.get('server:digitalIdURL') + '/' + penRetrievalResponse.data['digitalID'])
            .then(response => {
              if(!digitalIdIdentityTypeCodesResponse) {
                log.error('Failed to get digitalId identity type codes. Using code value instead of label.');
                penRetrievalResponse.data['dataSourceCode'] = response.data['identityTypeCode'];
              } else {
                digitalIdIdentityTypeCodesResponse.some(function (item) {
                  if (item['identityTypeCode'] === response.data['identityTypeCode']) {
                    penRetrievalResponse.data['dataSourceCode'] = item.label;
                    return true;
                  }
                });
              }
              if(!statusCodesResponse) {
                log.error('Failed to get pen request status codes.  Using code value instead of label.');
              } else {
                statusCodesResponse.some(function (item) {
                  if (item['penRequestStatusCode'] === penRetrievalResponse.data['penRequestStatusCode']) {
                    penRetrievalResponse.data['penRequestStatusCodeLabel'] = item.label;
                    return true;
                  }
                });
              }
              utils.saveSession(req, res, penRetrievalResponse.data);
              delete penRetrievalResponse.data['digitalID'];
              return res.status(200).json(penRetrievalResponse.data);
            })
            .catch(digitalIdError => {
              log.error('An error occurred attempting to retrieve digitalid details from digitalid api.');
              log.error(digitalIdError);
              log.error(JSON.stringify(digitalIdError.response.data));
            });
        })
        .catch(error => {
          log.error('An error occurred attempting to retrieve pen request details from pen request api.');
          log.error(error);
          log.error(JSON.stringify(error.response.data));
        });
    } catch(e) {
      log.error('Error occurred while attempting to GET pen request');
      log.error(e);
      return res.status(500).json();
    }
  });

router.post('/update-and-email', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken,
  async  (req, res) => {

    let thisSession = req['session'];
    const penRequest = req.body.penRetrievalRequest;
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
        utils.saveSession(req, res, penRequest);
        delete penResponse['digitalID'];
        let emailBody = { emailAddress: penRequest['email'] };
        if(!req.body.penEmailRequest.type) {
          return res.status(400).json();
        }
        if(req.body.penEmailRequest.type.toLowerCase() === 'reject') {
          emailBody.rejectionReason = req.body.penEmailRequest.message;
        }
        else if(req.body.penEmailRequest.type.toLowerCase() === 'complete') {
          emailBody.firstName = req['session'].studentDemographics['studGiven'];
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
);

router.post('/complete-pen-request', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken,
  async  (req, res) => {

    const studentBody = {
      pen: req['session'].studentDemographics.pen,
      legalFirstName: req['session'].studentDemographics['studGiven'],
      legalMiddleNames: req['session'].studentDemographics['studMiddle'],
      legalLastName: req['session'].studentDemographics['studSurname'],
      dob: req['session'].studentDemographics['dob'],
      sexCode: req['session'].studentDemographics['studSex'],
      genderCode: req['session'].studentDemographics['studSex'],
      dataSourceCode: req['session'].penRequest.dataSourceCode,
      usualFirstName: req['session'].studentDemographics['usualGiven'],
      usualMiddleNames: req['session'].studentDemographics['usualMiddle'],
      usualLastName: req['session'].studentDemographics['usualSurname'],
      email: req['session'].penRequest.email,
    };

    axios.get(config.get('server:studentURL'), {params: { pen: studentBody.pen }})
      .then(async studentGetResponse => {
        if(studentGetResponse.status >= 200 && studentGetResponse.status < 300) {
          let studentResponse = null;

          if (Array.isArray(studentGetResponse.data) && studentGetResponse.data.length === 1) {
            studentBody.studentID = studentGetResponse.data[0].studentID;
            studentResponse = await axios.put(config.get('server:studentURL'), studentBody);
          } else if (Array.isArray(studentGetResponse.data) && !studentGetResponse.data.length) {
            studentResponse = await axios.post(config.get('server:studentURL'), studentBody);
          } else {
            log.error('Failed to create student record. Invalid response data from student api. Complete pen transaction will be out of sync. Student record still needs to be created.');
            return res.status(500).json();
          }
          if(studentResponse['status'] >= 200 && studentResponse['status'] < 300) {
            axios.get(config.get('server:digitalIdURL') + '/' + req['session'].penRequest.digitalID)
              .then(digitalIdResponse => {
                if (digitalIdResponse.data) {
                  let digitalIdBody = digitalIdResponse.data;
                  digitalIdBody.studentID = studentResponse['data'].studentID;
                  delete digitalIdBody['updateUser'];
                  delete digitalIdBody['updateDate'];
                  delete digitalIdBody['createDate'];

                  axios.put(config.get('server:digitalIdURL'), digitalIdBody)
                    .then(() => {
                      return res.status(204).json();
                    })
                    .catch(putDigitalIdError => {
                      log.error('Failed to update digitalid. Complete pen transaction will be out of sync. StudentId in DigitalId record still needs to be updated.');
                      log.error(putDigitalIdError);
                      log.error(JSON.stringify(putDigitalIdError.response.data));
                      return res.status(500).json();
                    });
                }
              })
              .catch(digitalIdError => {
                log.error('Failed to get digitalid. Complete pen transaction will be out of sync. StudentId in DigitalId record still needs to be updated.');
                log.error(digitalIdError);
                log.error(JSON.stringify(digitalIdError.response.data));
                return res.status(500).json();
              });
          } else {
            log.error('Failed to create student record. Complete pen transaction will be out of sync. Student record still needs to be created.');
            log.error(studentResponse['status']);
            log.error(JSON.stringify(studentResponse['data']));
            return res.status(500).json();
          }
        }
        else {
          log.error('Failed to get student record. Complete pen transaction will be out of sync. Student record still needs to be created.');
          log.error(studentGetResponse.status);
          log.error(JSON.stringify(studentGetResponse.data));
        }

      })
      .catch(error => {
        log.error('An error occurred attempting to complete pen request.  Complete pen transaction may be out of sync.');
        log.error(error);
        log.error(JSON.stringify(error.response.data));
        return res.status(500).json();
      });



  });

module.exports = router;
