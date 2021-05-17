import ApiService from '../../common/apiService';

export default {
  namespaced: true,
  state: {
    genders: null,
    demogCodeObjects: null,
    statusCodeObjects: null,
    gradeCodeObjects: null,
    possibleMatchReasons: null,
    historyActivityCodes: null,
    studentsInProcess: new Set(),
    staleStudentRecordsMap: new Map(),// this stores the studentID as key and the message as value
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
      state.studentsInProcess = new Set(state.studentsInProcess.add(studentID)); //reassign a new Set because Vue2 does not support reactivity on Set data types
    },
    resetStudentInProcessStatus: (state, studentID) => {
      state.studentsInProcess.delete(studentID);
      state.studentsInProcess = new Set(state.studentsInProcess);
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
  },
  actions: {
    async getCodes({ commit, state, dispatch}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(!state.genders) {
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
      }
    },

    async getPossibleMatchReasonCodes({commit}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        ApiService.getPossibleMatchReasonCodes().then(response => commit('setPossibleMatchReasons', response.data));
      }
    },
    async getHistoryActivityCodes({commit}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        ApiService.getHistoryActivityCodes().then(response => commit('setHistoryActivityCodes', response.data));
      }
    }
  }
};
