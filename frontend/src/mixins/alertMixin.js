export default {
  data() {
    return {
      alert: false,
      alertMessage: null,
      alertType: null,
    };
  },
  methods: {
    setSuccessAlert(message) {
      this.alertMessage = message;
      this.alertType = 'bootstrap-success';
      this.alert = true;
    },
    setFailureAlert(message) {
      this.alertMessage = message;
      this.alertType = 'bootstrap-error';
      this.alert = true;
    },
    setWarningAlert(message) {
      this.alertMessage = message;
      this.alertType = 'bootstrap-warning';
      this.alert = true;
    },
    resetAlert() {
      this.alert = false;
      this.alertMessage = null;
      this.alertType = null;
    }
  }
};
