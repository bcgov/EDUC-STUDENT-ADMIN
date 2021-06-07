const getDefaultState = () => {
  return {
    selectedIDs: {},
    currentRequest: 0,
    archived: false
  };
};

export default {
  namespaced: true,
  state: getDefaultState,
  getters: {
    title: state => {
      let numberOfSelectedFiles = [...new Set(state.selectedIDs?.map(item => item.penRequestBatchID))]?.length;
      return `Record ${state.currentRequest + 1} of ${Object.keys(state.selectedIDs)?.length} (${numberOfSelectedFiles} ${numberOfSelectedFiles > 1 ? 'files' : 'file'} selected)`;
    }
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
    }
  },
};
