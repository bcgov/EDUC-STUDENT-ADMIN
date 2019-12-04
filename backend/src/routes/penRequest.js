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

router.get('/search',
async (req, res) => {
  try{

    const newJwt = await auth.getApiJwt(config.get("oidc:clientId"), config.get("oidc:clientSecret"), config.get("oidc:codetable-read") + " " + config.get("oidc:penrequest-read"));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newJwt.jwt}`;
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

router.get('/status', cacheMiddleware(),
  async (req, res) => {
    try{
      const newJwt = await auth.getApiJwt(config.get("oidc:clientId"), config.get("oidc:clientSecret"), config.get("oidc:codetable-read"));
      axios.defaults.headers.common['Authorization'] = `Bearer ${newJwt.jwt}`;
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