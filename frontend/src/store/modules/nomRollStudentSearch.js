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
    headerSortParams: {
      currentSort: 'schoolNumber',
      currentSortAsc: true
    },
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
    setHeaderSortParams: (state, headerSortParams) => {
      state.headerSortParams = headerSortParams;
    },
    updateSortParams: (state, sortHeader) => {
      if (sortHeader === state.headerSortParams.currentSort) {
        state.headerSortParams.currentSortAsc = !state.headerSortParams.currentSortAsc;
        state.pageNumber = 1;
      } else {
        state.headerSortParams.currentSort = sortHeader;
      }
    },
  },
};
