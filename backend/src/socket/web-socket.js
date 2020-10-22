'use strict';
const jsonwebtoken = require('jsonwebtoken');
const config = require('../config/index');
const log = require('../components/logger');
let connectedClients = [];
const webSocket = {

  /**
   *  This method will initialize the express app to accept the authenticated websocket connections.
   * @param app the express app
   * @param server the http server
   */
  init(app, server) {
    require('express-ws')(app, server);
    const utils = require('../components/utils');
    app.ws('/api/socket', function (ws, req) {
      const jwtToken = utils.getBackendToken(req);
      if (!jwtToken) {
        ws.close();
      } else {
        try {
          const userToken = jsonwebtoken.verify(jwtToken, config.get('oidc:publicKey'));
          if (userToken['realm_access'] && userToken['realm_access'].roles
            && (userToken['realm_access'].roles['includes'](config.get('server:penRequest:roleAdmin'))
              || userToken['realm_access'].roles['includes'](config.get('server:studentRequest:roleAdmin')))) {
            connectedClients.push(ws);
          } else {
            ws.close();
          }
        } catch (e) {
          log.error('error is from verify', e);
          ws.close();
        }
      }
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
