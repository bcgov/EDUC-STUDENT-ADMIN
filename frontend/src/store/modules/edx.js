import ApiService from '@/common/apiService';

export default {
  namespaced: true,
  state: {
    ministryTeams: [],
    statuses: [],
    exchangeMincodes: [],
    roles: [],
  },
  getters: {
    getStatuses: state => state.statuses?.sort((a,b) => a.displayOrder > b.displayOrder ? 1 : -1),
  },
  mutations: {
    setMinistryTeams(state, ministryTeamList) {
      state.ministryTeams = ministryTeamList;
    },
    setStatuses: (state, statuses) => {
      state.statuses = statuses;
    },
    setExchangeMincodes(state, payload) {
      state.exchangeMincodes = payload;
    },
    setRoles(state, payload) {
      state.roles = payload;
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
              permissionCode : 'SECURE_EXCHANGE',
            }
          };
    
          const response = await ApiService.getEdxMincodes(query);
          commit('setExchangeMincodes', response.data);
        }
      }
    },
    async getExchangeRoles({ commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (state.roles.length === 0) {
          ApiService.getEdxRoles().then(response => {
            commit('setRoles', response.data);
          });
        }
      }
    },
  },
};
