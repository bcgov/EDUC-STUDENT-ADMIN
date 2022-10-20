import ApiService from '@/common/apiService';

export default {
  namespaced: true,
  state: {
    facilityTypeCodes: null,
    schoolCategoryTypeCodes: null,
    schoolOrganizationTypeCodes: null,
    schoolNeighborhoodLearningCodes: null,
    authorityTypeCodes: null,
    gradeCodes: null,
    provinceCodes: null,
    countryCodes: null
  },
  getters: {
    facilityTypeCodes: state => state.facilityTypeCodes,
    schoolCategoryTypeCodes: state => state.schoolCategoryTypeCodes,
    schoolOrganizationTypeCodes: state => state.schoolOrganizationTypeCodes,
    schoolNeighborhoodLearningCodes: state => state.schoolNeighborhoodLearningCodes,
    authorityTypeCodes: state => state.authorityTypeCodes,
    gradeCodes: state => state.gradeCodes,
    provinceCodes: state => state.provinceCodes,
    countryCodes: state => state.countryCodes
  },
  mutations: {
    setFacilityTypeCodes: (state, facilityTypeCodes) => {
      state.facilityTypeCodes = facilityTypeCodes;
    },
    setSchoolCategoryTypeCodes: (state, schoolCategoryTypeCodes) => {
      state.schoolCategoryTypeCodes = schoolCategoryTypeCodes;
    },
    setSchoolOrganizationTypeCodes: (state, schoolOrganizationTypeCodes) => {
      state.schoolOrganizationTypeCodes = schoolOrganizationTypeCodes;
    },
    setSchoolNeighborhoodLearningCodes: (state, schoolNeighborhoodLearningCodes) => {
      state.schoolNeighborhoodLearningCodes = schoolNeighborhoodLearningCodes;
    },
    setAuthorityTypeCodes: (state, authorityTypeCodes) => {
      state.authorityTypeCodes = authorityTypeCodes;
    },
    setGradeCodes: (state, gradeCodes) => {
      state.gradeCodes = gradeCodes;
    },
    setProvinceCodes: (state, provinceCodes) => {
      state.provinceCodes = provinceCodes;
    },
    setCountryCodes: (state, countryCodes) => {
      state.countryCodes = countryCodes;
    }
  },
  actions: {
    async getFacilityTypeCodes({commit}) {
      const response = await ApiService.getFacilityTypeCodes();
      commit('setFacilityTypeCodes', response.data);
    },
    async getSchoolCategoryTypeCodes({commit}) {
      const response = await ApiService.getSchoolCategoryTypeCodes();
      commit('setSchoolCategoryTypeCodes', response.data);
    },
    async getSchoolOrganizationTypeCodes({commit}) {
      const response = await ApiService.getSchoolOrganizationTypeCodes();
      commit('setSchoolOrganizationTypeCodes', response.data);
    },
    async getSchoolNeighborhoodLearningCodes({commit}) {
      const reponse = await ApiService.getSchoolNeighborhoodLearningCodes();
      commit('setSchoolNeighborhoodLearningCodes', reponse.data);
    },
    async getAuthorityTypeCodes({commit}) {
      const reponse = await ApiService.getAuthorityTypeCodes();
      commit('setAuthorityTypeCodes', reponse.data);
    },
    async getGradeCodes({commit}) {
      const response = await ApiService.getInstituteGradeCodes();
      commit('setGradeCodes', response.data);
    },
    async getProvinceCodes({commit}) {
      const response = await ApiService.getInstituteProvinceCodes();
      commit('setProvinceCodes', response.data);
    },
    async getCountryCodes({commit}) {
      const response = await ApiService.getInstituteCountryCodes();
      commit('setCountryCodes', response.data);
    }
  }
};
