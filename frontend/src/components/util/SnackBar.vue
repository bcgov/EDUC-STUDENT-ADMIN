<template>
  <v-snackbar
    v-model="showSnackBar"
    timeout="5000"
    multi-line
    bottom
    left
    :color="colour"
    text
  >{{ alertNotificationText }}
    <template v-slot:action="{ attrs }">
      <v-btn
        text
        :color="colour"
        v-bind="attrs"
        @click="showSnackBar = false"
      >
        {{ alertNotificationQueue.length > 0 ? 'Next (' + alertNotificationQueue.length + ')' : 'Close' }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>

import {mapMutations, mapState} from 'vuex';
import {ALERT_NOTIFICATION_TYPES} from '../../utils/constants/AlertNotificationTypes';

export default {
  name: 'SnackBar',
  data() {
    return {
      colour: ''
    };
  },
  computed: {
    ...mapState('app', ['alertNotificationText', 'alertNotificationQueue', 'alertNotification']),
    hasNotificationsPending() {
      return this.alertNotificationQueue.length > 0;
    },
    showSnackBar: {
      get(){
        return this.alertNotification;
      },
      set(val){
        this.setAlertNotification(val);
      }
    }
  },
  watch: {
    showSnackBar() {
      if(!this.showSnackBar && this.hasNotificationsPending) {
        let alertObject = this.alertNotificationQueue.shift();
        this.setAlertNotificationText(alertObject.text);
        this.setAlertType(alertObject.alertType);
        this.$nextTick(() => this.showSnackBar = true);
      } else if (this.showSnackBar && this.hasNotificationsPending) {
        let alertObject = this.alertNotificationQueue.shift();
        this.setAlertNotificationText(alertObject.text);
        this.setAlertType(alertObject.alertType);
      }
    },
  },
  methods: {
    ...mapMutations('app', ['setAlertNotificationText', 'setAlertNotification']),
    setAlertType(alertType) {
      if(!alertType) {
        alertType = '';
      }
      switch(alertType.toLowerCase()) {
      case(ALERT_NOTIFICATION_TYPES.ERROR):
        this.colour = ALERT_NOTIFICATION_TYPES.ERROR;
        break;
      case(ALERT_NOTIFICATION_TYPES.WARN):
        this.colour = ALERT_NOTIFICATION_TYPES.WARN;
        break;
      case(ALERT_NOTIFICATION_TYPES.SUCCESS):
        this.colour = ALERT_NOTIFICATION_TYPES.SUCCESS;
        break;
      case(ALERT_NOTIFICATION_TYPES.INFO):
      default:
        this.colour = ALERT_NOTIFICATION_TYPES.INFO;
      }
    }
  }
};
</script>
