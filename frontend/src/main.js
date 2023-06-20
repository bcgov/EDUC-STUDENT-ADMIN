import { createApp } from 'vue';
import { createVuetify } from 'vuetify/dist/vuetify';
import { createMetaManager } from 'vue-meta';
import App from '@/App.vue';
import router from '@/router';
import 'regenerator-runtime/runtime';
import {createPinia} from 'pinia';
import moment from 'moment';
import * as colors from 'vuetify/lib/util/colors';
import styles from 'vuetify/styles';
import * as labs from 'vuetify/labs/components';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';
import 'viewerjs/dist/viewer.css';
import component from 'v-viewer';
import webSocketService from './services/web-socket-service';
import StaticConfig from './common/staticConfig';
import VueClipboard from 'vue-clipboard2';

const myCustomLightTheme = {
  dark: false,
  colors: {
    primary: '#003366'
  }
};

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi'
  },
  theme: {
    defaultTheme: 'myCustomLightTheme',
    themes: {
      myCustomLightTheme,
    }
  },
  components: {
    ...labs,
    ...components,
    ...directives,
    ...styles,
    ...colors
  },
});
const pinia = createPinia();

const newApp = createApp(App);
VueClipboard.config.autoSetContainer = true; // add this line

newApp.provide('$moment', moment);
newApp.use(router).use(webSocketService, {
  store,
  url: StaticConfig?.WEB_SOCKET_URL || 'wss://'+window.location.hostname+'/api/socket'
}).use(VueClipboard).use(createMetaManager()).use(pinia).use(vuetify).use(component).mount('#app');

