const passport = require('passport');
const config = require('../config/index');
const express = require('express');
const router = express.Router();
const cache = require('memory-cache');
const axios = require('axios');
const auth = require('../components/auth');
const utils = require('../components/utils');
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
router.get('/', passport.authenticate('jwt', {session: false}), auth.isValidAdminToken, cacheMiddleware(),
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

module.exports = router;
