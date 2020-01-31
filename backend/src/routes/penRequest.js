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
    var sessID = req.sessionID;
    // eslint-disable-next-line no-console
    var thisSession = JSON.parse(req.sessionStore.sessions[sessID]);
    var userToken = thisSession.passport.user.jwt;
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
        var temp = codeTableResponse.data.find(codeStatus => codeStatus.penRequestStatusCode === element.penRequestStatusCode);
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
      var sessID = req.sessionID;

      // eslint-disable-next-line no-console
      var thisSession = JSON.parse(req.sessionStore.sessions[sessID]);
      var userToken = thisSession.passport.user.jwt;
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
      const userToken = thisSession.passport.user.jwt;
      // eslint-disable-next-line no-console
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      const penRetrievalResponse = await axios.get(config.get("server:penRequestURL") + "/" + req.params.id + '/comments');

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
