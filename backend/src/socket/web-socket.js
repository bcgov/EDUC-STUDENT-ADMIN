'use strict';
const logger = require('../components/logger');
let connectedClients = [];
const webSocket = {

  /**
   *  This method will initialize the express app to accept the authenticated websocket connections.
   * @param app the express app
   * @param server the http server
   */
  init(app, server) {
    require('express-ws')(app, server);
    app.ws('/api/socket', (ws) => {
      logger.debug('Connecting websocket client');

      connectedClients.push(ws);
      let isAlive = true;

      // Send a ping message every 30 seconds
      const pingInterval = setInterval(() => {
        if (!isAlive) {
          logger.debug('Ping test failed, closing client websocket connection');
          cleanupWebSocket(ws, pingInterval);
          return ws.terminate();
        }

        isAlive = false;
        ws.ping();
      }, 30000);

      ws.on('pong', () => {
        // The client responded to the ping message, so it's still alive
        isAlive = true;
      });

      ws.on('close', () => {
        logger.debug('Closing websocket client connection');
        cleanupWebSocket(ws, pingInterval);
      });
    });
  },
  getWebSocketClients() {
    for (let i = connectedClients.length - 1; i >= 0; --i) {
      const connectedClient = connectedClients[i];
      if (connectedClient.readyState !== 1) {
        connectedClients.splice(i, 1);
      }
    }
    return connectedClients; // returns only connected clients.
  }
};

function cleanupWebSocket(ws, interval) {
  clearInterval(interval);
  const index = connectedClients.indexOf(ws);
  if (index !== -1) {
    connectedClients.splice(index, 1); // Remove the WebSocket connection from the array
  }
}

module.exports = webSocket;
