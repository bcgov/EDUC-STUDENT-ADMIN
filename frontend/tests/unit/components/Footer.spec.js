import { shallowMount } from '@vue/test-utils';
import Vuetify from 'vuetify';
import Vue from 'vue';
import Footer from '../../../src/components/Footer.vue';

describe('Footer.vue', () => {
  let wrapper;
  
  beforeEach(() => {
  
    Vue.use(Vuetify);
  
    wrapper = shallowMount(Footer, {
      Vue: Vue
    });
  });
  
  it('renders the correct markup', () => {
    expect(wrapper.html()).toContain('Home');
  });
});
