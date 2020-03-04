import '@fortawesome/fontawesome-free/css/all.css';
import '@mdi/font/css/materialdesignicons.css';
import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    light: true,
    dark: false 
  },
  icons: {
    iconfont: 'mdi'
  }
});
