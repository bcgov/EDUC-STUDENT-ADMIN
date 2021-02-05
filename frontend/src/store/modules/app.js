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
    districtCodes: new Set(),
  },
  getters: {
    request: state => state.request,
    selectedRequest: state => state.selectedRequest,
    messages: state => state.messages,
    participants: state => state.participants,
    requestType: state => state.requestType,
    requestTypeLabel: state => state.requestTypeLabel,
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
      mincodeSchoolNameList.forEach(element => {
        state.mincodeSchoolNames.set(element.mincode, element.schoolName);
        state.districtCodes.add(element.mincode?.substring(0, 3));
      });
    },
  },
  actions: {
    async getCodes({ commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(state.mincodeSchoolNames.size === 0) {
          const response = await ApiService.getMincodeSchoolNames();
          commit('setMincodeSchoolNameAndDistrictCodes', response.data);
        }
      }
    },
  },
};
