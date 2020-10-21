import {mount, createLocalVue} from '@vue/test-utils';
import Vuetify from 'vuetify';
import Vuex from 'vuex';
import Vue from 'vue';
import InfoDialog from '@/components/penreg/penrequest-batch/prb-student-details/InfoDialog.vue';
import VueRouter from 'vue-router';
import penRequestBatch from '../../../../../../src/store/modules/penRequestBatch';

describe('InfoDialog Component initialized with namespaced Vuex module.', () => {
  let wrapper;

  const localVue = createLocalVue();

  Vue.use(VueRouter);
  Vue.use(Vuetify);
  Vue.use(Vuex);

  const vuetify = new Vuetify();
  document.body.setAttribute('data-app', true);
  const  store = new Vuex.Store({
    modules: {
      penRequestBatch
    }
  });

  beforeEach(() => {
    wrapper = mount(InfoDialog, {
      sync: false,
      localVue,
      vuetify,
      store
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    wrapper.destroy();
  });

  test('It should render the component and button.', () => {
    const titleElement = wrapper.find('#requestInfoBtn > span');
    expect(titleElement.text()).toBe('Request info');
  });

  test('Dialog should be rendered and post button should be disabled.', async () => {
    await wrapper.setData({
      requestInfoDialogOpen: true,
      requestInfoDialogText: null
    });
    const titleElement = wrapper.find('.v-card__title');
    expect(titleElement.text()).toBe('Request Info');

    const postBtnElement = wrapper.find('#requestInfoDialogPostBtn');
    expect(postBtnElement.attributes().disabled).toBe('disabled');
  });

  /*test('Dialog should be should not be rendered and text should be empty once canceled.', async () => {
    await wrapper.setData({
      requestInfoDialogOpen: true,
      requestInfoDialogText: 'Some text.'
    });

    const postBtnElement = wrapper.find('#requestInfoDialogPostBtn');
    expect(postBtnElement.attributes().disabled).toBe(undefined);

    wrapper.vm.closeRequestInfoDialog();
    expect(wrapper.vm.$data.requestInfoDialogText).toBe(null);
    expect(wrapper.vm.$data.requestInfoDialogOpen).toBe(false);
  });*/
});
