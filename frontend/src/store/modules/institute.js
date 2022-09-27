import ApiService from '@/common/apiService';

export default {
  namespaced: true,
  state: {
    facilityTypeCodes: null,
    schoolCategoryTypeCodes: null,
    schoolOrganizationTypeCodes: null,
    schoolNeighborhoodLearningCodes: null,
    gradeCodes: null,
  },
  getters: {
    facilityTypeCodes: state => state.facilityTypeCodes,
    schoolCategoryTypeCodes: state => state.schoolCategoryTypeCodes,
    schoolOrganizationTypeCodes: state => state.schoolOrganizationTypeCodes,
    schoolNeighborhoodLearningCodes: state => state.schoolNeighborhoodLearningCodes,
    gradeCodes: state => state.gradeCodes,
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
    setGradeCodes: (state, gradeCodes) => {
      state.gradeCodes = gradeCodes;
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
    async getGradeCodes({commit}) {
      const response = await ApiService.getGradeCodes();
      commit('setGradeCodes', response.data);
    }
  }
};
