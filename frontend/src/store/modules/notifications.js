import {defineStore} from 'pinia';
import { studentStore } from '@/store/modules/student';
import { appStore } from '@/store/modules/app';
import { sdcCollection } from '@/store/modules/sdcCollection'

export const notificationsStore = defineStore('notifications', {
  namespaced: true,
  state: () => ({
    notification: null,
    notifications:[]
  }),
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
        } else if(notificationData && notificationData.eventType === 'CLOSE_CURRENT_COLLECTION_AND_OPEN_NEW_COLLECTION' && notificationData.eventOutcome === 'NEW_COLLECTION_CREATED') {
          await sdcCollection().getCollectionTypeCodesMap();
        }
      }catch (e) {
        console.error(e);
      }
    }
  }
});
