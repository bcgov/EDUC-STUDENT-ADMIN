const passport = require('passport');
const config = require('../config/index');
const express = require('express');
const router = express.Router();
const axios = require('axios');
//const auth = require('../components/auth');
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

function getJwt(req,res,next){
  //TODO: add check for null
  var sessID = req.sessionID;
  var thisSession = JSON.parse(req.sessionStore.sessions[sessID]);
  return thisSession.passport.user.jwt;
};

function checkRoles(req, res, next){
  console.log("THERE");
  var userToken = getJwt;
  console.log(userToken);
  if(userToken.realm_access.roles.includes(config.get("oidc:staffRole"))){
    return next();
  }
  return res.status(401).json({
    message: 'Unauthorized user'
  })
};

router.get('/search', passport.authenticate('jwt', {session: false}), checkRoles,
async (req, res) => {
  try{
    var userToken = getJwt;
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
    return res.status(500).json(e);
  }
});

router.get('/status', passport.authenticate('jwt', {session: false}), checkRoles, cacheMiddleware(),
  async (req, res) => {
    try{
      console.log("HERE");
      var userToken = getJwt;
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
      return res.status(500).json(e);
    }
  }
);

module.exports = router;