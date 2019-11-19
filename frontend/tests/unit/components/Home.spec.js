import { mount } from '@vue/test-utils';
import Vuetify from 'vuetify';
import Vue from 'vue';
import Vuex from 'vuex';
import Home from '../../../src/components/Home.vue';
import store from '../../../src/store/index';

describe('Home.vue', () => {
  let wrapper;
  
  beforeEach(() => {

    Vue.use(Vuetify);
    Vue.use(Vuex);

    wrapper = mount(Home, {
      Vue,
      store
    });
  });

  it('Check that text body exists', () => {
    expect(wrapper.html()).toContain('<h4 class="gov-header">Who has a PEN?</h4>');
  });
});
