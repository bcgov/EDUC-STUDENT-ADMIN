import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {defineStore} from 'pinia';

export const studentStore = defineStore('student', {
  namespaced: true,
  state: {
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
  },
  getters: {
    selectedStudent: state => state.selectedStudent,
    genders: state => state.genders?.sort((a,b) => a.displayOrder > b.displayOrder ? 1 : -1),
    demogCodeObjects: state => state.demogCodeObjects,
    statusCodeObjects: state => state.statusCodeObjects,
    gradeCodeObjects: state => state.gradeCodeObjects?.sort((a,b) => a.displayOrder > b.displayOrder ? 1 : -1),
    possibleMatchReasons: state => state.possibleMatchReasons,
    historyActivityCodes: state => state.historyActivityCodes,
    studentsInProcess: state => state.studentsInProcess,
    staleStudentRecordsMap: (state) => state.staleStudentRecordsMap,
    documentTypeCodes: state => state.documentTypeCodes
  },
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
      if (localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (!this.genders) {
          const responseGender = await ApiService.getGenderCodes();
          await this.setGenders(responseGender.data);
        }
        if (!this.demogCodeObjects) {
          const responseDemog = await ApiService.getDemogCodes();
          await this.setDemogCodeObjects(responseDemog.data);
        }
        if (!this.statusCodeObjects) {
          const responseStatus = await ApiService.getStatusCodes();
          await this.setStatusCodeObjects(responseStatus.data);
        }
        if (!this.gradeCodeObjects) {
          const responseGrade = await ApiService.getGradeCodes();
          await this.setGradeCodeObjects(responseGrade.data);
        }
        if (!this.possibleMatchReasons) {
          const response = await ApiService.getPossibleMatchReasonCodes();
          await this.setPossibleMatchReasons(response.data);
        }
        if (this.documentTypeCodes.length === 0) {
          const res = await ApiService.getDocumentTypeCodesFromStudentApi();
          await this.setDocumentTypeCodes(res.data);
        }
        if (!this.historyActivityCodes) {
          const res = await ApiService.getHistoryActivityCodes();
          await this.setHistoryActivityCodes(res.data);
        }
      }
    },
    async getMacros() {
      const response = ApiService.apiAxios.get(Routes.penServices.MACRO_URL);
      await this.setMergeMacros(response.data);
    }
  }
});
