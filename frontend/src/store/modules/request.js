import ApiService from '../../common/apiService';
import {Routes} from '../../utils/constants';

export default {
  namespaced: true,
  state: () => ({
    pageSize: 15,
    pageNumber: 1,
    headerSearchParams: {
      initialSubmitDate: [],
      requestStatusCode: '',
      legalLastName: '',
      legalFirstName: '',
      reviewer: ''
    },
    headerSortParams: {
      currentSort:'initialSubmitDate',
      currentSortDir: false
    },
    selectedStatuses:['First Review', 'Subsequent Review'],
    returnMacros: null,
    rejectMacros: null,
    completeMacros: null,
    documentTypes: [],
  }),
  getters: {
    returnMacros: state => state.returnMacros,
    rejectMacros: state => state.rejectMacros,
    completeMacros: state => state.completeMacros
  },
  mutations: {
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
    getMacros(context, requestType) {
      ApiService.apiAxios
        .get(Routes[requestType].MACRO_URL)
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
