import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {groupBy} from 'lodash';
import {defineStore} from 'pinia';

export const edxStore = defineStore('edx', {
  namespaced: true,
  state: () => ({
    ministryTeams: [],
    statuses: [],
    validSchoolIDsForMessaging: [],
    validDistrictIDsForMessaging: [],
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
        schoolReportingRequirementCode: null,
        pageNumber: 1
      },
  }),
  getters: {
    getStatuses: state => state.statuses?.sort((a,b) => a.displayOrder > b.displayOrder ? 1 : -1),
    secureExchangeDocuments: state => state.secureExchangeDocuments,
    secureExchangeStudents: state => state.secureExchangeStudents,
    messageMacros: state => state.messageMacros
  },
  actions: {
    async setMinistryTeams(ministryTeamList) {
      this.ministryTeams = ministryTeamList;
    },
    async setStatuses(statuses) {
      this.statuses = statuses;
    },
    async setValidSchoolIDsForMessaging(payload) {
      this.validSchoolIDsForMessaging = payload;
    },
    async setValidDistrictIDsForMessaging(payload) {
      this.validDistrictIDsForMessaging = payload;
    },
    async setFileRequirements(payload) {
      this.fileRequirements = payload;
    },
    async setSchoolRoles(payload) {
      this.schoolRoles = JSON.parse(JSON.stringify(payload));
    },
    async setSchoolRolesCopy(payload) {
      this.schoolRolesCopy = JSON.parse(JSON.stringify(payload));
    },
    async setDistrictRoles(payload) {
      this.districtRoles = JSON.parse(JSON.stringify(payload));
    },
    async setDistrictRolesCopy(payload) {
      this.districtRolesCopy = JSON.parse(JSON.stringify(payload));
    },
    async setSecureExchangeDocuments(payload) {
      this.secureExchangeDocuments = payload;
    },
    async deleteSecureExchangeDocumentByIndex(index) {
      if (index < this.secureExchangeDocuments.length) {
        this.secureExchangeDocuments.splice(index, 1);
      }
    },
    async setSecureExchangeStudents(state,payload){
      this.secureExchangeStudents= payload;
    },
    async setSchoolSearchParams(state,payload){
      this.schoolSearchParams = payload;
      localStorage.setItem('schoolSearchParams', JSON.stringify(payload));
    },
    async deleteSecureExchangeStudentsByID(payload) {
      this.secureExchangeStudents = this.secureExchangeStudents.filter(secureExchangeStudent => secureExchangeStudent.studentID !== payload.studentID);
    },
    async setMessageMacros(macros) {
      this.messageMacros = macros;
    },
    async getMinistryTeams() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(this.ministryTeams.length === 0) {
          const response = await ApiService.getMinistryTeams();
          await this.setMinistryTeams(response.data);
        }
      }
    },
    async getFileRequirements() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(this.fileRequirements.length === 0) {
          const response = await ApiService.getFileRequirements();
          await this.setFileRequirements(response.data);
        }
      }
    },
    async getCodes() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(this.ministryTeams.length === 0) {
          const response = await ApiService.getMinistryTeams();
          await this.setMinistryTeams(response.data);
        }

        if (this.statuses.length === 0) {
          const response = await ApiService.getExchangeStatuses();
          await this.setStatuses(response.data);
        }

        if (this.fileRequirements.length === 0) {
          const response = await ApiService.getFileRequirements();
          await this.setFileRequirements(response.data);
        }
      }
    },
    async getValidIDsForMessaging() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(this.validSchoolIDsForMessaging.length === 0) {
          const query = {
            params: {
              permissionCode : 'SECURE_EXCHANGE',
            }
          };
    
          const response = await ApiService.getValidSchoolIDsForMessaging(query);
          await this.setValidSchoolIDsForMessaging(response.data);
        }

        if(this.validDistrictIDsForMessaging.length === 0) {
          const query = {
            params: {
              permissionCode : 'SECURE_EXCHANGE',
            }
          };
    
          const response = await ApiService.getValidDistrictIDsForMessaging(query);
          await this.setValidDistrictIDsForMessaging(response.data);
        }

      }
    },
    async getSchoolExchangeRoles() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (this.schoolRoles.length === 0) {
          const params = {
            params: {
              instituteType:'SCHOOL'
            }
          };
          const response = await ApiService.getEdxRoles(params);
          await this.setSchoolRoles(response.data);
          await this.setSchoolRolesCopy(response.data);
        }
      }
    },
    async getEdxDistrictRoles() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (this.districtRoles.length === 0) {
          const params = {
            params: {
              instituteType:'DISTRICT'
            }
          };
          const response = await ApiService.getEdxRoles(params);
          await this.setDistrictRoles(response.data);
          await this.setDistrictRolesCopy(response.data);
        }
      }
    },
    async getMacros() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        const params = {params: {businessUseTypeCode: 'EDX'}};
        const response = await ApiService.apiAxios.get(Routes.MACRO_URL, params);
        const macros = groupBy(response.data, 'macroTypeCode');
        await this.setMessageMacros(macros.MESSAGE);
      }
    }
  },
});
