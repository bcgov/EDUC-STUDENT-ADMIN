import Vue from 'vue';
import vuetify from './plugins/vuetify';
import App from './App';
import router from './router';
import store from './store';
import webSocketService from './services/web-socket-service';
import StaticConfig from './common/staticConfig';
import VueClipboard from 'vue-clipboard2';

VueClipboard.config.autoSetContainer = true; // add this line
Vue.use(VueClipboard);

Vue.config.productionTip = false;
Vue.use(webSocketService, {
  store,
  url: StaticConfig?.WEB_SOCKET_URL || 'wss://'+window.location.hostname+'/api/socket'
});
new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app');
