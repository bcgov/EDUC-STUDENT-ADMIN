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
    DISABLE_SDC_FUNCTIONALITY: frontendConfig.disableSdcFunctionality,
    EDX_URL: frontendConfig.edxURL,
    GRAD_ADMIN_URL: frontendConfig.gradAdminURL,
    DISABLE_ASSESSMENT_FUNCTIONALITY: frontendConfig.disableAssessmentFunctionality,
    DISABLE_GDC_FUNCTIONALITY: frontendConfig.disableGDCFunctionality,
    SLD_MIGRATION_DATE: frontendConfig.sldMigrationDate
  };
  return res.status(HttpStatus.OK).json(frontConfig);
}


module.exports = router;
