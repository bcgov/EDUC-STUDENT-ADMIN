import Vue from 'vue';
import vuetify from './plugins/vuetify';
import App from './App';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app');
