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
      const responseGender = await ApiService.getGenderCodes();
      commit('setGenders', responseGender.data.genderCodes);
      const responseDemog = await ApiService.getDemogCodes();
      commit('setDemogCodeObjects', responseDemog.data.demogCodeObjects);
      const responseStatus = await ApiService.getStatusCodes();
      commit('setStatusCodeObjects', responseStatus.data.statsusCodeObjects);
      const responseGrade = await ApiService.getGradeCodes();
      commit('setGradeCodeObjects', responseGrade.data.gradeCodeObjects);
    }
  }
};
