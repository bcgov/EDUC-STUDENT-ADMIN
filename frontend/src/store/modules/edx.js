import ApiService from '@/common/apiService';

export default {
  namespaced: true,
  state: {
    ministryTeams: [],
    statuses: [],
    exchangeMincodes: [],
    roles: [],
    rolesCopy: [],
    fileRequirements: [],
    secureExchangeDocuments: [],
    secureExchangeStudents:[]
  },
  getters: {
    getStatuses: state => state.statuses?.sort((a,b) => a.displayOrder > b.displayOrder ? 1 : -1),
    secureExchangeDocuments: state => state.secureExchangeDocuments,
    secureExchangeStudents: state => state.secureExchangeStudents,
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
    setFileRequirements(state, payload) {
      state.fileRequirements = payload;
    },
    setRoles(state, payload) {
      state.roles = JSON.parse(JSON.stringify(payload));
    },
    setRolesCopy(state, payload) {
      state.rolesCopy = JSON.parse(JSON.stringify(payload));
    },
    setSecureExchangeDocuments(state, payload) {
      state.secureExchangeDocuments = payload;
    },
    deleteSecureExchangeDocumentByIndex(state, index) {
      if (index < state.secureExchangeDocuments.length) {
        state.secureExchangeDocuments.splice(index, 1);
      }
    },
    setSecureExchangeStudents(state,payload){
      state.secureExchangeStudents= payload;
    },
    deleteSecureExchangeStudentsByID(state, payload) {
      state.secureExchangeStudents = state.secureExchangeStudents.filter(secureExchangeStudent => secureExchangeStudent.studentID !== payload.studentID);
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
    async getFileRequirements({ commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(state.fileRequirements.length === 0) {
          const response = await ApiService.getFileRequirements();
          commit('setFileRequirements', response.data);
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

        if (state.fileRequirements.length === 0) {
          ApiService.getFileRequirements().then(response => {
            commit('setFileRequirements', response.data);
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
          const response = await ApiService.getEdxRoles();
          commit('setRoles', response.data);
          commit('setRolesCopy', response.data);
        
        }
      }
    },
  },
};
