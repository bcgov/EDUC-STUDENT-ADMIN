import ApiService from '@/common/apiService';
import {defineStore} from 'pinia';
import {Routes} from '@/utils/constants';

export const instituteStore = defineStore('institute', {
  namespaced: true,
  state: () => ({
    facilityTypeCodes: null,
    schoolCategoryTypeCodes: null,
    schoolOrganizationTypeCodes: null,
    schoolReportingRequirementTypeCodes: null,
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
    movedSchoolNumber: null,
    schoolContactTypeCodes: null,
    authorityContactTypeCodes: null
  }),
  getters: {
    independentAuthoritySchoolContacts: state => state.schoolContactTypeCodes?.filter(type => !type.offshoreOnly),
    offshoreSchoolContacts: state => state.schoolContactTypeCodes?.filter(type => !type.indOnly),
    regularSchoolContactTypes: state => state.schoolContactTypeCodes?.filter(type => !type.indOnly && !type.offshoreOnly),
    independentAuthorityAuthorityContacts: state => state.authorityContactTypeCodes?.filter(type => !type.offshoreOnly),
    offshoreAuthorityContacts: state => state.authorityContactTypeCodes?.filter(type => !type.indOnly),
    regularAuthorityContactTypes: state => state.authorityContactTypeCodes?.filter(type => !type.indOnly && !type.offshoreOnly)
  },
  actions: {
    async setFacilityTypeCodes(facilityTypeCodes) {
      this.facilityTypeCodes = facilityTypeCodes;
    },
    async setSchoolCategoryTypeCodes(schoolCategoryTypeCodes) {
      this.schoolCategoryTypeCodes = schoolCategoryTypeCodes;
    },
    async setSchoolOrganizationTypeCodes(schoolOrganizationTypeCodes) {
      this.schoolOrganizationTypeCodes = schoolOrganizationTypeCodes;
    },
    async setSchoolReportingRequirementTypeCodes(schoolReportingRequirementTypeCodes) {
      this.schoolReportingRequirementTypeCodes = schoolReportingRequirementTypeCodes;
    },
    async setSchoolNeighborhoodLearningCodes(schoolNeighborhoodLearningCodes) {
      this.schoolNeighborhoodLearningCodes = schoolNeighborhoodLearningCodes;
    },
    async setAuthorityTypeCodes(authorityTypeCodes) {
      this.authorityTypeCodes = authorityTypeCodes;
    },
    async setGradeCodes(gradeCodes) {
      this.gradeCodes = gradeCodes;
    },
    async setProvinceCodes(provinceCodes) {
      this.provinceCodes = provinceCodes;
    },
    async setCountryCodes(countryCodes) {
      this.countryCodes = countryCodes;
    },
    async setSchoolCategoryFacilityTypesMap(schoolCategoryFacilityTypesMap) {
      this.schoolCategoryFacilityTypesMap = schoolCategoryFacilityTypesMap;
    },
    async setActiveFacilityTypeCodes(activeFacilityTypeCodes) {
      this.activeFacilityTypeCodes = activeFacilityTypeCodes;
    },
    async setActiveSchoolCategoryTypeCodes(activeSchoolCategoryTypeCodes) {
      this.activeSchoolCategoryTypeCodes = activeSchoolCategoryTypeCodes;
    },
    async setActiveSchoolOrganizationTypeCodes(activeSchoolOrganizationTypeCodes) {
      this.activeSchoolOrganizationTypeCodes = activeSchoolOrganizationTypeCodes;
    },
    async setActiveSchoolNeighborhoodLearningCodes(activeSchoolNeighborhoodLearningCodes) {
      this.activeSchoolNeighborhoodLearningCodes = activeSchoolNeighborhoodLearningCodes;
    },
    async setActiveAuthorityTypeCodes(activeAuthorityTypeCodes) {
      this.activeAuthorityTypeCodes = activeAuthorityTypeCodes;
    },
    async setActiveGradeCodes(activeGradeCodes) {
      this.activeGradeCodes = activeGradeCodes;
    },
    async setActiveProvinceCodes(activeProvinceCodes) {
      this.activeProvinceCodes = activeProvinceCodes;
    },
    async setActiveCountryCodes(activeCountryCodes) {
      this.activeCountryCodes = activeCountryCodes;
    },
    async setSchoolContactTypeCodes(schoolContactTypeCodes) {
      this.schoolContactTypeCodes = schoolContactTypeCodes;
    },
    async setAuthorityContactTypeCodes(authorityContactTypeCodes) {
      this.authorityContactTypeCodes = authorityContactTypeCodes;
    },
    async getAllFacilityTypeCodes() {
      const response = await ApiService.getFacilityTypeCodes();
      await this.setFacilityTypeCodes(response.data);
    },
    async getAllSchoolCategoryTypeCodes() {
      const response = await ApiService.getSchoolCategoryTypeCodes();
      await this.setSchoolCategoryTypeCodes(response.data);
    },
    async getAllSchoolOrganizationTypeCodes() {
      const response = await ApiService.getSchoolOrganizationTypeCodes();
      await this.setSchoolOrganizationTypeCodes(response.data);
    },
    async getSchoolReportingRequirementTypeCodes() {
      const { data } = await ApiService.getSchoolReportingRequirementTypeCodes();
      await this.setSchoolReportingRequirementTypeCodes(data);
    },
    async getAllSchoolNeighborhoodLearningCodes() {
      const response = await ApiService.getSchoolNeighborhoodLearningCodes();
      await this.setSchoolNeighborhoodLearningCodes(response.data);
    },
    async getAllAuthorityTypeCodes() {
      const response = await ApiService.getAuthorityTypeCodes();
      await this.setAuthorityTypeCodes(response.data);
    },
    async getAllGradeCodes() {
      const response = await ApiService.getInstituteGradeCodes();
      await this.setGradeCodes(response.data);
    },
    async getAllProvinceCodes() {
      const response = await ApiService.getInstituteProvinceCodes();
      await this.setProvinceCodes(response.data);
    },
    async getAllCountryCodes() {
      const response = await ApiService.getInstituteCountryCodes();
      await this.setCountryCodes(response.data);
    },
    async getSchoolCategoryFacilityTypesMap() {
      const response = await ApiService.getSchoolCategoryFacilityTypes();
      await this.setSchoolCategoryFacilityTypesMap(response.data);
    },
    async getAllActiveFacilityTypeCodes() {
      const response = await ApiService.getAllActiveFacilityTypeCodes();
      await this.setActiveFacilityTypeCodes(response.data);
    },
    async getAllActiveSchoolCategoryTypeCodes() {
      const response = await ApiService.getAllActiveSchoolCategoryTypeCodes();
      await this.setActiveSchoolCategoryTypeCodes(response.data);
    },
    async getAllActiveSchoolOrganizationTypeCodes() {
      const response = await ApiService.getAllActiveSchoolOrganizationTypeCodes();
      await this.setActiveSchoolOrganizationTypeCodes(response.data);
    },
    async getAllActiveSchoolNeighborhoodLearningCodes() {
      const response = await ApiService.getAllActiveSchoolNeighborhoodLearningCodes();
      await this.setActiveSchoolNeighborhoodLearningCodes(response.data);
    },
    async getAllActiveAuthorityTypeCodes() {
      const response = await ApiService.getAllActiveAuthorityTypeCodes();
      await this.setActiveAuthorityTypeCodes(response.data);
    },
    async getAllActiveGradeCodes() {
      const response = await ApiService.getAllActiveInstituteGradeCodes();
      await this.setActiveGradeCodes(response.data);
    },
    async getAllActiveProvinceCodes() {
      const response = await ApiService.getAllActiveInstituteProvinceCodes();
      await this.setActiveProvinceCodes(response.data);
    },
    async getAllActiveCountryCodes() {
      const response = await ApiService.getAllActiveInstituteCountryCodes();
      await this.setActiveCountryCodes(response.data);
    },
    async getSchoolContactTypeCodes() {
      const response = await ApiService.apiAxios.get(Routes.cache.SCHOOL_CONTACT_TYPES_URL);
      await this.setSchoolContactTypeCodes(response.data);
    },
    async getAllAuthorityContactTypeCodes() {
      const response = await ApiService.apiAxios.get(Routes.cache.AUTHORITY_CONTACT_TYPES_URL);
      await this.setAuthorityContactTypeCodes(response.data);
    },
  }
});
