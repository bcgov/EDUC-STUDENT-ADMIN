export default {
  namespaced: true,
  state: {
    pageNumber: 1,
    headerSortParams: {
      currentSort: 'dob',
      currentSortAsc: true
    },
    selectedRecords: [],
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
    updateSortParams: (state, sortHeader) => {
      if (sortHeader === state.headerSortParams.currentSort) {
        state.headerSortParams.currentSortAsc = !state.headerSortParams.currentSortAsc;
        state.pageNumber = 1;
      } else {
        state.headerSortParams.currentSort = sortHeader;
      }
    }
  }
};
