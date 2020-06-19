export default {
  namespaced: true,
  state: {
    notifications: []
  },
  getters: {
    notifications: state => state.notifications
  },
  mutations: {
    changeNotifications: (state, payload) => {
      state.notifications.push(payload)
    }
  },
  actions: {
    setNotifications: ({commit}, payload) => {
      commit('changeNotifications', payload)
    }
  }
};
