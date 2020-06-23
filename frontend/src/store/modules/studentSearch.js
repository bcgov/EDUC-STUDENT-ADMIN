import ApiService from '../../common/apiService';

export default {
  namespaced: true,
  state: {
    genders: null
  },
  getters: {
    genders: state => state.genders,
  },
  mutations: {
    setGenders: (state, genders) => {
      state.genders = genders;
    }
  },
  actions: {
    async getCodes({commit}) {
      const response = await ApiService.getCodes();
      commit('setGenders', response.data.genderCodes);
    }
  }
};
