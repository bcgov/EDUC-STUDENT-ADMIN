import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {groupBy} from 'lodash';
import {defineStore} from 'pinia';

export const gmpRequestStore = defineStore('gmpRequest', {
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
  actions: {
    async setSelectedStatuses(selectedStatuses){
      this.selectedStatuses = selectedStatuses;
    },
    async setReturnMacros(macros){
      this.returnMacros = macros;
    },
    async setRejectMacros(macros){
      this.rejectMacros = macros;
    },
    async setCompleteMacros(macros){
      this.completeMacros = macros;
    },
    async setDocumentTypes(docTypes){
      this.documentTypes = docTypes;
    },
    async getMacros() {
      const response = await ApiService.apiAxios.get(Routes.penRequest.MACRO_URL);
      const macros = groupBy(response.data, 'macroTypeCode');
      await this.setReturnMacros(macros.MOREINFO);
      await this.setRejectMacros(macros.REJECT);
      await this.setCompleteMacros(macros.COMPLETE);
    }
  }
});
