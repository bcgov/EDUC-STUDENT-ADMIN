const getDefaultState = () => {
  return {
    pageNumber: 1,
    selectedFiles: [],
    penRequestBatchResponse: {
      content: [],
      pageable: {}
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
  },
};
