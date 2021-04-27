import {ALERT_NOTIFICATION_TYPES} from '../utils/constants/AlertNotificationTypes';
import {mapMutations} from 'vuex';

export default {
  data() {
    return {
      alertType: null,
    };
  },
  methods: {
    ...mapMutations('app', ['addAlertNotification']),
    setSuccessAlert(message) {
      this.addAlertNotification({text: message, alertType: ALERT_NOTIFICATION_TYPES.SUCCESS});
    },
    setFailureAlert(message) {
      this.addAlertNotification({text: message, alertType: ALERT_NOTIFICATION_TYPES.ERROR});
    },
    setWarningAlert(message) {
      this.addAlertNotification({text: message, alertType: ALERT_NOTIFICATION_TYPES.WARN});
    }
  }
};
