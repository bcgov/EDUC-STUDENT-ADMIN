import {defineStore} from 'pinia';

export const archivedRequestBatchStore = defineStore('archivedRequestBatch', {
  namespaced: true,
  state: () => ({
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
  }),
  actions: {
    async setPageNumber(pageNumber){
      this.pageNumber = pageNumber;
    },
    async setSelectedFiles(selectedFiles) {
      this.selectedFiles = selectedFiles || [];
    },
    async setPenRequestBatchResponse(penRequestBatchResponse){
      this.penRequestBatchResponse = penRequestBatchResponse;
    },
    async clearPenRequestBatchState() {
      this.pageNumber = 1;
      this.selectedFiles = [];
      this.currentBatchFileSearchParams = {
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
      };
      this.refinedSearch = false;
      this.penRequestBatchResponse = {
        content: [],
        pageable: {}
      };
    },
    async setCurrentBatchFileSearchParams(batchFileSearchParams) {
      this.currentBatchFileSearchParams = batchFileSearchParams;
    }
  },
});
