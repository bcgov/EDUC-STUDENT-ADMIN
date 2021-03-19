'use strict';
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
      connectedClients.push(ws);
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
module.exports = webSocket;
