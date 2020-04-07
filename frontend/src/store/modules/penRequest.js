import ApiService from '../../common/apiService';
import {Routes} from '../../utils/constants';

export default {
  namespaced: true,
  state: {
    selectedRequest: null,
    headerSearchParams: {
      initialSubmitDate: [],
      status: '',
      legalLastName: '',
      legalFirstName: '',
      reviewer: '',
      documentTypes: [],
    },
    headerSortParams: {
      currentSort:'initialSubmitDate',
      currentSortDir: false
    },
    defaultSelected:[],
    messages:[],
    participants:[],
    returnMacros: null,
    rejectMacros: null
  },
  getters: {
    messages: state => state.messages,
    participants: state => state.participants,
    returnMacros: state => state.returnMacros,
    rejectMacros: state => state.rejectMacros
  },
  mutations: {
    pushMessage: (state, message) => {
      state.messages.push(message);
    },
    setMessages: (state, messages) => {
      state.messages = messages || [];
    },
    setParticipants: (state, participants) => {
      state.participants = participants || [];
    },
    setReturnMacros: (state, macros) => {
      state.returnMacros = macros;
    },
    setRejectMacros: (state, macros) => {
      state.rejectMacros = macros;
    }
  },
  actions: {
    getMacros(context) {
      ApiService.apiAxios
        .get(Routes.PEN_REQUEST_MACRO_URL)
        .then(response => {
          context.commit('setReturnMacros', response.data.returnMacros);
          context.commit('setRejectMacros', response.data.rejectMacros);
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
};
