/* eslint-disable quotes */
'use strict';

const HttpStatus = require('http-status-codes');

class ApiError extends Error {
  constructor(status = HttpStatus.INTERNAL_SERVER_ERROR, data, reason, ...params) {
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    // if (Error.captureStackTrace) {
    //   Error.captureStackTrace(this, ApiError);
    // }

    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    if(reason) {
      this.stack += `\nCaused By:\n` + reason.stack;
    }
  }
}

class ServiceError extends Error {
  constructor(errorSource, reason, ...params) {
    super(...params);

    this.name = 'ServiceError';
    this.errorSource = errorSource;

    if(reason) {
      this.stack += `\nCaused By:\n` + reason.stack;
    }
  }
}

class ConflictStateError extends Error {
  constructor(...params) {
    super(...params);

    this.name = 'ConflictStateError';
  }
}

module.exports = {
  ApiError,
  ServiceError,
  ConflictStateError
};
