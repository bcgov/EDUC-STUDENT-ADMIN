import {mapValues} from 'lodash';

const getDefaultState = () => {
  return {
    pageNumber: 1,
    selectedRecords: [],
    nomRollStudentSearchParams: {
      assignedPEN: null,
      legalLastName: null,
      legalFirstName: null,
      genderCode: null,
      dob: null,
      mincode: null,
      gradeCode: null
    },
    nomRollStudentSearchResponse: null,
    selectedStudentStatus: null,
    currentNomRollStudentSearchParams: null,
    nomRollStudentSearchCriteria: null,
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
    setNomRollStudentSearchResponse: (state, nomRollStudentSearchResponse) => {
      state.nomRollStudentSearchResponse = nomRollStudentSearchResponse;
    },
    setNomRollStudentSearchParams: (state, nomRollStudentSearchParams) => {
      state.nomRollStudentSearchParams = nomRollStudentSearchParams;
    },
    clearNomRollStudentSearchParams: (state) => {
      state.nomRollStudentSearchParams = mapValues(state.nomRollStudentSearchParams, () => null);
    },
    setSelectedStudentStatus: (state, selectedStudentStatus) => {
      state.selectedStudentStatus = selectedStudentStatus;
    },
    clearNomRollStudentSearchState: (state) => {
      Object.assign(state, getDefaultState());
    },
    setCurrentNomRollStudentSearchParams: (state, currentNomRollStudentSearchParams) => {
      state.currentNomRollStudentSearchParams = currentNomRollStudentSearchParams;
    },
    setNomRollStudentSearchCriteria: (state, nomRollStudentSearchCriteria) => {
      state.nomRollStudentSearchCriteria = nomRollStudentSearchCriteria;
    },
  },
};
