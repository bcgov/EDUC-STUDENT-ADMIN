'use strict';

const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const jsonwebtoken = require('jsonwebtoken');
const log = require('./logger');
const perm = require('../util/Permission');
const cacheService = require('./cache-service');
const _ = require('lodash');

function getBackendToken(req) {
    const thisSession = req.session;
    return thisSession['passport']?.user?.jwt;
}

function checkUserHasPermission(permission) {
    return function(req, res, next) {
      try {
        const jwtToken = getBackendToken(req);
        if (!jwtToken) {
          return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Unauthorized user'
          });
        }
        let userToken;
        try {
          userToken = jsonwebtoken.verify(jwtToken, config.get('oidc:publicKey'));
        } catch (e) {
          log.debug('error is from verify', e);
          return res.status(HttpStatus.UNAUTHORIZED).json();
        }
        if (userToken['realm_access']?.roles && userToken['realm_access'].roles.includes(permission)) {
          return next();
        }
        return res.status(HttpStatus.FORBIDDEN).json({
          message: 'User is missing role'
        });
      } catch (e) {
        log.error(e);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json();
      }
    }
  }
  
  function hasPermissionToUpdateAuthority() {
    return function(req, res, next) {
      try {
        const jwtToken = getBackendToken(req);
        if (!jwtToken) {
          return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Unauthorized user'
          });
        }
        let userToken;
        try {
          userToken = jsonwebtoken.verify(jwtToken, config.get('oidc:publicKey'));
        } catch (e) {
          log.debug('error is from verify', e);
          return res.status(HttpStatus.UNAUTHORIZED).json();
        }
  
        let authority = cacheService.getAuthorityJSONByAuthorityId(_.isEmpty(req.body)? req.params.independentAuthorityId : (req.body.independentAuthorityId || req.body.authorityID));
        
        if(!authority){
          return res.status(HttpStatus.NOT_FOUND).json({
            message: 'Authority not found'
          });
        }
        let hasIndependentPerm = authority?.authorityTypeCode === 'INDEPENDNT' && userToken['realm_access'].roles.includes(perm.PERMISSION.EDIT_INDEPENDENT_AUTHORITY_PERMISSION);
        let hasOffshorePerm = authority?.authorityTypeCode === 'OFFSHORE' && userToken['realm_access'].roles.includes(perm.PERMISSION.EDIT_OFFSHORE_AUTHORITY_PERMISSION);
        
        if(hasIndependentPerm || hasOffshorePerm) {
          return next();
        } 
        return res.status(HttpStatus.FORBIDDEN).json({
          message: 'User is missing role'
        });
      } catch (e) {
        log.error(e);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json();
      }
    }
  }

  function hasPermissionToAddAuthority() {
    return function(req, res, next) {
      try {
        const jwtToken = getBackendToken(req);
        if (!jwtToken) {
          return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Unauthorized user'
          });
        }
        let userToken;
        try {
          userToken = jsonwebtoken.verify(jwtToken, config.get('oidc:publicKey'));
        } catch (e) {
          log.debug('error is from verify', e);
          return res.status(HttpStatus.UNAUTHORIZED).json();
        }
  
        let authority = req.body;
        let hasIndependentPerm = authority?.authorityTypeCode === 'INDEPENDNT' && userToken['realm_access'].roles.includes(perm.PERMISSION.EDIT_INDEPENDENT_AUTHORITY_PERMISSION);
        let hasOffshorePerm = authority?.authorityTypeCode === 'OFFSHORE' && userToken['realm_access'].roles.includes(perm.PERMISSION.EDIT_OFFSHORE_AUTHORITY_PERMISSION);
        
        if(hasIndependentPerm || hasOffshorePerm) {
          return next();
        } 
        return res.status(HttpStatus.FORBIDDEN).json({
          message: 'User is missing role'
        });
      } catch (e) {
        log.error(e);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json();
      }
    }
  }
  
  function hasPermissionToAddOrUpdateSchool() {
    return function(req, res, next) {
      try {
        const jwtToken = getBackendToken(req);
        if (!jwtToken) {
          return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Unauthorized user'
          });
        }
        let userToken;
        try {
          userToken = jsonwebtoken.verify(jwtToken, config.get('oidc:publicKey'));
        } catch (e) {
          log.debug('error is from verify', e);
          return res.status(HttpStatus.UNAUTHORIZED).json();
        }
  
        let school = cacheService.getSchoolBySchoolID(_.isEmpty(req.body)? req.params.schoolId : (req.body.schoolId || req.body.schoolID));

        if (!school) {
          return res.status(HttpStatus.NOT_FOUND).json({
            message: 'School not found'
          });
        }
        let independentArr = ['INDEPEND', 'INDP_FNS'];
        let offshoreArr = ['OFFSHORE']
  
        let hasIndependentPerm = independentArr.includes(school?.schoolCategoryCode) && userToken['realm_access'].roles.includes(perm.PERMISSION.EDIT_INDEPENDENT_SCHOOL_PERMISSION);
        let hasOffshorePerm = offshoreArr.includes(school?.schoolCategoryCode) && userToken['realm_access'].roles.includes(perm.PERMISSION.EDIT_OFFSHORE_SCHOOL_PERMISSION);
        let hasEditSchoolPerm = ![...independentArr, ...offshoreArr].includes(school?.schoolCategoryCode) && userToken['realm_access'].roles.includes(perm.PERMISSION.EDIT_SCHOOL_PERMISSION)
  
        if(hasIndependentPerm || hasOffshorePerm || hasEditSchoolPerm) {
          return next();
        } 
        return res.status(HttpStatus.FORBIDDEN).json({
          message: 'User is missing role'
        });
      } catch (e) {
        log.error(e);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json();
      }
    }
  }

  function hasPermissionToAddSchool() {
    return function(req, res, next) {
      try {
        const jwtToken = getBackendToken(req);
        if (!jwtToken) {
          return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Unauthorized user'
          });
        }
        let userToken;
        try {
          userToken = jsonwebtoken.verify(jwtToken, config.get('oidc:publicKey'));
        } catch (e) {
          log.debug('error is from verify', e);
          return res.status(HttpStatus.UNAUTHORIZED).json();
        }

        let school = req?.body;
        let independentArr = ['INDEPEND', 'INDP_FNS'];
        let offshoreArr = ['OFFSHORE']
  
        let hasIndependentPerm = independentArr.includes(school?.schoolCategoryCode) && userToken['realm_access'].roles.includes(perm.PERMISSION.EDIT_INDEPENDENT_SCHOOL_PERMISSION);
        let hasOffshorePerm = offshoreArr.includes(school?.schoolCategoryCode) && userToken['realm_access'].roles.includes(perm.PERMISSION.EDIT_OFFSHORE_SCHOOL_PERMISSION);
        let hasEditSchoolPerm = ![...independentArr, ...offshoreArr].includes(school?.schoolCategoryCode) && userToken['realm_access'].roles.includes(perm.PERMISSION.EDIT_SCHOOL_PERMISSION)
  
        if(hasIndependentPerm || hasOffshorePerm || hasEditSchoolPerm) {
          return next();
        } 
        return res.status(HttpStatus.FORBIDDEN).json({
          message: 'User is missing role'
        });
      } catch (e) {
        log.error(e);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json();
      }
    }
  }
  
  function hasPermissionToAddOrUpdateFundingData() {
    return function(req, res, next) {
      try {
        const jwtToken = getBackendToken(req);
        if (!jwtToken) {
          return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Unauthorized user'
          });
        }
        let userToken;
        try {
          userToken = jsonwebtoken.verify(jwtToken, config.get('oidc:publicKey'));
        } catch (e) {
          log.debug('error is from verify', e);
          return res.status(HttpStatus.UNAUTHORIZED).json();
        }
  
        let school = cacheService.getSchoolBySchoolID(_.isEmpty(req.body)? (req.params.schoolId || req.params.schoolID) : (req.body.schoolId || req.body.schoolID));
        let independentArr = ['INDEPEND', 'INDP_FNS'];
  
        if(independentArr.includes(school?.schoolCategoryCode) && userToken['realm_access'].roles.includes(perm.PERMISSION.EDIT_INDEPENDENT_SCHOOL_PERMISSION)) {
          return next();
        }
        return res.status(HttpStatus.FORBIDDEN).json({
          message: 'User is missing role'
        });
      } catch (e) {
        log.error(e);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json();
      }
    }
  }

  function hasPermissionToGetStudentByPEN(isValidUiTokenWithSimpleSearchRoles) {
    return function(req, res, next) {
      try {
        const jwtToken = getBackendToken(req);
        if (!jwtToken) {
          return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Unauthorized user'
          });
        }
        let userToken;
        try {
          userToken = jsonwebtoken.verify(jwtToken, config.get('oidc:publicKey'));
        } catch (e) {
          log.debug('error is from verify', e);
          return res.status(HttpStatus.UNAUTHORIZED).json();
        }
    
        if(isValidUiTokenWithSimpleSearchRoles || userToken['realm_access'].roles.includes(perm.PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION)) {
          return next();
        }
        return res.status(HttpStatus.FORBIDDEN).json({
          message: 'User is missing role'
        });
      } catch (e) {
        log.error(e);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json();
      }
    }
  }

  function hasPermissionToGetMacros(hasMacroRoles) {
    return function(req, res, next) {
      try {
        const jwtToken = getBackendToken(req);
        if (!jwtToken) {
          return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Unauthorized user'
          });
        }
        let userToken;
        try {
          userToken = jsonwebtoken.verify(jwtToken, config.get('oidc:publicKey'));
        } catch (e) {
          log.debug('error is from verify', e);
          return res.status(HttpStatus.UNAUTHORIZED).json();
        }
    
        if(hasMacroRoles || userToken['realm_access'].roles.includes(perm.PERMISSION.MANAGE_EXCHANGE_INBOX_PERMISSION)) {
          return next();
        }
        return res.status(HttpStatus.FORBIDDEN).json({
          message: 'User is missing role'
        });
      } catch (e) {
        log.error(e);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json();
      }
    }
  }
  
  function isAuthorized(req) {
    try {
      const thisSession = req['session'];
      if (thisSession['passport']?.user?.jwt) {
        const userToken = jsonwebtoken.verify(thisSession['passport'].user.jwt, config.get('oidc:publicKey'));
        const allowedPermissions = Object.values(perm.PERMISSION);
        if (userToken?.realm_access?.roles.some(role => allowedPermissions.includes(role))) {
          return true;
        }
      }
      return false;
    } catch (e) {
      log.error(e);
      return false;
    }
  }


  const permUtils = {
    checkUserHasPermission,
    hasPermissionToUpdateAuthority,
    hasPermissionToAddSchool,
    hasPermissionToAddOrUpdateSchool,
    hasPermissionToAddOrUpdateFundingData,
    hasPermissionToAddAuthority,
    hasPermissionToGetStudentByPEN,
    hasPermissionToGetMacros,
    isAuthorized
  }

  module.exports = permUtils;