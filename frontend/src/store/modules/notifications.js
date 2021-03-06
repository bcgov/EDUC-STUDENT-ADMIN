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
      try{
        const notificationData = JSON.parse(payload);
        commit('changeNotification', notificationData);
        if (notificationData && notificationData.sagaName?.startsWith('PEN_SERVICES_') && notificationData.sagaStatus === 'COMPLETED' && notificationData.studentID) {
          commit('student/resetStudentInProcessStatus', notificationData.studentID, { root: true });
        }
      }catch (e) {
        console.error(e);
      }
    }
  }
};
