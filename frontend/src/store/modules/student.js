import ApiService from '../../common/apiService';

export default {
  namespaced: true,
  state: {
    selectedStudent: null,
    genders: null,
    demogCodeObjects: null,
    statusCodeObjects: null,
    gradeCodeObjects: null
  },
  getters: {
    selectedStudent: state => state.selectedStudent,
    genders: state => state.genders,
    demogCodeObjects: state => state.demogCodeObjects,
    statusCodeObjects: state => state.statusCodeObjects,
    gradeCodeObjects: state => state.gradeCodeObjects
  },
  mutations: {
    setSelectedStudent: (state, selectedStudent) => {
      state.selectedStudent = selectedStudent;
    },
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
    }
  },
  actions: {
    async getCodes({commit}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        ApiService.getGenderCodes().then(responseGender => commit('setGenders', responseGender.data.genderCodes));
        ApiService.getDemogCodes().then(responseDemog => commit('setDemogCodeObjects', responseDemog.data.demogCodes));
        ApiService.getStatusCodes().then(responseStatus => commit('setStatusCodeObjects', responseStatus.data.statusCodes));
        ApiService.getGradeCodes().then(responseGrade => commit('setGradeCodeObjects', responseGrade.data.gradeCodes));
      }
    }
  }
};
