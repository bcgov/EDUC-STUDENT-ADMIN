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
  }
};
