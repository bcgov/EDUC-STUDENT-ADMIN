import { mount } from '@vue/test-utils';
import Vuetify from 'vuetify';
import Vue from 'vue';
import Footer from '../../../src/components/Footer.vue';

describe('Footer.vue', () => {
  let wrapper;
  
  beforeEach(() => {
  
    Vue.use(Vuetify);
  
    wrapper = mount(Footer, {
      Vue: Vue
    });
  });
  
  it('renders the correct markup', () => {
    expect(wrapper.html()).toContain('<a href="https://www.gov.bc.ca/" class="v-btn v-btn--flat v-btn--text theme--dark v-size--default" id="footer-home"><span class="v-btn__content">Home</span></a>');
  });
});
