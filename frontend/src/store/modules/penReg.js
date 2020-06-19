export default {
  namespaced: true,
  state: () => ({
    pageNumber: 1
  }),
  getters: {
    pageNumber: state => state.pageNumber
  },
  mutations: {
    setPageNumber: (state, pageNumber) => {
      state.pageNumber = pageNumber;
    }
  },
};
