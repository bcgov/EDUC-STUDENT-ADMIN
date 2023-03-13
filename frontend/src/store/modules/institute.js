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
    countryCodes: null,
    schoolCategoryFacilityTypesMap: null,
    activeFacilityTypeCodes: null,
    activeSchoolCategoryTypeCodes: null,
    activeSchoolOrganizationTypeCodes: null,
    activeSchoolNeighborhoodLearningCodes: null,
    activeAuthorityTypeCodes: null,
    activeGradeCodes: null,
    activeProvinceCodes: null,
    activeCountryCodes: null,
    movedSchoolNumber: null
  },
  getters: {
    facilityTypeCodes: state => state.facilityTypeCodes,
    schoolCategoryFacilityTypesMap: state => state.schoolCategoryFacilityTypesMap,
    schoolCategoryTypeCodes: state => state.schoolCategoryTypeCodes,
    schoolOrganizationTypeCodes: state => state.schoolOrganizationTypeCodes,
    schoolNeighborhoodLearningCodes: state => state.schoolNeighborhoodLearningCodes,
    authorityTypeCodes: state => state.authorityTypeCodes,
    gradeCodes: state => state.gradeCodes,
    provinceCodes: state => state.provinceCodes,
    countryCodes: state => state.countryCodes,
    activeFacilityTypeCodes: state => state.activeFacilityTypeCodes,
    activeSchoolCategoryTypeCodes: state => state.activeSchoolCategoryTypeCodes,
    activeSchoolOrganizationTypeCodes: state => state.activeSchoolOrganizationTypeCodes,
    activeSchoolNeighborhoodLearningCodes: state => state.activeSchoolNeighborhoodLearningCodes,
    activeAuthorityTypeCodes: state => state.activeAuthorityTypeCodes,
    activeGradeCodes: state => state.activeGradeCodes,
    activeProvinceCodes: state => state.activeProvinceCodes,
    activeCountryCodes: state => state.activeCountryCodes
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
    },
    setSchoolCategoryFacilityTypesMap: (state, schoolCategoryFacilityTypesMap) => {
      state.schoolCategoryFacilityTypesMap = schoolCategoryFacilityTypesMap;
    },
    setActiveFacilityTypeCodes: (state, activeFacilityTypeCodes) => {
      state.activeFacilityTypeCodes = activeFacilityTypeCodes;
    },
    setActiveSchoolCategoryTypeCodes: (state, activeSchoolCategoryTypeCodes) => {
      state.activeSchoolCategoryTypeCodes = activeSchoolCategoryTypeCodes;
    },
    setActiveSchoolOrganizationTypeCodes: (state, activeSchoolOrganizationTypeCodes) => {
      state.activeSchoolOrganizationTypeCodes = activeSchoolOrganizationTypeCodes;
    },
    setActiveSchoolNeighborhoodLearningCodes: (state, activeSchoolNeighborhoodLearningCodes) => {
      state.activeSchoolNeighborhoodLearningCodes = activeSchoolNeighborhoodLearningCodes;
    },
    setActiveAuthorityTypeCodes: (state, activeAuthorityTypeCodes) => {
      state.activeAuthorityTypeCodes = activeAuthorityTypeCodes;
    },
    setActiveGradeCodes: (state, activeGradeCodes) => {
      state.activeGradeCodes = activeGradeCodes;
    },
    setActiveProvinceCodes: (state, activeProvinceCodes) => {
      state.activeProvinceCodes = activeProvinceCodes;
    },
    setActiveCountryCodes: (state, activeCountryCodes) => {
      state.activeCountryCodes = activeCountryCodes;
    },
    schoolMovedNotification: (state, movedSchoolNumber) => {
      state.movedSchoolNumber = movedSchoolNumber;
    }
  },
  actions: {
    async getAllFacilityTypeCodes({commit}) {
      const response = await ApiService.getFacilityTypeCodes();
      commit('setFacilityTypeCodes', response.data);
    },
    async getAllSchoolCategoryTypeCodes({commit}) {
      const response = await ApiService.getSchoolCategoryTypeCodes();
      commit('setSchoolCategoryTypeCodes', response.data);
    },
    async getAllSchoolOrganizationTypeCodes({commit}) {
      const response = await ApiService.getSchoolOrganizationTypeCodes();
      commit('setSchoolOrganizationTypeCodes', response.data);
    },
    async getAllSchoolNeighborhoodLearningCodes({commit}) {
      const response = await ApiService.getSchoolNeighborhoodLearningCodes();
      commit('setSchoolNeighborhoodLearningCodes', response.data);
    },
    async getAllAuthorityTypeCodes({commit}) {
      const response = await ApiService.getAuthorityTypeCodes();
      commit('setAuthorityTypeCodes', response.data);
    },
    async getAllGradeCodes({commit}) {
      const response = await ApiService.getInstituteGradeCodes();
      commit('setGradeCodes', response.data);
    },
    async getAllProvinceCodes({commit}) {
      const response = await ApiService.getInstituteProvinceCodes();
      commit('setProvinceCodes', response.data);
    },
    async getAllCountryCodes({commit}) {
      const response = await ApiService.getInstituteCountryCodes();
      commit('setCountryCodes', response.data);
    },
    async getSchoolCategoryFacilityTypesMap({commit}) {
      const response = await ApiService.getSchoolCategoryFacilityTypes();
      commit('setSchoolCategoryFacilityTypesMap', response.data);
    },
    async getAllActiveFacilityTypeCodes({commit}) {
      const response = await ApiService.getAllActiveFacilityTypeCodes();
      commit('setActiveFacilityTypeCodes', response.data);
    },
    async getAllActiveSchoolCategoryTypeCodes({commit}) {
      const response = await ApiService.getAllActiveSchoolCategoryTypeCodes();
      commit('setActiveSchoolCategoryTypeCodes', response.data);
    },
    async getAllActiveSchoolOrganizationTypeCodes({commit}) {
      const response = await ApiService.getAllActiveSchoolOrganizationTypeCodes();
      commit('setActiveSchoolOrganizationTypeCodes', response.data);
    },
    async getAllActiveSchoolNeighborhoodLearningCodes({commit}) {
      const response = await ApiService.getAllActiveSchoolNeighborhoodLearningCodes();
      commit('setActiveSchoolNeighborhoodLearningCodes', response.data);
    },
    async getAllActiveAuthorityTypeCodes({commit}) {
      const response = await ApiService.getAllActiveAuthorityTypeCodes();
      commit('setActiveAuthorityTypeCodes', response.data);
    },
    async getAllActiveGradeCodes({commit}) {
      const response = await ApiService.getAllActiveInstituteGradeCodes();
      commit('setActiveGradeCodes', response.data);
    },
    async getAllActiveProvinceCodes({commit}) {
      const response = await ApiService.getAllActiveInstituteProvinceCodes();
      commit('setActiveProvinceCodes', response.data);
    },
    async getAllActiveCountryCodes({commit}) {
      const response = await ApiService.getAllActiveInstituteCountryCodes();
      commit('setActiveCountryCodes', response.data);
    },
  }
};
