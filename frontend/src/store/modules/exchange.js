import ApiService from '../../common/apiService';

export default {
  namespaced: true,
  state: {
    statusCodes: null,
  },
  getters: {
    statusCodes: state => state.statusCodes?.sort((a,b) => a.displayOrder > b.displayOrder ? 1 : -1),
  },
  mutations: {
    setStatusCodes: (state, statusCodes) => {
      state.statusCodes = statusCodes;
    },
  },
  actions: {
    async getCodes({commit, state}) {
      if (localStorage.getItem('jwtToken')) { // DO NOT Call api if there is no token.
        if (!state.statuses) {
          ApiService.getExchangeStatusCodes().then(responseStatusCodes => commit('setStatusCodes', responseStatusCodes.data));
        }
      }
    },
  }
};
