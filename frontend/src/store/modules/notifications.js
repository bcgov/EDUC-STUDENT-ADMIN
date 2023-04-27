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
    setNotification: ({dispatch, commit}, payload) => {
      try{
        const notificationData = JSON.parse(payload);
        console.log(notificationData);
        commit('changeNotification', notificationData);
        if (notificationData && notificationData.sagaName?.startsWith('PEN_SERVICES_') && notificationData.sagaStatus === 'COMPLETED' && notificationData.studentID) {
          commit('student/resetStudentInProcessStatus', notificationData.studentID, { root: true });
        } else if(notificationData && notificationData.eventType === 'COPY_USERS_TO_NEW_SCHOOL' && notificationData.eventOutcome === 'USERS_TO_NEW_SCHOOL_COPIED'){
          dispatch('app/refreshEntities', null, {root: true});
        }
      }catch (e) {
        console.error(e);
      }
    }
  }
};
