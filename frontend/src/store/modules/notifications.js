export default {
  namespaced: true,
  state: {
    notification: null,
    notifications:[]
  },
  getters: {
    notification: state => state.notification,
    notifications: state => state.notifications
  },
  mutations: {
    changeNotification: (state, payload) => {
      state.notification = payload;
      state.notifications.push(payload);
    }
  },
  actions: {
    setNotification: ({commit}, payload) => {
      commit('changeNotification', payload);
    }
  }
};
