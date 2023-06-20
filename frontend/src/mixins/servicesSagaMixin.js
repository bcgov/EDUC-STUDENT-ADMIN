import ApiService from '@/common/apiService';
import {REQUEST_TYPES, Routes} from '@/utils/constants';
import router from '@/router';
import {mapActions, mapState} from 'pinia';
import {studentStore} from '@/store/modules/student';

export default {
  data() {
    return {
      mergedToStudent: null,
      mergedFromStudent: null,
      isProcessing: false,
      mergeSagaComplete: false,
      demergeSagaComplete: false,
      sagaId: undefined,
    };
  },
  computed: {
    ...mapState(studentStore, ['studentsInProcess'])
  },
  methods: {
    ...mapActions(studentStore, ['setStudentInProcessStatus', 'resetStudentInProcessStatus']),
    notifyMergeSagaCompleteMessage() {
      this.setSuccessAlert('Success! Your request to merge is completed.');
      this.isProcessing = false;
      this.mergeSagaComplete = true;
      this.openStudentDetails(this.mergedToStudent.studentID);
    },
    notifyDemergeSagaCompleteMessage() {
      this.setSuccessAlert('Success! Your request to demerge is completed.');
      this.isProcessing = false;
      this.demergeSagaComplete = true;
    },
    hasSagaInProgress(...students) {
      return students.some(student => student && (student.sagaInProgress || this.studentsInProcess.has(student.studentID)));
    },
    openStudentDetails(studentID) {
      const route = router.resolve({ name: REQUEST_TYPES.student.label, params: {studentID: studentID}});
      window.open(route.href, '_blank');
    },
    openStudentDetailsCurrentTab(studentID) {
      const route = router.resolve({ name: REQUEST_TYPES.student.label, params: {studentID: studentID}});
      window.open(route.href,'_self');
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
      this.setStudentInProcessStatus(this.mergedToStudent.studentID);
      this.isProcessing = true;
      const mergeRequest = {...this.mergedToStudent,
        mergedToPen: this.mergedToStudent.pen,
        mergeStudentID: this.mergedFromStudent.studentID,
        mergedFromPen: this.mergedFromStudent.pen,
        studentMergeDirectionCode: 'FROM',
        studentMergeSourceCode: 'MINISTRY',
        requestStudentID: null
      };
      const params = {
        penNumbersInOps: `${this.mergedToStudent.pen},${this.mergedFromStudent.pen}`
      };
      ApiService.apiAxios
        .post(Routes['penServices'].ROOT_ENDPOINT + '/' + mergeRequest.studentID + '/student-merge-complete', mergeRequest, {params})
        .then((result) => {
          this.setSuccessAlert('Your request to merge is accepted.');
          this.sagaId = result.data;
        })
        .catch(error => {
          console.log(error);
          this.isProcessing = false;
          this.resetStudentInProcessStatus(this.mergedToStudent.studentID);
          if (error?.response?.status === 409 && error?.response?.data?.message) {
            this.setFailureAlert(error?.response?.data?.message);
          } else {
            this.setFailureAlert('Student Merge Request failed to update. Please navigate to the student search and merge again at compare in the list.');
          }
        });
    },
    async executeDemerge() {
      // Student Demerge Complete Request
      this.setStudentInProcessStatus(this.mergedFromStudent.studentID);
      this.isProcessing = true;
      const demergeRequest = {
        studentID: this.mergedFromStudent.studentID,
        mergedToPen: this.mergedToStudent.pen,
        mergedToStudentID: this.mergedToStudent.studentID,
        mergedFromPen: this.mergedFromStudent.pen,
        mergedFromStudentID: this.mergedFromStudent.studentID,
        requestStudentID: null
      };
      const params = {
        penNumbersInOps: `${this.mergedToStudent.pen},${this.mergedFromStudent.pen}`
      };
      ApiService.apiAxios
        .post(Routes['penServices'].ROOT_ENDPOINT + '/' + demergeRequest.studentID + '/student-demerge-complete', demergeRequest, {params})
        .then((result) => {
          this.setSuccessAlert('Your request to demerge is accepted.');
          this.sagaId = result.data;
        })
        .catch(error => {
          console.error(error);
          this.resetStudentInProcessStatus(this.mergedFromStudent.studentID);
          this.isProcessing = false;
          if (error?.response?.status === 409 && error?.response?.data?.message) {
            this.setFailureAlert(error?.response?.data?.message);
          } else {
            this.setFailureAlert('Student Demerge Request failed to update. Please navigate to the student search and demerge again at compare in the list.');
          }
        });
    }
  }
};
