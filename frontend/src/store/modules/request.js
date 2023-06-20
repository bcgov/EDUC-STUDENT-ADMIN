import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {groupBy} from 'lodash';
import {defineStore} from 'pinia';

export const requestStore = defineStore('request', {
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
  actions: {
    async setReturnMacros(macros){
      this.returnMacros = macros;
    },
    async setRejectMacros(macros){
      this.rejectMacros = macros;
    },
    async setCompleteMacros(macros){
      this.completeMacros = macros;
    },
    async getMacros(context, requestType) {
      const response = await ApiService.apiAxios.get(Routes[requestType].MACRO_URL);
      const macros = groupBy(response.data, 'macroTypeCode');
      await this.setReturnMacros(macros.MOREINFO);
      await this.setRejectMacros(macros.REJECT);
      await this.setCompleteMacros(macros.COMPLETE);
    }
  }
});
