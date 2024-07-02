import { defineStore } from 'pinia';
import ApiService from '../../common/apiService';

export const sdcCollectionStore = defineStore('sdcCollection', {
  id: 'sdcCollection',
  state: () => ({
    districtCollectionStatusCodesMap: new Map(),
    duplicateResolutionCodesMap: new Map(),
    schoolCollectionStatusCodesMap: new Map(),
    bandCodesMap: new Map(),
    bandCodes: [],
    careerProgramCodesMap: new Map(),
    careerProgramCodes: [],
    enrolledGradeCodesMap: new Map(),
    enrolledGradeCodes: [],
    enrolledProgramCodesMap: new Map(),
    enrolledProgramCodes: [],
    genderCodesMap: new Map(),
    genderCodes: [],
    homeLanguageSpokenCodesMap: new Map(),
    homeLanguageSpokenCodes: [],
    programEligibilityCodesMap: new Map(),
    schoolFundingCodesMap: new Map(),
    schoolFundingCodes: [],
    specialEducationCodesMap: new Map(),
    specialEducationCodes: [],
    ancestryItems: [{code:'Y', dropdownText:'Yes'}, {code:'N', dropdownText:'No'}],
    selectedIDs: [],
    page: 0
  }),
  actions: {
    setDistrictCollectionStatusCodes(districtCollectionStatusCodes){
      districtCollectionStatusCodes.forEach(districtCollectionCode => {
        this.districtCollectionStatusCodesMap.set(districtCollectionCode.sdcDistrictCollectionStatusCode, districtCollectionCode);
      });
    },
    setDuplicateResolutionCodes(duplicateResolutionCodes) {
      duplicateResolutionCodes.forEach(issue => {
        this.duplicateResolutionCodesMap.set(issue.duplicateResolutionCode, issue);
      });
    },
    setSchoolCollectionStatusCodes(schoolCollectionStatusCodes){
      schoolCollectionStatusCodes.forEach(schoolCollectionCode => {
        this.schoolCollectionStatusCodesMap.set(schoolCollectionCode.sdcSchoolCollectionStatusCode, schoolCollectionCode);
      });
    },
    setBandCodes(bandCodes) {
      this.bandCodes = bandCodes.map(item => {
        return {...item, dropdownText: `${item.description} (${item.bandCode})`};
      });
      this.bandCodesMap = new Map();
      this.bandCodes.unshift({'bandCode': null, 'dropdownText': 'No Band Code'});
      bandCodes.forEach(bandCode => {
        this.bandCodesMap.set(bandCode.bandCode, bandCode);
      });
    },
    setCareerProgramCodes(careerProgramCodes) {
      this.careerProgramCodes = careerProgramCodes.map(item => {
        return {...item, dropdownText: `${item.description} (${item.careerProgramCode})`};
      });
      this.careerProgramCodesMap = new Map();
      this.careerProgramCodes.unshift({'careerProgramCode': null, 'dropdownText': 'No Career Code'});
      careerProgramCodes.forEach(careerProgramCode => {
        this.careerProgramCodesMap.set(careerProgramCode.careerProgramCode, careerProgramCode);
      });
    },
    setEnrolledProgramCodes(enrolledProgramCodes) {
      this.enrolledProgramCodes = enrolledProgramCodes.map(item => {
        return {...item, dropdownText: `${item.description} (${item.enrolledProgramCode})`};
      });
      this.enrolledProgramCodesMap = new Map();
      enrolledProgramCodes.forEach(enrolledProgramCode => {
        this.enrolledProgramCodesMap.set(enrolledProgramCode.enrolledProgramCode, enrolledProgramCode);
      });
    },
    setEnrolledGradeCodes(enrolledGradeCodes) {
      this.enrolledGradeCodes = enrolledGradeCodes.map(item => {
        return {...item, dropdownText: `${item.description} (${item.enrolledGradeCode})`};
      });
      this.enrolledGradeCodesMap = new Map();
      enrolledGradeCodes.forEach(enrolledGradeCode => {
        this.enrolledGradeCodesMap.set(enrolledGradeCode.enrolledGradeCode, enrolledGradeCode);
      });
    },
    setGenderCodes(genderCodes) {
      this.genderCodes = genderCodes.map(item => {
        return {...item, dropdownText: `${item.label} (${item.genderCode})`};
      });
      this.genderCodesMap = new Map();
      genderCodes.forEach(genderCode => {
        this.genderCodesMap.set(genderCode.genderCode, genderCode);
      });
    },
    setHomeLanguageSpokenCodes(homeLanguageSpokenCodes) {
      this.homeLanguageSpokenCodes = homeLanguageSpokenCodes.map(item => {
        return {...item, dropdownText: `${item.description} (${item.homeLanguageSpokenCode})`};
      });
      this.homeLanguageSpokenCodesMap = new Map();
      this.homeLanguageSpokenCodes.unshift({'homeLanguageSpokenCode': null, 'dropdownText': 'No Home Language Code'});
      homeLanguageSpokenCodes.forEach(homeLanguageSpokenCode => {
        this.homeLanguageSpokenCodesMap.set(homeLanguageSpokenCode.homeLanguageSpokenCode, homeLanguageSpokenCode);
      });
    },
    setSchoolFundingCodes(schoolFundingCodes) {
      this.schoolFundingCodes = schoolFundingCodes.map(item => {
        return {...item, dropdownText: `${item.description} (${item.schoolFundingCode})`};
      });
      this.schoolFundingCodesMap = new Map();
      this.schoolFundingCodes.unshift({'schoolFundingCode': null, 'dropdownText': 'No Funding Code'});
      schoolFundingCodes.forEach(schoolFundingCode => {
        this.schoolFundingCodesMap.set(schoolFundingCode.schoolFundingCode, schoolFundingCode);
      });
    },
    setSpecialEducationCodes(specialEducationCodes) {
      this.specialEducationCodes = specialEducationCodes.map(item => {
        return {...item, dropdownText: `${item.description} (${item.specialEducationCategoryCode})`};
      });
      this.specialEducationCodesMap = new Map();
      this.specialEducationCodes.unshift({'specialEducationCategoryCode': null, 'dropdownText': 'No Special Ed Category Code'});
      specialEducationCodes.forEach(specialEducationCategoryCode => {
        this.specialEducationCodesMap.set(specialEducationCategoryCode.specialEducationCategoryCode, specialEducationCategoryCode);
      });
    },
    setProgramEligibilityCodesMap(programEligibilityCodesMap) {
      programEligibilityCodesMap.forEach(issue => {
        this.programEligibilityCodesMap.set(issue.programEligibilityIssueTypeCode, issue);
      });
    },
    setSelectedIDs(selectedIDs) {
      this.selectedIDs = selectedIDs;
    },
    setNavigationPage(page) {
      this.page = page;
    },
    async getDistrictCollectionStatusCodeMap() {
      if(this.districtCollectionStatusCodesMap.size === 0) {
        ApiService.getAllDistrictCollectionStatusCodes().then((res) => this.setDistrictCollectionStatusCodes(res.data));
      }
      return this.districtCollectionStatusCodesMap;
    },
    async getDuplicateResolutionCodesMap() {
      if(this.duplicateResolutionCodesMap.size === 0) {
        ApiService.getAllDuplicateResolutionCodes().then((res) => this.setDuplicateResolutionCodes(res.data));
      }
      return this.duplicateResolutionCodesMap;
    },
    async getSchoolCollectionStatusCodeMap() {
      if(this.schoolCollectionStatusCodesMap.size === 0) {
        ApiService.getAllSchoolCollectionStatusCodes().then((res) => this.setSchoolCollectionStatusCodes(res.data));
      }
      return this.schoolCollectionStatusCodesMap;
    },
    async getCodes() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is no token.
        const promises = [
          ... this.bandCodesMap.size === 0 ? [ApiService.getAllActiveBandCodes().then((res) => this.setBandCodes(res.data))] : [],
          ... this.careerProgramCodesMap.size === 0 ? [ApiService.getAllActiveCareerProgramCodes().then((res) => this.setCareerProgramCodes(res.data))] : [],
          ... this.enrolledGradeCodesMap.size === 0 ? [ApiService.getAllActiveEnrolledGradeCodes().then((res) => this.setEnrolledGradeCodes(res.data))] : [],
          ... this.enrolledProgramCodesMap.size === 0 ? [ApiService.getAllActiveEnrolledProgramCodes().then((res) => this.setEnrolledProgramCodes(res.data))] : [],
          ... this.genderCodesMap.size === 0 ? [ApiService.getAllActiveGenderCodes().then((res) => this.setGenderCodes(res.data))] : [],
          ... this.homeLanguageSpokenCodesMap.size === 0 ? [ApiService.getAllActiveHomeLanguageSpokenCodes().then((res) => this.setHomeLanguageSpokenCodes(res.data))] : [],
          ... this.schoolFundingCodesMap.size === 0 ? [ApiService.getAllActiveSchoolFundingCodes().then((res) => this.setSchoolFundingCodes(res.data))] : [],
          ... this.specialEducationCodesMap.size === 0 ? [ApiService.getAllActiveSpecialEdCodes().then((res) => this.setSpecialEducationCodes(res.data))] : [],
          ... this.programEligibilityCodesMap.size === 0 ? [ApiService.getAllProgramEligibilityTypeCodes().then((res) => this.setProgramEligibilityCodesMap(res.data))]: [],
        ];
        return Promise.all(promises);
      }
    }
  }
});
