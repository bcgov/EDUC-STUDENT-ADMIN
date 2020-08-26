import ApiService from '../../common/apiService';

export default {
  namespaced: true,
  state: {
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
    async getCodes(context) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(!context.state.genders) {
          ApiService.getGenderCodes().then(responseGender => context.commit('setGenders', responseGender.data.genderCodes));
        }
        if (!context.state.demogCodeObjects) {
          ApiService.getDemogCodes().then(responseDemog => context.commit('setDemogCodeObjects', responseDemog.data.demogCodes));
        }
        if (!context.state.statusCodeObjects) {
          ApiService.getStatusCodes().then(responseStatus => context.commit('setStatusCodeObjects', responseStatus.data.statusCodes));
        }
        if (!context.state.gradeCodeObjects) {
          ApiService.getGradeCodes().then(responseGrade => context.commit('setGradeCodeObjects', responseGrade.data.gradeCodes));
        }
      }
    }
  }
};
