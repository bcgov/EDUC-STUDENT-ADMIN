import {notificationsStore} from '@/store/modules/notifications';

let webSocketsService = {};

webSocketsService.install = function (Vue, options) {
  let ws = null;
  let reconnectInterval = options.reconnectInterval || 1000;

  Vue.config.globalProperties.$webSocketsConnect = () => {
    const token =localStorage.getItem('jwtToken');
    if(!token){
      return;
    }
    if(ws && ws.readyState === WebSocket.OPEN){
      return;
    }
    ws = new WebSocket(options.url);

    ws.onopen = () => {
      // Restart reconnect interval
      reconnectInterval = options.reconnectInterval || 1000;
    };

    ws.onmessage = (event) => {
      // New message from the backend - use JSON.parse(event.data)
      handleNotification(event);
    };

    ws.onclose = (event) => {
      if (event) {
        // Event.code 1000 is our normal close event
        if (event.code !== 1000) {
          let maxReconnectInterval = options.maxReconnectInterval || 3000;
          setTimeout(() => {
            if (reconnectInterval < maxReconnectInterval) {
              // Reconnect interval can't be > x seconds
              reconnectInterval += 1000;
            }
            Vue.config.globalProperties.$webSocketsConnect();
          }, reconnectInterval);
        }
      }
    };

    ws.onerror = (error) => {
      console.log(error);
      ws.close();
    };
  };

  Vue.config.globalProperties.$webSocketsDisconnect = () => {
    // Our custom disconnect event
    ws?.close();
  };

  Vue.config.globalProperties.$webSocketsSend = (data) => {
    // Send data to the backend - use JSON.stringify(data)
    ws.send(JSON.stringify(data));
  };
  /*
    Here we write our custom functions to not make a mess in one function
  */
  function handleNotification (params) {
    const noteStore = notificationsStore();
    noteStore.setNotification(params.data);
  }
};

export default webSocketsService;
