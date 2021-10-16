import ApiService from '../../common/apiService';
import {Routes} from '../../utils/constants';

export default {
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
    genders: state => state.genders,
    demogCodeObjects: state => state.demogCodeObjects,
    statusCodeObjects: state => state.statusCodeObjects,
    gradeCodeObjects: state => state.gradeCodeObjects,
    possibleMatchReasons: state => state.possibleMatchReasons,
    historyActivityCodes: state => state.historyActivityCodes,
    studentsInProcess: state => state.studentsInProcess,
    staleStudentRecordsMap: (state) => state.staleStudentRecordsMap,
    documentTypeCodes: state => state.documentTypeCodes
  },
  mutations: {
    setGenders: (state, genders) => {
      state.genders = genders;
    },
    setDemogCodeObjects: (state, demogCodeObjects) => {
      state.demogCodeObjects = demogCodeObjects;
    },
    setStatusCodeObjects: (state, statusCodeObjects) => {
      state.statusCodeObjects = statusCodeObjects;
    },
    setGradeCodeObjects: (state, gradeCodeObjects) => {
      state.gradeCodeObjects = gradeCodeObjects;
    },
    setPossibleMatchReasons: (state, possibleMatchReasons) => {
      state.possibleMatchReasons = possibleMatchReasons;
    },
    setHistoryActivityCodes: (state, historyActivityCodes) => {
      state.historyActivityCodes = historyActivityCodes;
    },
    setStudentInProcessStatus: (state, studentID) => {
      state.studentsInProcess = new Map(state.studentsInProcess.set(studentID, 1)); //reassign a new Map because Vue2 does not support reactivity on Map data types
    },
    setStudentInProcessStatusWithCount: (state, {studentID, sagaCount}) => {
      state.studentsInProcess = new Map(state.studentsInProcess.set(studentID, sagaCount));
    },
    resetStudentInProcessStatus: (state, studentID) => {
      const sagaCount = state.studentsInProcess.get(studentID);
      if(sagaCount) {
        if(sagaCount > 1) {
          state.studentsInProcess.set(studentID, sagaCount - 1);
        } else {
          state.studentsInProcess.delete(studentID);
        }
        state.studentsInProcess = new Map(state.studentsInProcess);
      }
    },
    clearStudentInProcessStatus: (state, studentID) => {
      if(state.studentsInProcess.delete(studentID)) {
        state.studentsInProcess = new Map(state.studentsInProcess);
      }
    },
    clearStaleData: (state) => {
      state.staleStudentRecordsMap = new Map();
    },
    addStaleDataToMap: (state, {studentID, warningMessage}) => {
      state.staleStudentRecordsMap.set(studentID, warningMessage);
    },
    removeStaleDataFromMap: (state, studentID) => {
      state.staleStudentRecordsMap.delete(studentID);
    },
    setMergeMacros: (state, macros) => {
      state.mergeMacros = macros;
    },
    setDocumentTypeCodes: (state, codes) => {
      state.documentTypeCodes = codes;
    }
  },
  actions: {
    async getCodes({commit, state, dispatch}) {
      if (localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (!state.genders) {
          ApiService.getGenderCodes().then(responseGender => commit('setGenders', responseGender.data));
        }
        if (!state.demogCodeObjects) {
          ApiService.getDemogCodes().then(responseDemog => commit('setDemogCodeObjects', responseDemog.data));
        }
        if (!state.statusCodeObjects) {
          ApiService.getStatusCodes().then(responseStatus => commit('setStatusCodeObjects', responseStatus.data));
        }
        if (!state.gradeCodeObjects) {
          ApiService.getGradeCodes().then(responseGrade => commit('setGradeCodeObjects', responseGrade.data));
        }
        if (!state.possibleMatchReasons) {
          dispatch('getPossibleMatchReasonCodes');
        }
        if (state.documentTypeCodes.length === 0) {
          ApiService.getDocumentTypeCodesFromStudentApi().then(res => commit('setDocumentTypeCodes', res.data));
        }
      }
    },

    async getPossibleMatchReasonCodes({commit}) {
      if (localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        ApiService.getPossibleMatchReasonCodes().then(response => commit('setPossibleMatchReasons', response.data));
      }
    },
    async getHistoryActivityCodes({commit}) {
      if (localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        ApiService.getHistoryActivityCodes().then(response => commit('setHistoryActivityCodes', response.data));
      }
    },
    getMacros({commit}) {
      ApiService.apiAxios
        .get(Routes.penServices.MACRO_URL)
        .then(response => {
          commit('setMergeMacros', response.data);
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
};
