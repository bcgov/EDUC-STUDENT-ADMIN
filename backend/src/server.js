'use strict';

const config = require('./config/index');
const http = require('http');
const log = require('./components/logger');
const dotenv = require('dotenv');
const localDateTime = require('@js-joda/core').LocalDateTime;
//Add timestamp to log
Object.defineProperty(log, 'heading', {
  get: () => {
    return localDateTime.now().toString();
  }
});
dotenv.config();
log.info('Starting student-admin node app');
const app = require('./app');

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(config.get('server:port'));
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);
const WS = require('./socket/web-socket');
const NATS = require('./messaging/message-pub-sub');
const cacheService = require('./components/cache-service');
const schoolApiCacheServicce = require('./components/school-api-cache-service');
const constants = require('./util/constants');

cacheService.loadAllSchoolsToMap().then(() => {
  log.info('Loaded school data to memory');
}).catch((e) => {
  log.error('Error loading schools during boot .', e);
});
cacheService.loadAllDistrictsToMap().then(() => {
  log.info('Loaded districts data to memory');
}).catch((e) => {
  log.error('Error loading districts data codes during boot .', e);
});
cacheService.loadDataToCache( constants.CACHE_KEYS.DISTRICT_CONTACT_TYPE_CODES, 'server:institute:districtContactTypesURL').then(() => {
  log.info('Loaded DISTRICT_CONTACT_TYPE_CODES data to memory');
}).catch((e) => {
  log.error('Error loading DISTRICT_CONTACT_TYPE_CODES data during boot .', e);
});
cacheService.loadDataToCache( constants.CACHE_KEYS.FACILITY_TYPES, 'server:institute:facilityTypeURL').then(() => {
  log.info('Loaded FACILITY_TYPES data to memory');
}).catch((e) => {
  log.error('Error loading FACILITY_TYPES data during boot .', e);
});
cacheService.loadDataToCache( constants.CACHE_KEYS.SCHOOL_CATEGORY_TYPES, 'server:institute:categoryCodesURL').then(() => {
  log.info('Loaded SCHOOL_CATEGORY_TYPES data to memory');
}).catch((e) => {
  log.error('Error loading SCHOOL_CATEGORY_TYPES data during boot .', e);
});
cacheService.loadDataToCache( constants.CACHE_KEYS.SCHOOL_ORGANIZATION_TYPES, 'server:institute:organizationCodeURL').then(() => {
  log.info('Loaded SCHOOL_ORGANIZATION_TYPES data to memory');
}).catch((e) => {
  log.error('Error loading SCHOOL_ORGANIZATION_TYPES data during boot .', e);
});

cacheService.loadDataToCache(
  constants.CACHE_KEYS.SCHOOL_REPORTING_REQUIREMENT_CODES,
  'server:institute:reportingRequirementCodesURL'
).then(() => {
  log.info('Loaded SCHOOL_REPORTING_REQUIREMENT_CODES data to memory');
}).catch((e) => {
  log.error('Error loading SCHOOL_REPORTING_REQUIREMENT_CODES data during boot .', e);
});

cacheService.loadDataToCache( constants.CACHE_KEYS.SCHOOL_NEIGHBOURHOOD_LEARNING_TYPES, 'server:institute:neighbourhoodLearningURL').then(() => {
  log.info('Loaded SCHOOL_NEIGHBOURHOOD_LEARNING_TYPES data to memory');
}).catch((e) => {
  log.error('Error loading SCHOOL_NEIGHBOURHOOD_LEARNING_TYPES data during boot .', e);
});
cacheService.loadDataToCache( constants.CACHE_KEYS.AUTHORITY_TYPES, 'server:institute:authorityTypeCodesURL').then(() => {
  log.info('Loaded AUTHORITY_TYPES data to memory');
}).catch((e) => {
  log.error('Error loading AUTHORITY_TYPES data during boot .', e);
});
cacheService.loadDataToCache( constants.CACHE_KEYS.GRADE_CODES, 'server:institute:gradeCodeURL').then(() => {
  log.info('Loaded GRADE_CODES data to memory');
}).catch((e) => {
  log.error('Error loading GRADE_CODES data during boot .', e);
});
cacheService.loadDataToCache( constants.CACHE_KEYS.PROVINCE_CODES, 'server:institute:provinceCodesURL').then(() => {
  log.info('Loaded PROVINCE_CODES data to memory');
}).catch((e) => {
  log.error('Error loading PROVINCE_CODES data during boot .', e);
});
cacheService.loadDataToCache( constants.CACHE_KEYS.COUNTRY_CODES, 'server:institute:countryCodesURL').then(() => {
  log.info('Loaded COUNTRY_CODES data to memory');
}).catch((e) => {
  log.error('Error loading COUNTRY_CODES data during boot .', e);
});
cacheService.loadDataToCache( constants.CACHE_KEYS.SCHOOL_CONTACT_TYPES, 'server:institute:schoolContactTypeCodesURL').then(() => {
  log.info('Loaded SCHOOL_CONTACT_TYPES data to memory');
}).catch((e) => {
  log.error('Error loading SCHOOL_CONTACT_TYPES data during boot .', e);
});
cacheService.loadDataToCache( constants.CACHE_KEYS.AUTHORITY_CONTACT_TYPES, 'server:institute:authorityContactTypeCodesURL').then(() => {
  log.info('Loaded AUTHORITY_CONTACT_TYPES data to memory');
}).catch((e) => {
  log.error('Error loading AUTHORITY_CONTACT_TYPES data during boot .', e);
});

cacheService.loadAllAuthoritiesToMap().then(() => {
  log.info('Loaded authorities data to memory');
}).catch((e) => {
  log.error('Error loading authorities data codes during boot .', e);
});
cacheService.loadAllDocumentTypeCodesToMap().then(() => {
  log.info('Loaded document type codes to memory');
}).catch((e) => {
  log.error('Error loading document type codes during boot .', e);
});
schoolApiCacheServicce.loadAllSchoolsToMap().then(() => {
  log.info('Loaded school data to memory school-api-cache');
}).catch((e) => {
  log.error('Error loading schools during boot school-api-cache .', e);
});
WS.init(app, server);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const portNumber = parseInt(val, 10);

  if (isNaN(portNumber)) {
    // named pipe
    return val;
  }

  if (portNumber >= 0) {
    // port number
    return portNumber;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
  case 'EACCES':
    log.error(bind + ' requires elevated privileges');
    break;
  case 'EADDRINUSE':
    log.error(bind + ' is already in use');
    break;
  default:
    throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ?
    'pipe ' + addr :
    'port ' + addr.port;
  log.info('Listening on ' + bind);
}

process.on('SIGINT', () => {
  NATS.close();
  server.close(() => {
    log.info('process terminated');
    process.exit(0);
  });
});
process.on('SIGTERM', () => {
  NATS.close();
  server.close(() => {
    log.info('process terminated');
    process.exit(0);
  });
});
//exports are purely for testing
module.exports = {
  normalizePort,
  onError,
  server
};
