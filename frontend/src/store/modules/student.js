import ApiService from '../../common/apiService';

export default {
  namespaced: true,
  state: {
    selectedStudent: null
  },
  getters: {
    selectedStudent: state => state.selectedStudent
  },
  mutations: {
    setSelectedStudent: (state, selectedStudent) => {
      state.selectedStudent = selectedStudent;
    },
  }
};
