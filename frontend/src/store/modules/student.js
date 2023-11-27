import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {defineStore} from 'pinia';

export const studentStore = defineStore('student', {
  namespaced: true,
  state: () => ({
    genders: null,
    demogCodeObjects: null,
    statusCodeObjects: null,
    gradeCodeObjects: null,
    possibleMatchReasons: null,
    historyActivityCodes: null,
    studentsInProcess: new Map(),
    staleStudentRecordsMap: new Map(),// this stores the studentID as key and the message as value
    mergeMacros: [],
    documentTypeCodes: []
  }),
  actions: {
    async setGenders(genders){
      this.genders = genders;
    },
    async setDemogCodeObjects(demogCodeObjects){
      this.demogCodeObjects = demogCodeObjects;
    },
    async setStatusCodeObjects(statusCodeObjects){
      this.statusCodeObjects = statusCodeObjects;
    },
    async setGradeCodeObjects(gradeCodeObjects){
      this.gradeCodeObjects = gradeCodeObjects;
    },
    async setPossibleMatchReasons(possibleMatchReasons){
      this.possibleMatchReasons = possibleMatchReasons;
    },
    async setHistoryActivityCodes(historyActivityCodes){
      this.historyActivityCodes = historyActivityCodes;
    },
    async setStudentInProcessStatus(studentID){
      this.studentsInProcess = new Map(this.studentsInProcess.set(studentID, 1)); //reassign a new Map because Vue2 does not support reactivity on Map data types
    },
    async setStudentInProcessStatusWithCount({studentID, sagaCount}){
      this.studentsInProcess = new Map(this.studentsInProcess.set(studentID, sagaCount));
    },
    async resetStudentInProcessStatus(studentID){
      const sagaCount = this.studentsInProcess.get(studentID);
      if(sagaCount) {
        if(sagaCount > 1) {
          this.studentsInProcess.set(studentID, sagaCount - 1);
        } else {
          this.studentsInProcess.delete(studentID);
        }
        this.studentsInProcess = new Map(this.studentsInProcess);
      }
    },
    async clearStudentInProcessStatus(studentID){
      if(this.studentsInProcess.delete(studentID)) {
        this.studentsInProcess = new Map(this.studentsInProcess);
      }
    },
    async clearStaleData(){
      this.staleStudentRecordsMap = new Map();
    },
    async addStaleDataToMap({studentID, warningMessage}){
      this.staleStudentRecordsMap.set(studentID, warningMessage);
    },
    async removeStaleDataFromMap(studentID){
      this.staleStudentRecordsMap.delete(studentID);
    },
    async setMergeMacros(macros){
      this.mergeMacros = macros;
    },
    async setDocumentTypeCodes(codes){
      this.documentTypeCodes = codes;
    },
    async getCodes() {
      if (localStorage.getItem('jwtToken')) { // Don't call API if there is no token.
        const apiCalls = [];

        if (!this.genders) {
          apiCalls.push(ApiService.getGenderCodes().then(response => this.setGenders(response.data)));
        }
        if (!this.demogCodeObjects) {
          apiCalls.push(ApiService.getDemogCodes().then(response => this.setDemogCodeObjects(response.data)));
        }
        if (!this.statusCodeObjects) {
          apiCalls.push(ApiService.getStatusCodes().then(response => this.setStatusCodeObjects(response.data)));
        }
        if (!this.gradeCodeObjects) {
          apiCalls.push(ApiService.getGradeCodes().then(response => this.setGradeCodeObjects(response.data)));
        }
        if (!this.possibleMatchReasons) {
          apiCalls.push(ApiService.getPossibleMatchReasonCodes().then(response => this.setPossibleMatchReasons(response.data)));
        }
        if (this.documentTypeCodes.length === 0) {
          apiCalls.push(ApiService.getDocumentTypeCodesFromStudentApi().then(response => this.setDocumentTypeCodes(response.data)));
        }
        if (!this.historyActivityCodes) {
          apiCalls.push(ApiService.getHistoryActivityCodes().then(response => this.setHistoryActivityCodes(response.data)));
        }
        await Promise.all(apiCalls);
      }
    },
    async getMacros() {
      const response = await ApiService.apiAxios.get(Routes.penServices.MACRO_URL);
      await this.setMergeMacros(response.data);
    }
  }
});
