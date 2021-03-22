'use strict';
const redis = require('../util/redis/redis-client');
const redisUtil = require('../util/redis/redis-utils');
const HttpStatus = require('http-status-codes');
const utils = require('../components/utils');
const safeStringify = require('fast-safe-stringify');
const config = require('../config/index');
/**
 *  <b> The main aim here is to restrict multiple actions updating the same student. </b>
 *
 * This middleware will make sure that no two operations involving the same PEN will pass through even though they are at the very same nano second.
 * only one of them will win the race and others will be shown red flag.
 * Next it will check redis to see if an operation involving any of the PEN is in progress, the request which won the previous check will fail here if there is already a record in redis for the student PEN.
 * If there is no record in redis put a record and  move forward.
 * it expects this `penNumbersInOps` as a query param with list of pen numbers that is involved in the operation. <b> its a comma separated string.</b>
 * <b> since it is not possible to run NATS and STAN using port forward , it is difficult to manage this running for local system. turn off the check in local,json</b>
 * @param req express request
 * @param res express response
 * @param next express next
 */
const handleConcurrentStudentModification = async (req, res, next) => {
  if(false === config.get('server:studentAtomicUpdate')){
    return next(); // just move forward, this is useful in local systems.
  }
  const user = utils.getUser(req);
  const redLock = redisUtil.getRedLock();
  try {
    const peNumbersInvolvedInOperation = req.query.penNumbersInOps?.split(',');
    if (!peNumbersInvolvedInOperation || peNumbersInvolvedInOperation.length === 0) {
      res.status(HttpStatus.BAD_REQUEST).json({message: 'pen number or numbers are mandatory for these operation.'});
    }
    const redisMultiGet = redis.getRedisClient().multi();
    for (const pen of peNumbersInvolvedInOperation) {
      await redLock.lock(`locks:atomic-student-update-${pen}`, 1000); // no need to release the lock as it will auto expire after 1000 ms.
      redisMultiGet.get(redisUtil.constructKeyForPenLock(pen));
    }
    try {
      const resultsFromRedis = await redisMultiGet.exec(); // sample  result === [[null, 'OK'], [null, 'bar']]
      const value = resultsFromRedis.find(element => element[1] !== null);
      if (value && value.length>0 && value[1]) { // if it is present , it is always a JSON string.
        return res.status(HttpStatus.CONFLICT).json({message: `User ${JSON.parse(value[1])?.user} is actioning the student. Please wait for this to be completed and try after refreshing the page.`});
      } else {
        const redisMultiSet = redis.getRedisClient().multi();
        const data = {
          user: user?.idir_username
        };
        // the value is in seconds here. if for any reason , it could not be deleted after operation success, the lock will auto expire after 10 minutes.
        peNumbersInvolvedInOperation.forEach(pen => redisMultiSet.set(redisUtil.constructKeyForPenLock(pen), safeStringify(data), 'EX', 600));
        await redisMultiSet.exec();
        next();// all well here lets move forward with the request.
      }
    } catch (e) {
      utils.logError(`acquireLockAndPutStudentDataIntoRedisForConcurrentUpdate failed for ${peNumbersInvolvedInOperation} :: ${user}`, e);
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }

  } catch (e) {
    utils.logError(`acquireLockAndPutStudentDataIntoRedisForConcurrentUpdate failed to acquire lock for :: ${user?.idir_username}`, e);
    res.status(HttpStatus.CONFLICT).json({message: 'multiple users trying to update the same student record in different operation. Please try again later.'});
  }
};

module.exports = {
  handleConcurrentStudentModification
};

