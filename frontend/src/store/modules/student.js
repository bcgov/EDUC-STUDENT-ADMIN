import ApiService from '../../common/apiService';

export default {
  namespaced: true,
  state: {
    genders: null,
    demogCodeObjects: null,
    statusCodeObjects: null,
    gradeCodeObjects: null,
    twinReasons: null,
    historyActivityCodes: null
  },
  getters: {
    selectedStudent: state => state.selectedStudent,
    genders: state => state.genders,
    demogCodeObjects: state => state.demogCodeObjects,
    statusCodeObjects: state => state.statusCodeObjects,
    gradeCodeObjects: state => state.gradeCodeObjects,
    twinReasons: state => state.twinReasons,
    historyActivityCodes: state => state.historyActivityCodes,
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
    setTwinReasons: (state, twinReasons) => {
      state.twinReasons = twinReasons;
    },
    setHistoryActivityCodes: (state, historyActivityCodes) => {
      state.historyActivityCodes = historyActivityCodes;
    }
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
        if (!state.twinReasons) {
          dispatch('getTwinReasonCodes');
        }
      }
    },

    async getTwinReasonCodes({commit}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        ApiService.getTwinReasonCodes().then(response => commit('setTwinReasons', response.data));
      }
    },
    async getHistoryActivityCodes({commit}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        ApiService.getHistoryActivityCodes().then(response => commit('setHistoryActivityCodes', response.data));
      }
    }
  }
};
