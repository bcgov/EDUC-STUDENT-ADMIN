import ApiService from '@/common/apiService';
import {REQUEST_TYPES, Routes} from '@/utils/constants';
import {mapGetters} from 'vuex';
import router from '@/router';

export default {
  computed: {
    ...mapGetters('notifications', ['notification'])
  },
  watch: {
    notification(val) {
      if (val) {
        const notificationData = JSON.parse(val);
        if (notificationData && notificationData.studentID && notificationData.studentID === this.mergedToStudent.studentID && notificationData.sagaStatus === 'COMPLETED') {
          if (notificationData.sagaName === 'PEN_SERVICES_STUDENT_MERGE_COMPLETE_SAGA') {
            this.setSuccessAlert('Success! Your request to merge is completed.');
            this.isProcessing = false;
            this.mergeSagaComplete = true;
          }
        } else if (notificationData && notificationData.studentID && notificationData.studentID === this.mergedFromStudent.studentID && notificationData.sagaStatus === 'COMPLETED') {
          if (notificationData.sagaName === 'PEN_SERVICES_STUDENT_DEMERGE_COMPLETE_SAGA') {
            this.setSuccessAlert('Success! Your request to demerge is completed.');
            this.isProcessing = false;
            this.demergeSagaComplete = true;
            if (this.demergeFromStudentDetail) { // demerge is initiated from student detail.
              setTimeout(() => {
                this.$emit('refresh'); // wait 1000 ms for the user to see saga complete banner, and then refresh the page.
              }, 1000);
            } else { // demerge is initiated from compare students view.
              setTimeout(() => {
                this.openStudentDetails(this.mergedFromStudent.studentID); // open mergedFromStudent in a new tab
              }, 500);
            }
            // demerge is initiated from either student detail or compare students view.
            setTimeout(() => {
              this.openStudentDetails(this.mergedToStudent.studentID); // open mergedToStudent in a new tab
            }, 500);
          }
        }
      }
    },
  },
  data() {
    return {
      mergedToStudent: null,
      mergedFromStudent: null,
      isProcessing: false,
      mergeSagaComplete: false,
      demergeSagaComplete: false,
      demergeFromStudentDetail: false, // if true, demerge is initiated from student detail page.  otherwise it is from compare students view.
    };
  },
  methods: {
    openStudentDetails(studentID) {
      const route = router.resolve({ name: REQUEST_TYPES.student.label, params: {studentID: studentID}});
      window.open(route.href, '_blank');
    },
    getMergedToPen() {
      if (this.mergedToStudent) {
        return this.mergedToStudent.pen;
      }
      return '';
    },
    getMergedFromPen() {
      if (this.mergedFromStudent) {
        return this.mergedFromStudent.pen;
      }
      return '';
    },
    validateStudentsHaveSamePen(student1, student2, message) {
      if (student1.pen === student2.pen) {
        this.setFailureAlert(message);
        return true;
      }
      return false;
    },
    validateStudentIsStatusOfMerged(student1, student2, message) {
      if (student1.statusCode === 'M' || student2.statusCode === 'M') {
        this.setFailureAlert(message);
        return true;
      }
      return false;
    },
    validateStudentsAreMerged(student1, student2) {
      if ((student1.statusCode === 'M' && student2.statusCode === 'A')
        || (student2.statusCode === 'M' && student1.statusCode === 'A')) {
        if (student1.trueStudentID === student2.studentID || student2.trueStudentID === student1.studentID) {
          return true;
        }
      }
      return false;
    },
    validateStudentHasAnyMergedFrom(studentID) {
      return ApiService.apiAxios
        .get(Routes['penServices'].ROOT_ENDPOINT + '/' + studentID + '/student-merge', {params: {mergeDirection: 'FROM'}})
        .then(response => {
          if (response.data && response.data.length > 0) {
            this.setFailureAlert('Error! PENs cannot be merged, as the PEN selected to be the \'merged from PEN\' has been involved in a merge. It must first be demerged, before this merge can be executed.');
            return true;
          } else {
            return false;
          }
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while loading the student merge in validation. Please try again later.');
          console.log(error);
          return true;  // set true to make the validation failed
        });
    },
    async executeMerge() {
      // Student Merge Complete Request
      this.alert = false;
      this.isProcessing = true;
      const mergeRequest = {...this.mergedToStudent,
        mergedToPen: this.mergedToStudent.pen,
        mergeStudentID: this.mergedFromStudent.studentID,
        mergedFromPen: this.mergedFromStudent.pen,
        studentMergeDirectionCode: 'FROM',
        studentMergeSourceCode: 'MI',
        requestStudentID: null
      };
      ApiService.apiAxios
        .post(Routes['penServices'].ROOT_ENDPOINT + '/' + mergeRequest.studentID + '/student-merge-complete', mergeRequest)
        .then(() => {
          this.setSuccessAlert('Your request to merge is accepted.');
        })
        .catch(error => {
          console.log(error);
          this.isProcessing = false;
          if (error.response.data && error.response.data.code && error.response.data.code === 409) {
            this.setFailureAlert('Another saga is in progress for this request, please try again later.');
          } else {
            this.setFailureAlert('Student Merge Request failed to update. Please navigate to the student search and merge again at compare in the list.');
          }
        });
    },
    async executeDemerge() {
      // Student Demerge Complete Request
      this.alert = false;
      this.isProcessing = true;
      const demergeRequest = {
        studentID: this.mergedFromStudent.studentID,
        mergedToPen: this.mergedToStudent.pen,
        mergedToStudentID: this.mergedToStudent.studentID,
        mergedFromPen: this.mergedFromStudent.pen,
        mergedFromStudentID: this.mergedFromStudent.studentID,
        requestStudentID: null
      };
      ApiService.apiAxios
        .post(Routes['penServices'].ROOT_ENDPOINT + '/' + demergeRequest.studentID + '/student-demerge-complete', demergeRequest)
        .then(() => {
          this.setSuccessAlert('Your request to demerge is accepted.');
        })
        .catch(error => {
          console.log(error);
          this.isProcessing = false;
          if (error.response.data && error.response.data.code && error.response.data.code === 409) {
            this.setFailureAlert('Another saga is in progress for this request, please try again later.');
          } else {
            this.setFailureAlert('Student Demerge Request failed to update. Please navigate to the student search and demerge again at compare in the list.');
          }
        });
    }
  }
};
