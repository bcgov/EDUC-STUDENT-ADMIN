import ApiService from '@/common/apiService';
import {defineStore} from 'pinia';

export const nominalRollStore = defineStore('nominalRoll', {
  namespaced: true,
  state: () => ({
    fedProvSchoolCodes: [],
  }),
  actions: {
    async setFedProvSchoolCodes(payload) {
      this.fedProvSchoolCodes = payload;
    },
    async getCodes() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(this.fedProvSchoolCodes.length === 0) {
          const response = await ApiService.getFedProvSchoolCodes();
          await this.setFedProvSchoolCodes(response.data);
        }
      }
    },
  },
});
