import { REQUEST_TYPES } from '../../utils/constants';
import ApiService from '@/common/apiService';

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
    mincodeSchoolNames: new Map(),
    schoolMap: new Map(),
    districts : new Map(),
    districtCodes: new Set(),
    alertNotificationText: '',
    alertNotificationQueue: [],
    alertNotification: false
  },
  getters: {
    request: state => state.request,
    selectedRequest: state => state.selectedRequest,
    districtCodesObjectSorted: state => Array.from(state.districtCodes).sort(),
    mincodeSchoolNamesObjectSorted: state => Object.values(Object.fromEntries(state.mincodeSchoolNames)).map(v => v.toUpperCase()).sort(),
    districtsObjectSorted: state => Object.values(Object.fromEntries(state.districts)).map(v => v.toUpperCase()).sort(),
    messages: state => state.messages,
    participants: state => state.participants,
    requestType: state => state.requestType,
    requestTypeLabel: state => state.requestTypeLabel,
    schoolMap: state => state.schoolMap,
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
        state.districtCodes.add(element.mincode?.substring(0, 3));
      });
    },
    setDistricts(state, districtList) {
      state.districts = new Map();
      districtList.forEach(element => {
        state.districts.set(element.districtId, element);
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
    }
  },
  actions: {
    async getCodes({ commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(state.mincodeSchoolNames.size === 0) {
          const response = await ApiService.getMincodeSchoolNames();
          commit('setMincodeSchoolNameAndDistrictCodes', response.data);
        }
        if(state.districts.size === 0) {
          const response = await ApiService.getDistricts();
          commit('setDistricts', response.data);
        }
      }
    },
  },
};
