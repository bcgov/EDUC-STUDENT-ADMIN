'use strict';

const config = require('../config/index');
const express = require('express');
const router = express.Router();
const HttpStatus = require('http-status-codes');

router.get('/', getConfig);

async function getConfig(req, res) {
  const frontendConfig = config.get('frontendConfig');
  const frontConfig = {
    BANNER_ENVIRONMENT: frontendConfig.bannerEnvironment,
    BANNER_COLOR: frontendConfig.bannerColor,
    WEB_SOCKET_URL: frontendConfig.webSocketURL,
    DISABLE_SDC_FUNCTIONALITY: frontendConfig.disableSdcFunctionality
  };
  return res.status(HttpStatus.OK).json(frontConfig);
}


module.exports = router;
