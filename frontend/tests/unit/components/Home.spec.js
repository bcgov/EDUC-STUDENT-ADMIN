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

  const testLoadDateAndMincodeInputs = async (mincode) => {
    const mincodeInput = wrapper.find('#requestsMincodeField');
    mincodeInput.setValue(mincode);
    await Vue.nextTick();
    wrapper.find('#requestsSearchBtn').trigger('click');
  };

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
            isValidPenRequestBatchUser: true,
            isValidStaffAdministrationUser: true,
            isValidPenRequestBatchAdmin: true
          },
          getters: {
            ADVANCED_SEARCH_ROLE: state => state.isValidStudentSearchUser,
            VIEW_GMP_REQUESTS_ROLE: state => state.isValidGMPUser,
            VIEW_UMP_REQUESTS_ROLE: state => state.isValidUMPUser,
            VIEW_EDIT_PEN_REQUEST_BATCH_FILES_ROLE: state => state.isValidPenRequestBatchAdmin,
          },
          mutations: {
            setIsValidStudentSearchUser (state, isValid) {
              state.isValidStudentSearchUser = isValid;
            },
            setIsValidPenRequestBatchAdmin (state, isValid) {
              state.isValidPenRequestBatchAdmin = isValid;
            },
            setIsValidStaffAdministrationUser (state, isValid) {
              state.isValidStaffAdministrationUser = isValid;
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
    mincodeInput.setValue('102');
    await Vue.nextTick();
    wrapper.find('#requestsSearchBtn').trigger('click');
    expect(routerSpy).toHaveBeenCalled();
  });

  it('should be clickable when valid mincode input and valid load date input', async () => {
    await testLoadDateAndMincodeInputs( '102');
    expect(routerSpy).toHaveBeenCalled();
  });

  it('should be not clickable when invalid mincode input', async () => {
    const mincodeInput = wrapper.find('#requestsMincodeField');
    mincodeInput.setValue('102123');
    await Vue.nextTick();
    wrapper.find('#requestsSearchBtn').trigger('click');
    expect(routerSpy).not.toHaveBeenCalled();
  });

  it('should be not clickable when no inputs', async () => {
    wrapper.find('#requestsSearchBtn').trigger('click');
    expect(routerSpy).not.toHaveBeenCalled();
  });

  it('should not exist when not ValidPenRequestBatchUser', async () => {
    store.commit('auth/setIsValidPenRequestBatchAdmin', false);
    await Vue.nextTick();
    expect(wrapper.find('#requestsSearchBtn').exists()).toBeFalsy();
  });

  it('should exist when ValidPenRequestBatchUser but not ValidStudentSearchUser', async () => {
    store.commit('auth/setIsValidStudentSearchUser', false);
    await Vue.nextTick();
    expect(wrapper.find('#requestsSearchBtn').exists()).toBeTruthy();
  });
});

