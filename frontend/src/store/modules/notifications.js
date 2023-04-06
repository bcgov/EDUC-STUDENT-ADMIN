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
        } else if(notificationData && notificationData.eventOutcome === 'USERS_TO_NEW_SCHOOL_MOVED' && notificationData.eventPayload.toSchool.schoolNumber){
          commit('institute/schoolMovedNotification', notificationData.eventPayload.toSchool.schoolNumber);
        }
      }catch (e) {
        console.error(e);
      }
    }
  }
};
