export default {
  data() {
    return {
      studentUpdateAlert: false,
      studentUpdateAlertMessage: null,
      studentUpdateAlertType: null,
    };
  },
  methods: {
    setWarningAlertForStudentUpdate(message) {
      this.studentUpdateAlertMessage = message;
      this.studentUpdateAlertType = 'bootstrap-warning';
      this.studentUpdateAlert = true;
    },
    resetAlertForStudentUpdate() {
      this.studentUpdateAlert = false;
      this.alertMessage = null;
      this.studentUpdateAlertType = null;
    }
  }
};
