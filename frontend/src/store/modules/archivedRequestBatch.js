const getDefaultState = () => {
  return {
    pageNumber: 1,
    selectedFiles: [],
    penRequestBatchResponse: {
      content: [],
      pageable: {}
    },
    refinedSearch: false,
    currentBatchFileSearchParams: {
      prbStudent: {
        assignedPEN: null,
        legalLastName: null,
        legalFirstName: null,
        legalMiddleNames: null,
        genderCode: null,
        dob: null,
      },
      mincode: null,
      schoolName: null,
      load: {
        startDate: null,
        endDate: null
      },
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
    setSelectedFiles: (state, selectedFiles) => {
      state.selectedFiles = selectedFiles || [];
    },
    setPenRequestBatchResponse: (state, penRequestBatchResponse) => {
      state.penRequestBatchResponse = penRequestBatchResponse;
    },
    clearPenRequestBatchState: (state) => {
      Object.assign(state, {...getDefaultState()});
    },
    setCurrentBatchFileSearchParams: (state, batchFileSearchParams) => {
      state.currentBatchFileSearchParams = batchFileSearchParams;
    }
  },
};
