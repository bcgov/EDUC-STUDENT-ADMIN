<template>
  <div
    @mouseover="pause = true"
    @mouseleave="pause = false">
    <v-snackbar
      v-model="showSnackBar"
      :timeout="timeout"
      elevation="24"
      top
      centered
      :color="colour"
      transition="slide-y-transition"
      class="snackbar"
    >
      <div v-html="alertNotificationText"></div>
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          color="white"
          v-bind="attrs"
          @click="showSnackBar = false"
        >
          {{ alertNotificationQueue.length > 0 ? 'Next (' + alertNotificationQueue.length + ')' : 'Close' }}
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>

import {mapMutations, mapState} from 'vuex';
import {ALERT_NOTIFICATION_TYPES} from '../../utils/constants/AlertNotificationTypes';

export default {
  name: 'SnackBar',
  data() {
    return {
      colour: '',
      polling: null,
      timeout: 5000,
      pause: false
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
        this.$nextTick(() => this.showSnackBar = true);
      } else if (this.showSnackBar && this.hasNotificationsPending) {
        this.setupSnackBar();
      }
      else {
        this.teardownSnackBar();
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
    },
    setupSnackBar() {
      let alertObject = this.alertNotificationQueue.shift();
      this.setAlertNotificationText(alertObject.text);
      this.setAlertType(alertObject.alertType);
      document.addEventListener('keydown', this.close);
      if (alertObject.alertType === ALERT_NOTIFICATION_TYPES.ERROR) {
        this.timeout = 8000;
      } else {
        this.timeout = 5000;
      }
      this.timeoutCounter();
    },
    teardownSnackBar() {
      document.removeEventListener('keydown', this.close);
      clearInterval(this.polling);
    },
    close(e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && this.showSnackBar) {
        this.showSnackBar = false;
      }
    },
    timeoutCounter() {
      this.polling = setInterval(() => {
        if(this.pause) {
          this.timeout += 1;
        }
      }, 1000);
    }
  }
};
</script>

<style>
  .snackbar {
    padding: 0 !important;
  }
</style>

