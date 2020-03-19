const passport = require('passport');
const express = require('express');
const router = express.Router();
const cache = require('memory-cache');
const auth = require('../components/auth');
const { getPenRequestStatusCodes } = require('../components/penRequests');

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
router.get('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, cacheMiddleware(), getPenRequestStatusCodes);

module.exports = router;
