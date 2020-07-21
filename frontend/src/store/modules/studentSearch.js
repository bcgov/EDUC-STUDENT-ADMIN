export default {
  namespaced: true,
  state: {
    isAdvancedSearch: false,
    pageNumber: 1,
    headerSortParams: {
      currentSort: 'dob',
      currentSortAsc: true
    },
    selectedRecords: [],
    studentSearchParams: {
      pen: null,
      legalLastName: null,
      legalFirstName: null,
      legalMiddleNames: null,
      postalCode: null,
      genderCode: null,
      dob: {
        startDate: null,
        endDate: null
      },
      mincode: null,
      usualLastName: null,
      usualFirstName: null,
      usualMiddleNames: null,
      memo: null,
      localID: null,
      gradeCode: null
    },
    studentSearchResponse: null
  },
  mutations: {
    setPageNumber: (state, pageNumber) => {
      state.pageNumber = pageNumber;
    },
    setSelectedRecords: (state, selectedRecords) => {
      state.selectedRecords = selectedRecords || [];
    },
    setStudentSearchResponse: (state, studentSearchResponse) => {
      state.studentSearchResponse = studentSearchResponse;
    },
    setStudentSearchParams: (state, studentSearchParams) => {
      state.studentSearchParams = studentSearchParams;
    },
    updateSortParams: (state, sortHeader) => {
      if (sortHeader === state.headerSortParams.currentSort) {
        state.headerSortParams.currentSortAsc = !state.headerSortParams.currentSortAsc;
        state.pageNumber = 1;
      } else {
        state.headerSortParams.currentSort = sortHeader;
      }
    },
    clearStudentSearchParams: (state) => {
      state.studentSearchParams = {
        pen: null,
        legalLastName: null,
        legalFirstName: null,
        legalMiddleNames: null,
        postalCode: null,
        genderCode: null,
        dob: {
          startDate: null,
          endDate: null
        },
        mincode: null,
        usualLastName: null,
        usualFirstName: null,
        usualMiddleNames: null,
        memo: null,
        localID: null,
        gradeCode: null
      };
    },
    toggleSearchType: (state) => {
      state.isAdvancedSearch = !state.isAdvancedSearch;
    }
  }
};
