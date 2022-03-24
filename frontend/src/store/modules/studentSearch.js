const getDefaultAdvancedSearchCriteria = () => {
  return {
    startDate: {
      year: null,
      month: null,
      day: null
    },
    endDate: {
      year: null,
      month: null,
      day: null
    },
    useDOBRange: false,
    useNameVariants: false,
    isAuditHistorySearch: false,
    statusCode: ['A'],
  };
};

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
    advancedSearchCriteria: getDefaultAdvancedSearchCriteria(),
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
  getters: {
    useNameVariants: state => state.isAdvancedSearch && state.advancedSearchCriteria.useNameVariants,
    isAuditHistorySearch: state => state.isAdvancedSearch && state.advancedSearchCriteria.isAuditHistorySearch,
    statusCode: state => state.isAdvancedSearch? state.advancedSearchCriteria.statusCode : [],
  },
  mutations: {
    setIsAdvancedSearch: (state, isAdvancedSearch) => {
      state.isAdvancedSearch = isAdvancedSearch;
    },
    setPageNumber: (state, pageNumber) => {
      state.pageNumber = pageNumber;
    },
    setSelectedRecords: (state, selectedRecords) => {
      state.selectedRecords = selectedRecords || [];
    },
    setStudentSearchResponse: (state, studentSearchResponse) => {
      state.studentSearchResponse = studentSearchResponse;
    },
    setAdvancedSearchCriteria: (state, advancedSearchCriteria) => {
      state.advancedSearchCriteria = advancedSearchCriteria;
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
      state.advancedSearchCriteria = getDefaultAdvancedSearchCriteria();
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
    clearStudentSearchResults: (state) => {
      state.selectedRecords = [];
      state.studentSearchResponse = null;
    }
  }
};
