import ApiService from '../../common/apiService';
import {Routes} from '../../utils/constants';

export default {
  namespaced: true,
  state: {
    selectedRequest: null,
    pageSize: 15,
    pageNumber: 1,
    headerSearchParams: {
      initialSubmitDate: [],
      penRequestStatusCode: '',
      legalLastName: '',
      legalFirstName: '',
      reviewer: ''
    },
    headerSortParams: {
      currentSort:'initialSubmitDate',
      currentSortDir: false
    },
    selectedStatuses:['First Review', 'Subsequent Review'],
    messages:[],
    participants:[],
    returnMacros: null,
    rejectMacros: null,
    completeMacros: null,
    documentTypes: [],
  },
  getters: {
    messages: state => state.messages,
    participants: state => state.participants,
    returnMacros: state => state.returnMacros,
    rejectMacros: state => state.rejectMacros,
    completeMacros: state => state.completeMacros
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
    },
    setCompleteMacros: (state, macros) => {
      state.completeMacros = macros;
    }
  },
  actions: {
    getMacros(context) {
      ApiService.apiAxios
        .get(Routes.PEN_REQUEST_MACRO_URL)
        .then(response => {
          context.commit('setReturnMacros', response.data.returnMacros);
          context.commit('setRejectMacros', response.data.rejectMacros);
          context.commit('setCompleteMacros', response.data.completeMacros);
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
};
