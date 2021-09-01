import ApiService from '../../common/apiService';
import {Routes} from '../../utils/constants';
import {groupBy} from 'lodash';

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
          const macros = groupBy(response.data, 'macroTypeCode');
          context.commit('setReturnMacros', macros.MOREINFO);
          context.commit('setRejectMacros', macros.REJECT);
          context.commit('setCompleteMacros', macros.COMPLETE);
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
};
