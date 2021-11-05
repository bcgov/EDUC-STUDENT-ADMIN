import ApiService from '@/common/apiService';

export default {
  namespaced: true,
  state: {
    fedProvSchoolCodes: [],
  },
  mutations: {
    setFedProvSchoolCodes(state, payload) {
      state.fedProvSchoolCodes = payload;
    }
  },
  actions: {
    async getCodes({ commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(state.mincodeSchoolNames.size === 0) {
          const response = await ApiService.getFedProvSchoolCodes();
          commit('setFedProvSchoolCodes', response.data);
        }
      }
    },
  },
};
