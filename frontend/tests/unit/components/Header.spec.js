import { shallowMount } from '@vue/test-utils';
import Vuetify from 'vuetify';
import Vuex from 'vuex';
import Vue from 'vue';
import Header from '@/components/Header.vue';
import auth from '@/store/modules/auth.js';

describe('Header.vue', () => {
  let wrapper;
  let store;

  beforeEach(() => {
    Vue.use(Vuetify);
    Vue.use(Vuex);

    store = new Vuex.Store({
      modules: { auth }
    });

    wrapper = shallowMount(Header, {
      Vue: Vue,
      store
    });
  });

  test('expect site title', () => {
    expect(wrapper.html()).toContain('<v-toolbar-title-stub><h3 style="color: white;">OSPR');
  });

  test('logout of site', () => {
    wrapper.vm.clearStorage();
  });
});
