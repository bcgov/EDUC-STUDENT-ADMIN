import {defineStore} from 'pinia';

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

export const studentSearchStore = defineStore('studentSearch', {
  namespaced: true,
  state: () => ({
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
  }),
  getters: {
    useNameVariants: state => state.isAdvancedSearch && state.advancedSearchCriteria.useNameVariants,
    isAuditHistorySearch: state => state.isAdvancedSearch && state.advancedSearchCriteria.isAuditHistorySearch,
    statusCode: state => state.isAdvancedSearch? state.advancedSearchCriteria.statusCode : [],
  },
  actions: {
    async setIsAdvancedSearch(isAdvancedSearch) {
      this.isAdvancedSearch = isAdvancedSearch;
    },
    async setPageNumber(pageNumber) {
      this.pageNumber = pageNumber;
    },
    async setSelectedRecords(selectedRecords) {
      this.selectedRecords = selectedRecords || [];
    },
    async setStudentSearchResponse(studentSearchResponse){
      this.studentSearchResponse = studentSearchResponse;
    },
    async setAdvancedSearchCriteria(advancedSearchCriteria) {
      this.advancedSearchCriteria = advancedSearchCriteria;
    },
    async setStudentSearchParams(studentSearchParams) {
      this.studentSearchParams = studentSearchParams;
    },
    async updateSortParams(sortHeader){
      if (sortHeader === this.headerSortParams.currentSort) {
        this.headerSortParams.currentSortAsc = !this.headerSortParams.currentSortAsc;
        this.pageNumber = 1;
      } else {
        this.headerSortParams.currentSort = sortHeader;
      }
    },
    async clearStudentSearchParams() {
      this.advancedSearchCriteria = getDefaultAdvancedSearchCriteria();
      this.studentSearchParams = {
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
    async clearStudentSearchResults() {
      this.selectedRecords = [];
      this.studentSearchResponse = null;
    }
  }
});
