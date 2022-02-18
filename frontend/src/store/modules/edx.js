import ApiService from '@/common/apiService';

export default {
  namespaced: true,
  state: {
    ministryTeams: [],
    statuses: [],
    exchangeMincodes: [],
  },
  getters: {
    getStatuses: state => state.statuses?.sort((a,b) => a.displayOrder > b.displayOrder ? 1 : -1),
  },
  mutations: {
    setMinistryTeams(state, payload) {
      state.ministryTeams = payload;
    },
    setStatuses: (state, statuses) => {
      state.statuses = statuses;
    },
    setExchangeMincodes(state, payload) {
      state.exchangeMincodes = payload;
    }
  },
  actions: {
    async getMinistryTeams({ commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(state.ministryTeams.length === 0) {
          const response = await ApiService.getMinistryTeams();
          commit('setMinistryTeams', response.data);
        }
      }
    },
    async getCodes({commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(state.ministryTeams.length === 0) {
          ApiService.getMinistryTeams().then(response => {
            commit('setMinistryTeams', response.data);
          });
        }

        if (state.statuses.length === 0) {
          ApiService.getExchangeStatuses().then(response => {
            commit('setStatuses', response.data);
          });
        }
      }
    },
    async getExchangeMincodes({ commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(state.exchangeMincodes.length === 0) {
          const query = {
            params: {
              permissionName : 'SECURE_EXCHANGE',
            }
          };
    
          const response = await ApiService.getEdxMincodes(query);
          commit('setExchangeMincodes', response.data);
        }
      }
    },
  },
};
