import {mapValues} from 'lodash';
import {defineStore} from 'pinia';
export const nominalRollStudentSearchStore = defineStore('nominalRollStudentSearch', {
  namespaced: true,
  state: () => ({
    pageNumber: 1,
    selectedRecords: [],
    nomRollStudentSearchParams: {
      assignedPEN: null,
      legalLastName: null,
      legalFirstName: null,
      genderCode: null,
      dob: null,
      mincode: null,
      gradeCode: null
    },
    nomRollStudentSearchResponse: null,
    selectedStudentStatus: null,
    currentNomRollStudentSearchParams: null,
    nomRollStudentSearchCriteria: null,
  }),
  actions: {
    async setPageNumber(pageNumber) {
      this.pageNumber = pageNumber;
    },
    async setSelectedRecords(selectedRecords){
      this.selectedRecords = selectedRecords || [];
    },
    async setNomRollStudentSearchResponse(nomRollStudentSearchResponse) {
      this.nomRollStudentSearchResponse = nomRollStudentSearchResponse;
    },
    async setNomRollStudentSearchParams(nomRollStudentSearchParams) {
      this.nomRollStudentSearchParams = nomRollStudentSearchParams;
    },
    async clearNomRollStudentSearchParam() {
      this.nomRollStudentSearchParams = mapValues(this.nomRollStudentSearchParams, () => null);
    },
    async setSelectedStudentStatus(selectedStudentStatus) {
      this.selectedStudentStatus = selectedStudentStatus;
    },
    async clearNomRollStudentSearchState()  {
      this.selectedRecords = [];
      this.nomRollStudentSearchParams = {
        assignedPEN: null,
        legalLastName: null,
        legalFirstName: null,
        genderCode: null,
        dob: null,
        mincode: null,
        gradeCode: null
      };
      this.nomRollStudentSearchResponse = null;
      this.selectedStudentStatus = null;
      this.currentNomRollStudentSearchParams = null;
      this.nomRollStudentSearchCriteria = null;
    },
    async setCurrentNomRollStudentSearchParams(currentNomRollStudentSearchParams) {
      this.currentNomRollStudentSearchParams = currentNomRollStudentSearchParams;
    },
    async setNomRollStudentSearchCriteria(nomRollStudentSearchCriteria) {
      this.nomRollStudentSearchCriteria = nomRollStudentSearchCriteria;
    },
  },
});
