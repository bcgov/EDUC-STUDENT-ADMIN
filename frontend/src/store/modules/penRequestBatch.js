import ApiService from '../../common/apiService';

const getDefaultState = () => {
  return {
    pageNumber: 1,
    selectedFiles: [],
    penRequestBatchResponse: {
      content: [],
      pageable: {}
    },
    prbStudentStatuses: [],
    prbStudentStatusFilters: null,
    selectedSchoolGroup: null,
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
    setPrbStudentStatusFilters: (state, prbStudentStatusFilters) => {
      state.prbStudentStatusFilters = prbStudentStatusFilters;
    },
    setPrbStudentStatuses: (state, prbStudentStatuses) => {
      state.prbStudentStatuses = prbStudentStatuses;
    },
    setSelectedSchoolGroup: (state, selectedSchoolGroup) => {
      state.selectedSchoolGroup = selectedSchoolGroup;
    },
    clearPenRequestBatchState: (state) => {
      Object.assign(state, {...getDefaultState(), prbStudentStatuses: state.prbStudentStatuses});
    },
  },
  actions: {
    async getCodes({ commit, state, dispatch}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        dispatch('student/getCodes', null, { root: true });
        if(state.prbStudentStatuses?.length === 0) {
          ApiService.getPenRequestBatchStudentStatusCodes().then(response => commit('setPrbStudentStatuses', response.data));
        } 
      }
    },
  }
};
