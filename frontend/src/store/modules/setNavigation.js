const getDefaultState = () => {
  return {
    selectedIDs: [],
    currentRequest: 0,
    archived: false,
    requestType: 'penRequestBatch',
    multiFiles: true,
  };
};

export default {
  namespaced: true,
  state: getDefaultState,
  getters: {
    title: state => {
      let files = '';
      if(!state.multiFiles) {
        let numberOfSelectedFiles = [...new Set(state.selectedIDs?.map(item => item[`${state.requestType}ID`]))]?.length;
        files = `(${numberOfSelectedFiles} ${numberOfSelectedFiles > 1 ? 'files' : 'file'} selected)`;
      }
      return `Record ${state.currentRequest + 1} of ${Object.keys(state.selectedIDs)?.length} ${files}`;
    },
  },
  mutations: {
    /**
     * call the clearNavigation in the beforeDestroy method of a component to hide SetNavigation component
     */
    clearNavigation: (state) => {
      Object.assign(state, getDefaultState());
    },
    setSelectedIDs: (state, selectedIDs) => {
      state.selectedIDs = selectedIDs;
    },
    setCurrentRequest: (state, currentRequest) => {
      state.currentRequest = currentRequest;
    },
    setArchived: (state, archived) => {
      state.archived = archived;
    },
    setRequestType: (state, requestType) => {
      state.requestType = requestType;
    },
    setMultiFiles: (state, multiFiles) => {
      state.multiFiles = multiFiles;
    }
  },
};
