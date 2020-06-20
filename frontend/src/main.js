import Vue from 'vue';
import vuetify from './plugins/vuetify';
import App from './App';
import router from './router';
import store from './store';
import IdleVue from 'idle-vue';
import webSocketService from './services/web-socket-service'
Vue.config.productionTip = false;
Vue.use(webSocketService, {
  store,
  url: 'wss://'+window.location.hostname+'/api/socket'
})
const eventsHub = new Vue();
Vue.use(IdleVue, {
  eventEmitter: eventsHub,
  store,
  idleTime: 1800000, // 30 minutes
  startAtIdle: false
});
new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app');
