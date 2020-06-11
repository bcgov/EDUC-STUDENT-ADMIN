import { REQUEST_TYPES } from '../../utils/constants';

export default {
  namespaced: true,
  state: {
    request: {},
    selectedRequest: null,
    messages:[],
    participants:[],
    requestType: REQUEST_TYPES.penRequest.name,
    requestTypeLabel: REQUEST_TYPES.penRequest.label,
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
  },
};
