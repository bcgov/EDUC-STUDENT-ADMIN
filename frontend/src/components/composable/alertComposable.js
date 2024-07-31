import {ALERT_NOTIFICATION_TYPES} from '../../utils/constants/AlertNotificationTypes.js';
import { appStore } from '../../store/modules/app';

export const setWarningAlert = (message) => {
  const useAppStore = appStore();
  return useAppStore.addAlertNotification({text: message, alertType: ALERT_NOTIFICATION_TYPES.WARN});
};

export const setSuccessAlert = (message) => {
  const useAppStore = appStore();
  return useAppStore.addAlertNotification({text: message, alertType: ALERT_NOTIFICATION_TYPES.SUCCESS});
};

export const setFailureAlert = (message) => {
  const useAppStore = appStore();
  return useAppStore.addAlertNotification({text: message, alertType: ALERT_NOTIFICATION_TYPES.ERROR});
};
