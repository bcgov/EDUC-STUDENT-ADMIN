import { REQUEST_TYPES } from '@/utils/constants';
import ApiService from '@/common/apiService';
import {DateTimeFormatter, LocalDate} from '@js-joda/core';

export default {
  namespaced: true,
  state: {
    request: {},
    selectedRequest: null,
    messages:[],
    participants:[],
    requestType: REQUEST_TYPES.penRequest.name,
    requestTypeLabel: REQUEST_TYPES.penRequest.label,
    pageTitle: null,
    stickyInfoPanelHeight: null,
    schoolApiMincodeSchoolNames: new Map(),
    schoolApiDistrictCodes: new Set(),
    mincodeSchoolNames: new Map(),
    schoolMap: new Map(),
    notClosedSchools: [],
    activeSchools: [],
    activeDistricts: [],
    districtMap : new Map(),
    districtCodes: new Set(),
    independentAuthorityMap: new Map(),
    alertNotificationText: '',
    alertNotificationQueue: [],
    alertNotification: false
  },
  getters: {
    request: state => state.request,
    selectedRequest: state => state.selectedRequest,
    schoolApiDistrictCodesObjectSorted: state => Array.from(state.schoolApiDistrictCodes).sort(),
    schoolApiMincodeSchoolNamesObjectSorted: state => Object.values(Object.fromEntries(state.schoolApiMincodeSchoolNames)).map(v => v.toUpperCase()).sort(),
    districtCodesObjectSorted: state => Array.from(state.districtCodes).sort(),
    mincodeSchoolNamesObjectSorted: state => Object.values(Object.fromEntries(state.mincodeSchoolNames)).map(v => v.toUpperCase()).sort(),
    districtsObjectSorted: state => Object.values(Object.fromEntries(state.districts)).map(v => v.toUpperCase()).sort(),
    messages: state => state.messages,
    participants: state => state.participants,
    requestType: state => state.requestType,
    requestTypeLabel: state => state.requestTypeLabel,
    schoolMap: state => state.schoolMap,
    districtMap: state => state.districtMap,
    notClosedSchools: state => state.notClosedSchools,
    activeSchools: state => state.activeSchools,
    activeDistricts: state => state.activeDistricts,
  },
  mutations: {
    setRequest: (state, request) => {
      state.request = request || {};
    },
    setSelectedRequest: (state, selectedRequest) => {
      state.selectedRequest = selectedRequest;
    },
    pushMessage: (state, message) => {
      state.messages.push(message);
    },
    setMessages: (state, messages) => {
      state.messages = messages || [];
    },
    setParticipants: (state, participants) => {
      state.participants = participants || [];
    },
    setRequestType: (state, requestType) => {
      state.requestType = requestType;
      state.requestTypeLabel = REQUEST_TYPES[requestType].label;
    },
    setPageTitle: (state, pageTitle) => {
      state.pageTitle = pageTitle;
    },
    setStickyInfoPanelHeight: (state, stickyInfoPanelHeight) => {
      state.stickyInfoPanelHeight = stickyInfoPanelHeight;
    },
    setMincodeSchoolNameAndDistrictCodes(state, mincodeSchoolNameList) {
      state.mincodeSchoolNames = new Map();
      state.schoolMap = new Map();
      mincodeSchoolNameList.forEach(element => {
        state.mincodeSchoolNames.set(element.mincode, element.schoolName);
        state.schoolMap.set(element.schoolID, {...element});
        if(isSchoolActive(element)){
          state.notClosedSchools.push(element);
        }else{
          console.log('False: ' + JSON.stringify(element));
        }
        state.districtCodes.add(element.mincode?.substring(0, 3));
      });
    },
    setActiveSchools(state, activeSchools) {
      state.activeSchools = activeSchools;
    },
    setActiveDistricts(state, activeDistricts) {
      state.activeDistricts = activeDistricts;
    },
    setDistricts(state, districtList) {
      state.districtMap = new Map();
      districtList.forEach(element => {
        state.districtMap.set(element.districtId, element);
      });
    },
    setIndependentAuthorities(state, independentAuthorityList) {
      state.independentAuthorityMap = new Map();
      independentAuthorityList.forEach(element => {
        state.independentAuthorityMap.set(element.authorityID, element);
      });
    },
    setAlertNotificationText: (state, alertNotificationText) => {
      state.alertNotificationText = alertNotificationText;
    },
    setAlertNotification: (state, alertNotification) => {
      state.alertNotification = alertNotification;
    },
    addAlertNotification(state, text) {
      state.alertNotificationQueue.push(text);
      if (!state.alertNotification) {
        state.alertNotification = true;
      }
    },
    setSchoolApiMincodeSchoolNameAndDistrictCodes(state, schoolApiMincodeSchoolNameList) {
      state.schoolApiMincodeSchoolNames = new Map();
      schoolApiMincodeSchoolNameList.forEach(element => {
        state.schoolApiMincodeSchoolNames.set(element.mincode, element.schoolName);
        state.schoolApiDistrictCodes.add(element.mincode?.substring(0, 3));
      });
    }
  },
  actions: {
    async getCodes({ commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(state.mincodeSchoolNames.size === 0) {
          const response = await ApiService.getMincodeSchoolNames();
          commit('setMincodeSchoolNameAndDistrictCodes', response.data);
        }
        if (state.activeSchools.length === 0) {
          const response = await ApiService.getActiveSchools();
          commit('setActiveSchools', response.data);
        }
        if(state.districtMap.size === 0) {
          const response = await ApiService.getDistricts();
          commit('setDistricts', response.data);
        }
        if (state.activeDistricts.length === 0) {
          const response = await ApiService.getActiveDistricts();
          commit('setActiveDistricts', response.data);
        }
        if(state.independentAuthorityMap.size === 0) {
          const response = await ApiService.getAuthorities();
          commit('setIndependentAuthorities', response.data);
        }
        if(state.schoolApiMincodeSchoolNames.size === 0) {
          const response = await ApiService.getSchoolApiMincodeSchoolNames();
          commit('setSchoolApiMincodeSchoolNameAndDistrictCodes', response.data);
        }
      }
    },
    async refreshEntities({ commit }) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        const responseMinSchool = await ApiService.getMincodeSchoolNames();
        commit('setMincodeSchoolNameAndDistrictCodes', responseMinSchool.data);

        const responseActiveSchools = await ApiService.getActiveSchools();
        commit('setActiveSchools', responseActiveSchools.data);

        const responseDistricts = await ApiService.getDistricts();
        commit('setDistricts', responseDistricts.data);

        const responseActiveDistricts = await ApiService.getActiveDistricts();
        commit('setActiveDistricts', responseActiveDistricts.data);

        const response = await ApiService.getAuthorities();
        commit('setIndependentAuthorities', response.data);

        const responseSchoolApiMin = await ApiService.getSchoolApiMincodeSchoolNames();
        commit('setSchoolApiMincodeSchoolNameAndDistrictCodes', responseSchoolApiMin.data);
      }
    },
  },
};

function isSchoolActive(school) {
  const currentTime = LocalDate.now();
  const openedDate = school?.openedDate;
  const closedDate = school?.closedDate;
  return school?.schoolName && !!openedDate && (!closedDate || currentTime.isBefore(LocalDate.parse(closedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME)));
}

