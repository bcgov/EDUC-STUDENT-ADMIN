import {mapValues} from 'lodash';
import {defineStore} from 'pinia';

export const penRequestBatchStudentSearchStore = defineStore('penRequestBatchStudentSearch', {
  namespaced: true,
  state: () => ({
    pageNumber: 1,
    selectedRecords: [],
    showSamePENAssigned: null,
    prbStudentSearchParams: {
      bestMatchPEN: null,
      submittedPen: null,
      submissionNumber: null,
      legalLastName: null,
      legalFirstName: null,
      legalMiddleNames: null,
      postalCode: null,
      genderCode: null,
      dob: null,
      mincode: null,
      usualLastName: null,
      usualFirstName: null,
      usualMiddleNames: null,
      localID: null,
      gradeCode: null
    },
    prbStudentSearchResponse: null,
    selectedStudentStatus: null,
    currentPrbStudentSearchParams: null,
    prbStudentSearchCriteria: null,
  }),
  actions: {
    async setPageNumber(pageNumber){
      this.pageNumber = pageNumber;
    },
    async setSelectedRecords(selectedRecords){
      this.selectedRecords = selectedRecords || [];
    },
    async setShowSamePENAssigned(showSamePENAssigned){
      this.showSamePENAssigned = showSamePENAssigned;
    },
    async setPrbStudentSearchResponse(prbStudentSearchResponse){
      this.prbStudentSearchResponse = prbStudentSearchResponse;
    },
    async setPrbStudentSearchParams(prbStudentSearchParams){
      this.prbStudentSearchParams = prbStudentSearchParams;
    },
    async clearPrbStudentSearchParams(){
      this.prbStudentSearchParams = mapValues(this.prbStudentSearchParams, () => null);
    },
    async setSelectedStudentStatus(selectedStudentStatus){
      this.selectedStudentStatus = selectedStudentStatus;
    },
    async clearPrbStudentSearchState(){
      this.pageNumber = 1;
      this.selectedRecords = [];
      this.showSamePENAssigned = null;
      this.prbStudentSearchParams = {
        bestMatchPEN: null,
        submittedPen: null,
        submissionNumber: null,
        legalLastName: null,
        legalFirstName: null,
        legalMiddleNames: null,
        postalCode: null,
        genderCode: null,
        dob: null,
        mincode: null,
        usualLastName: null,
        usualFirstName: null,
        usualMiddleNames: null,
        localID: null,
        gradeCode: null
      },
      this.prbStudentSearchResponse = null;
      this.selectedStudentStatus = null;
      this.currentPrbStudentSearchParams = null;
      this.prbStudentSearchCriteria = null;
    },
    async setCurrentPrbStudentSearchParams(currentPrbStudentSearchParams){
      this.currentPrbStudentSearchParams = currentPrbStudentSearchParams;
    },
    async setPrbStudentSearchCriteria(prbStudentSearchCriteria){
      this.prbStudentSearchCriteria = prbStudentSearchCriteria;
    },
  },
});
