import ApiService from '@/common/apiService';
import { studentStore } from '@/store/modules/student';
import {defineStore} from 'pinia';

export const penRequestBatchStore = defineStore('penRequestBatch', {
  namespaced: true,
  state: () => ({
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
    prbValidationIssueTypeCodes: [],
    currentBatchFileSearchParams: {
      submissionNumber: null,
      mincode: null,
      schoolName: null,
    }
  }),
  actions: {
    async setPageNumber(pageNumber){
      this.pageNumber = pageNumber;
    },
    async setSelectedFiles(selectedFiles){
      this.selectedFiles = selectedFiles || [];
    },
    async setPenRequestBatchResponse(penRequestBatchResponse){
      this.penRequestBatchResponse = penRequestBatchResponse;
    },
    async setPrbStudentStatusFilters(prbStudentStatusFilters){
      this.prbStudentStatusFilters = prbStudentStatusFilters;
    },
    async setPrbStudentStatuses(prbStudentStatuses){
      this.prbStudentStatuses = prbStudentStatuses;
    },
    async setSelectedSchoolGroup(selectedSchoolGroup){
      this.selectedSchoolGroup = selectedSchoolGroup;
    },
    async clearPenRequestBatchState(){
      this.pageNumber = 1;
      this.selectedFiles = [];
      this.penRequestBatchResponse = {
        content: [],
        pageable: {}
      };
      this.prbStudentStatusFilters = null;
      this.selectedSchoolGroup = null;
      this.studentInfoMacros = [];
      this.prbValidationFieldCodes = [];
      this.prbValidationIssueSeverityCodes = [];
      this.prbValidationIssueTypeCodes = [];
      this.currentBatchFileSearchParams = {
        submissionNumber: null,
        mincode: null,
        schoolName: null,
      };
    },
    async setStudentInfoMacros(studentInfoMacros){
      this.studentInfoMacros = studentInfoMacros;
    },
    async setPrbValidationFieldCodes(prbValidationFieldCodes){
      this.prbValidationFieldCodes = prbValidationFieldCodes;
    },
    async setPrbValidationIssueSeverityCodes(prbValidationIssueSeverityCodes){
      this.prbValidationIssueSeverityCodes = prbValidationIssueSeverityCodes;
    },
    async setPrbValidationIssueTypeCodes(prbValidationIssueTypeCodes){
      this.prbValidationIssueTypeCodes = prbValidationIssueTypeCodes;
    },
    async setCurrentBatchFileSearchParams(batchFileSearchParams){
      this.currentBatchFileSearchParams = batchFileSearchParams;
    },
    async getCodes() {
      if(localStorage.getItem('jwtToken')) { // DON'T Call api if there is no token.
        const apiCalls = [];
        apiCalls.push(studentStore().getCodes());
        if(this.prbStudentStatuses?.length === 0) {
          apiCalls.push(ApiService.getPenRequestBatchStudentStatusCodes().then(response => this.setPrbStudentStatuses(response.data)));
        }
        if(this.prbValidationFieldCodes?.length === 0) {
          apiCalls.push(ApiService.getPrbValidationFieldCodes().then(response => this.setPrbValidationFieldCodes(response.data)));
        }
        if(this.prbValidationIssueSeverityCodes?.length === 0) {
          apiCalls.push(ApiService.getPrbValidationIssueSeverityCodes().then(response => this.setPrbValidationIssueSeverityCodes(response.data)));
        }
        if(this.prbValidationIssueTypeCodes?.length === 0) {
          apiCalls.push(ApiService.getPrbValidationIssueTypeCodes().then(response => this.setPrbValidationIssueTypeCodes(response.data)));
        }
        await Promise.all(apiCalls);
      }
    },
    async getMacros() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (this.studentInfoMacros?.length === 0) {
          const response = await ApiService.getPenRequestBatchStudentInfoMacroCodes();
          await this.setStudentInfoMacros(response.data);
        }
      }
    }
  }
});
