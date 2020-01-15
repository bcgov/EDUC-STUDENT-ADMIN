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
    let key =  '__express__' + req.originalUrl || req.url
    let cacheContent = memCache.get(key);
    if(cacheContent){
      res.send( cacheContent );
      return
    }else{
      res.sendResponse = res.send
      res.send = (body) => {
        memCache.put(key,body);
        res.sendResponse(body)
      }
      next()
    }
  }
}

router.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: [
    '/search',
    '/status'
    ]
  });
});

router.get('/search', passport.authenticate('jwt', {session: false}), auth.isValidAdminToken,
async (req, res) => {
  try{
    var sessID = req.sessionID;
    // eslint-disable-next-line no-console
    var thisSession = JSON.parse(req.sessionStore.sessions[sessID]);
    var userToken = thisSession.passport.user.jwt;
    // eslint-disable-next-line no-console
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;    

    const statusesResponse = await axios.get(config.get("server:penRequestStatus"));
    const penRetreivalResponse = await axios.get(config.get("server:penRequestURL"));
    if(statusesResponse.status !== 200){
      return res.status(statusesResponse.status).json({
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
        var temp = statusesResponse.data.find(codeStatus => codeStatus.penRequestStatusCode === element.penRequestStatusCode);
        if(temp){
          element.penRequestStatusCode = temp;
        }
      }
    });
    return res.status(200).json(penRetreivalResponse.data);
  } catch(e) {
    console.log(e);
    return res.status(500).json(e);
  }
});

router.get('/status', passport.authenticate('jwt', {session: false}), auth.isValidAdminToken, cacheMiddleware(),
  async (req, res) => {
    try{
      var sessID = req.sessionID;

      // eslint-disable-next-line no-console
      var thisSession = JSON.parse(req.sessionStore.sessions[sessID]);
      var userToken = thisSession.passport.user.jwt;
      // eslint-disable-next-line no-console
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      const response = await axios.get(config.get("server:penRequestStatus"));      

      if(response.status !== 200){
        return res.status(response.status).json({
          message: 'API error'
        });
      }
      return res.status(200).json(response.data);
    } catch(e) {
      console.log(e);
      return res.status(500).json(e);
    }
  }
);

module.exports = router;