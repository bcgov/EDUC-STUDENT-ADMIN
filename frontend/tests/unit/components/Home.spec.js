import { mount, createLocalVue } from '@vue/test-utils';
import Vuetify from 'vuetify';
import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import appRouter from '@/router';
import Home from '../../../src/components/Home.vue';
import { Routes } from '@/utils/constants.js';


const mockAxios = new MockAdapter(axios);

describe('Archived Request Search Button', () => {
  let wrapper;

  const localVue = createLocalVue();

  Vue.use(Vuetify);
  Vue.use(Vuex);

  const vuetify = new Vuetify();

  mockAxios.onGet(Routes.penRequestBatch.STATS_URL).reply(200, {
    K12: {
      pending: 1,
      fixable: 0,
      repeats: 2,
      unarchived: 3
    },
    PSI: {
      pending: 3,
      fixable: 2,
      repeats: 0,
      unarchived: 1
    }
  });

  let routerSpy;
  let store;

  const testLoadDateAndMincodeInputs = async (loadDate, mincode) => {
    const mincodeInput = wrapper.find('#requestsMincodeField');
    mincodeInput.setValue(mincode);
    const dateInput = wrapper.find('#requestsDateField');
    dateInput.setValue(loadDate);
    await Vue.nextTick();
    wrapper.find('#requestsSearchBtn').trigger('click');
  }

  const mincodeSchoolNames = new Map();
  mincodeSchoolNames.set('10212345', 'School name');
  const districtCodes = new Set();
  districtCodes.add('102');

  beforeEach(() => {
    routerSpy = jest.spyOn(appRouter, 'push').mockImplementation(() => {});



    store = new Vuex.Store({
      modules: {
        auth: {
          namespaced: true,
          state: {
            isValidGMPUser: false,
            isValidUMPUser: false,
            isValidStudentSearchUser: true,
            isValidPenRequestBatchUser: true
          },
          mutations: {
            setIsValidStudentSearchUser (state, isValid) {
              state.isValidStudentSearchUser = isValid;
            },
            setIsValidPenRequestBatchUser (state, isValid) {
              state.isValidPenRequestBatchUser = isValid;
            },
          }
        },
        app: {
          namespaced: true,
          state: {
            mincodeSchoolNames,
            districtCodes
          },
          actions: {
            getCodes() {
            },
          },
        },
      }
    });

    wrapper = mount(Home, {
      sync: false,
      localVue,
      vuetify,
      store,
      router: appRouter,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    wrapper.destroy();
  });

  it('should be clickable when valid mincode input', async () => {
    expect(wrapper.vm.isValidRequestsSearchInput).toBeFalsy();
    const mincodeInput = wrapper.find('#requestsMincodeField');
    mincodeInput.setValue("102");
    await Vue.nextTick();
    wrapper.find('#requestsSearchBtn').trigger('click');
    expect(routerSpy).toHaveBeenCalled();
  });

  it('should be clickable when valid load date input', async () => {
    const dateInput = wrapper.find('#requestsDateField');
    dateInput.setValue("2021/01/10");
    await Vue.nextTick();
    wrapper.find('#requestsSearchBtn').trigger('click');
    expect(routerSpy).toHaveBeenCalled();
  });

  it('should be clickable when valid mincode input and valid load date input', async () => {
    await testLoadDateAndMincodeInputs("2021/01/10", "102");
    expect(routerSpy).toHaveBeenCalled();
  });

  it('should be not clickable when invalid mincode input', async () => {
    const mincodeInput = wrapper.find('#requestsMincodeField');
    mincodeInput.setValue("102123");
    await Vue.nextTick();
    wrapper.find('#requestsSearchBtn').trigger('click');
    expect(routerSpy).not.toHaveBeenCalled();
  });

  it('should be not clickable when invalid load date input', async () => {
    const dateInput = wrapper.find('#requestsDateField');
    dateInput.setValue("2021/1/1");
    await Vue.nextTick();
    wrapper.find('#requestsSearchBtn').trigger('click');
    expect(routerSpy).not.toHaveBeenCalled();
  });

  it('should be not clickable when invalid mincode input and valid load date input', async () => {
    await testLoadDateAndMincodeInputs("2021/01/10", "10");
    expect(routerSpy).not.toHaveBeenCalled();
  });

  it('should be not clickable when valid mincode input and invalid load date input', async () => {
    await testLoadDateAndMincodeInputs("2021/01", "10212345");
    expect(routerSpy).not.toHaveBeenCalled();
  });

  it('should be not clickable when invalid mincode input and invalid load date input', async () => {
    await testLoadDateAndMincodeInputs("2021/01", "102123");
    expect(routerSpy).not.toHaveBeenCalled();
  });

  it('should be not clickable when no inputs', async () => {
    wrapper.find('#requestsSearchBtn').trigger('click');
    expect(routerSpy).not.toHaveBeenCalled();
  });

  it('should not exist when not ValidPenRequestBatchUser', async () => {
    store.commit('auth/setIsValidPenRequestBatchUser', false);
    await Vue.nextTick();
    expect(wrapper.find('#requestsSearchBtn').exists()).toBeFalsy();
  });

  it('should exist when ValidPenRequestBatchUser but not ValidStudentSearchUser', async () => {
    store.commit('auth/setIsValidStudentSearchUser', false);
    await Vue.nextTick();
    expect(wrapper.find('#requestsSearchBtn').exists()).toBeTruthy();
  });
});

