import { mount } from '@vue/test-utils';
import Vuetify from 'vuetify';
import Vue from 'vue';
import Vuex from 'vuex';
import Login from '../../../src/components/Login.vue';
import auth from '@/store/modules/auth';
import VueRouter from 'vue-router';

describe('Footer.vue', () => {
  let wrapper;
  let store;
  let router;
  
  beforeEach(() => {
    Vue.use(VueRouter);
    Vue.use(Vuetify);
    Vue.use(Vuex);
    
    router = new VueRouter();
    store = new Vuex.Store({
      modules: { auth }
    });

    wrapper = mount(Login, {
      Vue: Vue,
      store,
      router
    });
  });

  test('Login form exists', () => {
    expect(wrapper.html()).toContain('<div class="login-card v-card v-sheet theme--light">');
  });

  test('Ensure clear storage works', () => {
    wrapper.vm.clearStorage();
  });
});

