'use strict';

const config = require('../config/index');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const { inspect } = require('util');
const { omit, pickBy } = require('lodash');
const hasAnsi = require('has-ansi');
const stripAnsi = require('strip-ansi');
const safeStringify = require('fast-safe-stringify');


function isPrimitive(val) {
  return val === null || (typeof val !== 'object' && typeof val !== 'function');
}

function formatWithInspect(val, colors = true) {
  if (val instanceof Error) {
    return '';
  }

  const shouldFormat = typeof val !== 'string' && !hasAnsi(val);
  const formattedVal = shouldFormat ? inspect(val, { depth: null, colors }) : (colors ? val : stripAnsi(val));

  return isPrimitive(val) ? formattedVal : `\n${formattedVal}`;
}

/**
 * Handles all the different log formats
 * https://github.com/winstonjs/winston/issues/1427#issuecomment-535297716
 * https://github.com/winstonjs/winston/issues/1427#issuecomment-583199496
 * @param {*} colors 
 */
function getDomainWinstonLoggerFormat(colors = true) {
  const colorize = colors ? format.colorize() : null;
  const loggingFormats = [
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    colorize,
    format.printf((info) => {
      const stackTrace = info.stack ? `\n${info.stack}` : '';

      // handle single object
      if (!info.message) {
        const obj = omit(info, ['level', 'timestamp', Symbol.for('level')]);
        return `${info.timestamp} - ${info.level}: ${formatWithInspect(obj, colors)}${stackTrace}`;
      }

      const splatArgs = info[Symbol.for('splat')] || [];
      const rest = splatArgs.map(data => formatWithInspect(data, colors)).join(' ');
      const msg = formatWithInspect(info.message, colors);

      return `${info.timestamp} - ${info.level}: ${msg} ${rest}${stackTrace}`;
    }),
  ].filter(Boolean);
  return format.combine(...loggingFormats);
}

/**
 * Handles JSON formats
 */
function getDomainWinstonLoggerJsonFormat() {
  const loggingFormats = [
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.printf((info) => {
      const stackTrace = info.stack || '';
      
      let message;
      // handle single object
      if (!info.message) {
        const obj = omit(info, ['level', 'timestamp', Symbol.for('level')]);
        message = obj;
      } else {
        message = stripAnsi(info.message);
      }

      const splatArgs = info[Symbol.for('splat')] || [];
      const detail = splatArgs.map(data => typeof data === 'string' ? stripAnsi(data) : data);

      return safeStringify(pickBy({
        timestamp: info.timestamp,
        level: info.level,
        message,
        detail: detail.length > 0 ? detail : null,
        stackTrace
      }));
    }),
  ];
  return format.combine(...loggingFormats);
}

const logger = createLogger({
  level: config.get('server:logLevel'),
  format: getDomainWinstonLoggerJsonFormat(),
  transports: [
    new transports.DailyRotateFile({ 
      filename: 'app-%DATE%.log',
      dirname: './logs',
      datePattern: 'YYYY-MM-DD',
      maxsize: '200m',
      maxFiles: 1
    })
  ]
});

logger.add(new transports.Console({
  format: getDomainWinstonLoggerFormat(true)
}));

module.exports = logger;
