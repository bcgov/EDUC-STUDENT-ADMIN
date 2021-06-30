import { shallowMount } from '@vue/test-utils';
import Vuetify from 'vuetify';
import VueRouter from 'vue-router';
import App from '@/App.vue';
import Vuex from 'vuex';
import Vue from 'vue';
import auth from '@/store/modules/auth.js';
import app from '@/store/modules/app.js';
import webSocketService from '@/services/web-socket-service';
jest.mock('../../../src/common/staticConfig', () => {
  return {
    VUE_APP_BCEID_REG_URL : 'https://www.test.bceid.ca/os/?7081&SkipTo=Basic#action' ,
    VUE_APP_JOURNEY_BUILDER : 'https://www2.qa.gov.bc.ca/gov/content/education-training/k-12/support/pen' ,
    VUE_APP_IDLE_TIMEOUT_IN_MILLIS : '3600000',
    WEB_SOCKET_URL:'ws://localhost:8080/api/socket',
    BANNER_ENVIRONMENT:'DEV',
    BANNER_COLOR:'#8d28d7'
  };
});

describe('App.vue', () => {
  let wrapper;
  //let getters;
  let store;
  let vuet;

  beforeEach(() => {
    Vue.use(Vuetify);
    Vue.use(Vuex);
    Vue.use(VueRouter);

    store = new Vuex.Store({
      modules: { auth, app }
    });
    vuet = new Vuetify({
      icons: {
        iconfont: 'md',
      }
    });
    Vue.use(webSocketService, {store, url: 'ws://localhost:8080/api/socket'});

    const router = new VueRouter();
    wrapper = shallowMount(App, {
      Vue,
      vuet,
      store,
      router
    });
  });

  test('app exists', () => {
    expect(wrapper).toBeTruthy();
  });
});
