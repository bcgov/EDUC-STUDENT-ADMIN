'use strict';

const config = require('./config/index');
const http = require('http');
const log = require('./components/logger');
const dotenv = require('dotenv');
const localDateTime = require('@js-joda/core').LocalDateTime;
//Add timestamp to log
Object.defineProperty(log, 'heading', { get: () => { return localDateTime.now().toString(); } });
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
WS.init(app,server);

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
    //process.exit(1);
    break;
  case 'EADDRINUSE':
    log.error(bind + ' is already in use');
    //process.exit(1);
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

process.on('SIGINT',() => {
  NATS.close();
  server.close(() => {
    log.info('process terminated');
  });
});
process.on('SIGTERM', () => {
  NATS.close();
  server.close(() => {
    log.info('process terminated');
  });
});
//exports are purely for testing
module.exports = {
  normalizePort,
  onError,
  server
};
