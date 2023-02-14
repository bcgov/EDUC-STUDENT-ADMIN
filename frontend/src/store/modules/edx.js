import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {groupBy} from 'lodash';

export default {
  namespaced: true,
  state: {
    ministryTeams: [],
    statuses: [],
    validSchoolIDsForMessaging: [],
    schoolRoles: [],
    schoolRolesCopy: [],
    districtRoles: [],
    districtRolesCopy:[],
    fileRequirements: [],
    secureExchangeDocuments: [],
    secureExchangeStudents:[],
    messageMacros:[],
    schoolSearchParams: localStorage.getItem('schoolSearchParams') != null ? JSON.parse(localStorage.getItem('schoolSearchParams')):
      {
        schoolID: null,
        districtID: null,
        authorityID: null,
        status: null,
        schoolCategory: null,
        facilityType: null,
        pageNumber: 1
      },
  },
  getters: {
    getStatuses: state => state.statuses?.sort((a,b) => a.displayOrder > b.displayOrder ? 1 : -1),
    secureExchangeDocuments: state => state.secureExchangeDocuments,
    secureExchangeStudents: state => state.secureExchangeStudents,
    messageMacros: state => state.messageMacros
  },
  mutations: {
    setMinistryTeams(state, ministryTeamList) {
      state.ministryTeams = ministryTeamList;
    },
    setStatuses: (state, statuses) => {
      state.statuses = statuses;
    },
    setValidSchoolIDsForMessaging(state, payload) {
      state.validSchoolIDsForMessaging = payload;
    },
    setFileRequirements(state, payload) {
      state.fileRequirements = payload;
    },
    setSchoolRoles(state, payload) {
      state.schoolRoles = JSON.parse(JSON.stringify(payload));
    },
    setSchoolRolesCopy(state, payload) {
      state.schoolRolesCopy = JSON.parse(JSON.stringify(payload));
    },
    setDistrictRoles(state, payload) {
      state.districtRoles = JSON.parse(JSON.stringify(payload));
    },
    setDistrictRolesCopy(state, payload) {
      state.districtRolesCopy = JSON.parse(JSON.stringify(payload));
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
    setSchoolSearchParams(state,payload){
      state.schoolSearchParams = payload;
      localStorage.setItem('schoolSearchParams', JSON.stringify(payload));
    },
    deleteSecureExchangeStudentsByID(state, payload) {
      state.secureExchangeStudents = state.secureExchangeStudents.filter(secureExchangeStudent => secureExchangeStudent.studentID !== payload.studentID);
    },
    setMessageMacros(state, macros) {
      state.messageMacros = macros;
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
    async getValidSchoolIDsForMessaging({ commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(state.validSchoolIDsForMessaging.length === 0) {
          const query = {
            params: {
              permissionCode : 'SECURE_EXCHANGE',
            }
          };
    
          const response = await ApiService.getValidSchoolIDsForMessaging(query);
          commit('setValidSchoolIDsForMessaging', response.data);
        }
      }
    },
    async getSchoolExchangeRoles({ commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (state.schoolRoles.length === 0) {
          const params = {
            params: {
              instituteType:'SCHOOL'
            }
          };
          const response = await ApiService.getEdxRoles(params);
          commit('setSchoolRoles', response.data);
          commit('setSchoolRolesCopy', response.data);

        }
      }
    },
    async getEdxDistrictRoles({ commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (state.districtRoles.length === 0) {
          const params = {
            params: {
              instituteType:'DISTRICT'
            }
          };
          const response = await ApiService.getEdxRoles(params);
          commit('setDistrictRoles', response.data);
          commit('setDistrictRolesCopy', response.data);

        }
      }
    },
    async getMacros({commit}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        const params = {params: {businessUseTypeCode: 'EDX'}};
        ApiService.apiAxios
          .get(Routes.MACRO_URL, params)
          .then(response => {
            const macros = groupBy(response.data, 'macroTypeCode');
            commit('setMessageMacros', macros.MESSAGE);
          })
          .catch(error => {
            console.log(error);
          });
      }
    }
  },
};
