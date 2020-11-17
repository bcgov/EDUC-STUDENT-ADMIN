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
    studentInfoMacros: [],
    prbValidationFieldCodes: [],
    prbValidationIssueSeverityCodes: [],
    prbValidationIssueTypeCodes: []
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
    setStudentInfoMacros: (state, studentInfoMacros) => {
      state.studentInfoMacros = studentInfoMacros;
    },
    setPrbValidationFieldCodes: (state, prbValidationFieldCodes) => {
      state.prbValidationFieldCodes = prbValidationFieldCodes;
    },
    setPrbValidationIssueSeverityCodes: (state, prbValidationIssueSeverityCodes) => {
      state.prbValidationIssueSeverityCodes = prbValidationIssueSeverityCodes;
    },
    setPrbValidationIssueTypeCodes: (state, prbValidationIssueTypeCodes) => {
      state.prbValidationIssueTypeCodes = prbValidationIssueTypeCodes;
    }
  },
  actions: {
    async getCodes({ commit, state, dispatch}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        dispatch('student/getCodes', null, { root: true });
        if(state.prbStudentStatuses?.length === 0) {
          ApiService.getPenRequestBatchStudentStatusCodes().then(response => commit('setPrbStudentStatuses', response.data));
        }
        if(state.prbValidationFieldCodes?.length === 0) {
          ApiService.getPrbValidationFieldCodes().then(response => commit('setPrbValidationFieldCodes', response.data));
        }
        if(state.prbValidationIssueSeverityCodes?.length === 0) {
          ApiService.getPrbValidationIssueSeverityCodes().then(response => commit('setPrbValidationIssueSeverityCodes', response.data));
        }
        if(state.prbValidationIssueTypeCodes?.length === 0) {
          ApiService.getPrbValidationIssueTypeCodes().then(response => commit('setPrbValidationIssueTypeCodes', response.data));
        }
      }
    },
    async getMacros({ commit, state }) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (state.studentInfoMacros?.length === 0) {
          ApiService.getPenRequestBatchStudentInfoMacroCodes().then(response => commit('setStudentInfoMacros', response.data));
        }
      }
    }
  }
};
