import {mapValues} from 'lodash';
import ApiService from '@/common/apiService';

const getDefaultState = () => {
  return {
    pageNumber: 1,
    selectedRecords: [],
    prbStudentSearchParams: {
      bestMatchPEN: null,
      submittedPen: null,
      submissionNumber: null,
      legalLastName: null,
      legalFirstName: null,
      legalMiddleNames: null,
      postalCode: null,
      genderCode: null,
      dob: null,
      minCode: null,
      usualLastName: null,
      usualFirstName: null,
      usualMiddleNames: null,
      localID: null,
      gradeCode: null
    },
    prbStudentSearchResponse: null,
    selectedStudentStatus: null,
    currentPrbStudentSearchParams: null,
    prbStudentSearchCriteria: null,
    mincodeSchoolNames: new Map(),
  };
};

export default {
  namespaced: true,
  state: getDefaultState,
  mutations: {
    setPageNumber: (state, pageNumber) => {
      state.pageNumber = pageNumber;
    },
    setSelectedRecords: (state, selectedRecords) => {
      state.selectedRecords = selectedRecords || [];
    },
    setPrbStudentSearchResponse: (state, prbStudentSearchResponse) => {
      state.prbStudentSearchResponse = prbStudentSearchResponse;
    },
    setPrbStudentSearchParams: (state, prbStudentSearchParams) => {
      state.prbStudentSearchParams = prbStudentSearchParams;
    },
    clearPrbStudentSearchParams: (state) => {
      state.prbStudentSearchParams = mapValues(state.prbStudentSearchParams, () => null);
    },
    setSelectedStudentStatus: (state, selectedStudentStatus) => {
      state.selectedStudentStatus = selectedStudentStatus;
    },
    clearPrbStudentSearchState: (state) => {
      Object.assign(state, getDefaultState());
    },
    setCurrentPrbStudentSearchParams: (state, currentPrbStudentSearchParams) => {
      state.currentPrbStudentSearchParams = currentPrbStudentSearchParams;
    },
    setPrbStudentSearchCriteria: (state, prbStudentSearchCriteria) => {
      state.prbStudentSearchCriteria = prbStudentSearchCriteria;
    },
    setMinCodeSchoolName(state, minCodeSchoolNameList) {
      state.mincodeSchoolNames = new Map();
      minCodeSchoolNameList.forEach(element => {
        state.mincodeSchoolNames.set(element.minCode, element.schoolName);
      });
    }
  },
  actions: {
    async getCodes({ commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(state.mincodeSchoolNames.size === 0) {
          const response = await ApiService.getMinCodeSchoolNames();
          commit('setMinCodeSchoolName', response.data);
        }
      }
    },
  },
};
