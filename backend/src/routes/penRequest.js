const jsonwebtoken = require('jsonwebtoken');

const passport = require('passport');
const config = require('../config/index');
const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../components/auth');
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
        res.sendResponse(body)
      };
      next()
    }
  }
};

router.put('/', passport.authenticate('jwt', {session: false}), auth.isValidAdminToken,
  async (req, res) => {
    try{
      const sessID = req.sessionID;
      // eslint-disable-next-line no-console
      const thisSession = JSON.parse(req.sessionStore.sessions[sessID]);
      const userToken = thisSession.passport.user.jwt;
      // eslint-disable-next-line no-console
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      const penRetrievalResponse = await axios.put(config.get("server:penRequestURL"), req.body);
      if(penRetrievalResponse.status !== 200){
        return res.status(penRetrievalResponse.status).json({
          message: 'API error'
        });
      }
      return res.status(200).json(penRetrievalResponse.data);
    } catch(e) {
      console.log(e);
      return res.status(500);
    }
});

router.get('/', passport.authenticate('jwt', {session: false}), auth.isValidAdminToken,
async (req, res) => {
  try{
    const sessID = req.sessionID;
    // eslint-disable-next-line no-console
    const thisSession = JSON.parse(req.sessionStore.sessions[sessID]);
    const userToken = thisSession.passport.user.jwt;
    // eslint-disable-next-line no-console
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;

    const codeTableResponse = await axios.get(config.get("server:codeTableURL"));
    const penRetreivalResponse = await axios.get(config.get("server:penRequestURL"));
    if(codeTableResponse.status !== 200){
      return res.status(codeTableResponse.status).json({
        message: 'API error'
      });
    }
    else if(penRetreivalResponse.status !== 200){
      return res.status(penRetreivalResponse.status).json({
        message: 'API error'
      });
    }
    penRetreivalResponse.data.forEach(element => {
      if(element.penRequestStatusCode){
        let temp = codeTableResponse.data.find(codeStatus => codeStatus.penRequestStatusCode === element.penRequestStatusCode);
        if(temp){
          element.penRequestStatusCode = temp;
        }
      }
    });
    return res.status(200).json(penRetreivalResponse.data);
  } catch(e) {
    console.log(e);
    return res.status(500);
  }
});

router.get('/statuses', passport.authenticate('jwt', {session: false}), auth.isValidAdminToken, cacheMiddleware(),
  async (req, res) => {
    try{
      const sessID = req.sessionID;

      // eslint-disable-next-line no-console
      const thisSession = JSON.parse(req.sessionStore.sessions[sessID]);
      const userToken = thisSession.passport.user.jwt;
      // eslint-disable-next-line no-console
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      const response = await axios.get(config.get("server:codeTableURL"));

      if(response.status !== 200){
        return res.status(response.status).json({
          message: 'API error'
        });
      }
      return res.status(200).json(response.data);
    } catch(e) {
      console.log(e);
      return res.status(500);
    }
  }
);
router.post('/:id/comments', passport.authenticate('jwt', {session: false}), auth.isValidAdminToken,
  async (req, res) => {
    try{
      const sessID = req.sessionID;
      // eslint-disable-next-line no-console
      const thisSession = JSON.parse(req.sessionStore.sessions[sessID]);
      const userToken = thisSession.passport.user.jwt;
      // eslint-disable-next-line no-console
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      const penRetrievalResponse = await axios.post(config.get("server:penRequestURL") + "/" + req.params.id + '/comments', req.body);

      if(penRetrievalResponse.status !== 200){
        return res.status(penRetrievalResponse.status).json({
          message: 'API error'
        });
      }
      return res.status(200).json(penRetrievalResponse.data);
    } catch(e) {
      console.log(e);
      return res.status(500);
    }
  });

router.get('/:id/comments', passport.authenticate('jwt', {session: false}), auth.isValidAdminToken,
  async (req, res) => {
    try{
      const sessID = req.sessionID;
      // eslint-disable-next-line no-console
      const thisSession = JSON.parse(req.sessionStore.sessions[sessID]);
      const token = thisSession.passport.user.jwt;
      const userToken = jsonwebtoken.verify(thisSession.passport.user.jwt, config.get("oidc:publicKey"));
      // eslint-disable-next-line no-console
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const penRetrievalResponse = await axios.get(config.get("server:penRequestURL") + "/" + req.params.id + '/comments');

      if(penRetrievalResponse.status !== 200){
        return res.status(penRetrievalResponse.status).json({
          message: 'API error'
        });
      }
      let response = {
        participants: [],
        myself: {
          name: userToken.idir_username,
          id: userToken.preferred_username.toUpperCase()
        },
        messages: []
      };
      penRetrievalResponse.data.sort((a,b) => (a.commentTimestamp > b.commentTimestamp) ? 1 : ((b.commentTimestamp > a.commentTimestamp) ? -1 : 0));

      penRetrievalResponse.data.forEach(element => {
        const participant = {
          name: (element.staffMemberName ? element.staffMemberName : 'Student'),
          id: (element.staffMemberIDIRGUID ? element.staffMemberIDIRGUID : '1')
        };
        console.log(participant.id);
        console.log(response.myself.id);
       if (participant.id.toUpperCase() !== response.myself.id.toUpperCase()) {
          const index = response.participants.findIndex((e) => e.id === participant.id);

          if (index === -1) {
            response.participants.push(participant);
          }
        }
       let timestamp = new Date(element.commentTimestamp);
       console.log(element.commentContent);
       console.log(element.commentTimestamp);
       console.log(timestamp);
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
        console.log(response.messages.timestamp);
      });


      return res.status(200).json(response);
    } catch(e) {
      console.log(e);
      return res.status(500);
    }
  });

router.get('/:id', passport.authenticate('jwt', {session: false}), auth.isValidAdminToken,
async (req, res) => {
  try{
    var sessID = req.sessionID;
    // eslint-disable-next-line no-console
    var thisSession = JSON.parse(req.sessionStore.sessions[sessID]);
    var userToken = thisSession.passport.user.jwt;
    // eslint-disable-next-line no-console
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    const penRetreivalResponse = await axios.get(config.get("server:penRequestURL") + "/" + req.params.id);

    if(penRetreivalResponse.status !== 200){
      return res.status(penRetreivalResponse.status).json({
        message: 'API error'
      });
    }
    return res.status(200).json(penRetreivalResponse.data);
  } catch(e) {
    console.log(e);
    return res.status(500);
  }
});

module.exports = router;
