import { mount, createLocalVue } from '@vue/test-utils';
import Vuetify from 'vuetify';
import Vuex from 'vuex';
import Vue from 'vue';
jest.mock('@/router');
import appRouter from '@/router';
import SetNavigation from '@/components/util/SetNavigation.vue';
import VueRouter from 'vue-router';
import setNavigation from '@/store/modules/setNavigation';

describe('SetNavigation Component initialized with namespaced Vuex module.', () => {
  let wrapper;

  const localVue = createLocalVue();

  Vue.use(VueRouter);
  Vue.use(Vuetify);
  Vue.use(Vuex);

  const router = new VueRouter();
  const vuetify = new Vuetify();

  const  store = new Vuex.Store({
    modules: {
      setNavigation
    }
  });

  beforeEach(() => {
    wrapper = mount(SetNavigation, {
      sync: false,
      localVue,
      vuetify,
      store,
      router,
      propsData: {
        stateful: false
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    wrapper.destroy();
  });

  const initializeStore = async (selectetedIDs, currentRequest) => {
    store.commit('setNavigation/setSelectedIDs', selectetedIDs);
    store.commit('setNavigation/setCurrentRequest', currentRequest);
  };

  test('It should render the component and display title.', async () => {
    await initializeStore([{'penRequestBatchStudentID':'1b63','penRequestBatchID':'7809'},{'penRequestBatchStudentID':'79ea','penRequestBatchID':'166a'}], 1);
    await Vue.nextTick();
    expect(wrapper.html()).toContain('Record 2 of 2 (2 files selected)');
  });

  test('It should not display title.', async () => {
    await initializeStore({}, 0);
    await Vue.nextTick();
    expect(wrapper.html()).toBeUndefined();
  });

  test('Its previous button should not be clickable when seqNumber is 1.', async () => {
    await initializeStore([{'penRequestBatchStudentID':'1b63','penRequestBatchID':'7809'},{'penRequestBatchStudentID':'79ea','penRequestBatchID':'166a'}], 0);
    await Vue.nextTick();
    const button = wrapper.find('#preRecord');
    const spy = jest.spyOn(appRouter, 'push');
    button.trigger('click');
    expect(spy).toHaveBeenCalledTimes(0);
  });

  test('Its next button should be clickable when seqNumber is 1 and seqNumber is less than totalNumber.', async () => {
    await initializeStore([{'penRequestBatchStudentID':'1b63','penRequestBatchID':'7809'},{'penRequestBatchStudentID':'79ea','penRequestBatchID':'166a'}], 0);
    await Vue.nextTick();
    const button = wrapper.find('#nextRecord');
    const spy = jest.spyOn(appRouter, 'push');
    button.trigger('click');
    expect(spy).toBeCalledWith({'name': 'prbStudentDetails', 'params': {'prbStudentID': '79ea'}, 'query': {'archived': false}});
  });

  test('Its next button should not be clickable when seqNumber is equal to totalNumber.', async () => {
    await initializeStore([{'penRequestBatchStudentID':'1b63','penRequestBatchID':'7809'},{'penRequestBatchStudentID':'79ea','penRequestBatchID':'166a'}], 1);
    await Vue.nextTick();
    const button = wrapper.find('#nextRecord');
    const spy = jest.spyOn(appRouter, 'push');
    button.trigger('click');
    expect(spy).toHaveBeenCalledTimes(0);
  });

  test('It previous button should be clickable when seqNumber is larger than 1 and equal to totalNumber.', async () => {
    await initializeStore([{'penRequestBatchStudentID':'1b63','penRequestBatchID':'7809'},{'penRequestBatchStudentID':'79ea','penRequestBatchID':'166a'}], 1);
    await Vue.nextTick();
    const button = wrapper.find('#preRecord');
    const spy = jest.spyOn(appRouter, 'push');
    button.trigger('click');
    expect(spy).toBeCalledWith({'name': 'prbStudentDetails', 'params': {'prbStudentID': '1b63'}, 'query': {'archived': false}});
  });

  test('Current route should be set in the store when click on the button.', async () => {
    await initializeStore([{'penRequestBatchStudentID':'1b63','penRequestBatchID':'7809'},{'penRequestBatchStudentID':'79ea','penRequestBatchID':'166a'}], 0);
    await Vue.nextTick();
    const button = wrapper.find('#nextRecord');
    button.trigger('click');
    expect(store.state.setNavigation.currentRequest).toBe(1);
  });
});

