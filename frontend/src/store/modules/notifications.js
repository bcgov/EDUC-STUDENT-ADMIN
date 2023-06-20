import {defineStore} from 'pinia';
import { studentStore } from '@/store/modules/student';
import { appStore } from '@/store/modules/app';

export const notificationsStore = defineStore('notifications', {
  namespaced: true,
  state: () => ({
    notification: null,
    notifications:[]
  }),
  getters: {
    notification: state => state.notification,
    notifications: state => state.notifications
  },
  actions: {
    async changeNotification(payload){
      this.notification = payload;
      this.notifications.push(payload);
    },
    async setNotification(payload){
      try{
        const notificationData = JSON.parse(payload);
        await this.changeNotification(notificationData);
        if (notificationData && notificationData.sagaName?.startsWith('PEN_SERVICES_') && notificationData.sagaStatus === 'COMPLETED' && notificationData.studentID) {
          await studentStore().resetStudentInProcessStatus(notificationData.studentID);
        } else if(notificationData && notificationData.eventType === 'COPY_USERS_TO_NEW_SCHOOL' && notificationData.eventOutcome === 'USERS_TO_NEW_SCHOOL_COPIED'){
          await appStore().refreshEntities();
        }
      }catch (e) {
        console.error(e);
      }
    }
  }
});
