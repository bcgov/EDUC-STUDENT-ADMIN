<template>
  <v-dialog
    id="splitPenModal"
    v-model="modalOpen"
    persistent
    max-width="80%"
    :disabled="disabled"
  >
    <template v-slot:activator="{ on, attrs }">
      <PrimaryButton
        id="splitPen"
        class="mx-1"
        text="Split PEN"
        :disabled="disabled"
        @click.native="openModal"
        :bind="attrs"
        :on="on"
      ></PrimaryButton>
    </template>
    <v-card fluid class="px-4">
      <v-row>
        <v-col cols="6">
          <v-row no-gutters>
            <v-col cols="4" class="title">
              <h4>Current PEN</h4>
            </v-col>
            <v-col>
              <v-checkbox
                class="ma-0 pa-0 ml-4 mt-1"
                height="100%"
                label="Revert"
                color="#606060"
                dense
                v-model="revertCurrentStudent"
                :disabled="!studentDetailForRevert"
              ></v-checkbox>
            </v-col>
          </v-row>
          <StudentAuditHistoryDetailCard
            :studentHistoryDetail="studentDetail"
            :highlightDiff="false"
            idPrefix="current"
          ></StudentAuditHistoryDetailCard>
        </v-col>
        <v-col cols="6">
          <div class="title d-flex justify-space-between">
            <h4>New PEN</h4>
            <v-btn id="closeModalBtn" text icon @click="closeModal">
              <v-icon large color="#38598A">mdi-close</v-icon>
            </v-btn>
          </div>
          <StudentAuditHistoryDetailCard
            :studentHistoryDetail="newStudentDetail"
            :highlightDiff="false"
            idPrefix="new"
          ></StudentAuditHistoryDetailCard>
        </v-col>
      </v-row>
      <v-row>
        <AlertMessage v-model="alert" :alertMessage="alertMessage" :alertType="alertType" :timeoutMs="3000" class="mt-2"></AlertMessage>
      </v-row>
      <v-card-actions class="pt-0 pr-0">
        <v-spacer></v-spacer>
        <PrimaryButton id="closeSplitPenModal" class="mx-1" text="Cancel" secondary @click.native="closeModal"></PrimaryButton>
        <PrimaryButton id="acceptSplitPen" class="mx-1" text="Accept" :disabled="hasSagaInProgress" :loading="isProcessing" @click.native="splitPen"></PrimaryButton>
        <PrimaryButton id="searchPen" class="ml-1" text="Search" @click.native="searchPen"></PrimaryButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import PrimaryButton from '../../util/PrimaryButton';
import StudentAuditHistoryDetailCard from './StudentAuditHistoryDetailCard';
import router from '../../../router';
import {Routes} from '@/utils/constants';
import AlertMessage from '../../util/AlertMessage';
import ApiService from '../../../common/apiService';
import alertMixin from '../../../mixins/alertMixin';
import {mapGetters, mapMutations, mapState} from 'vuex';

export default {
  name: 'SplitPenModal',
  mixins: [alertMixin],
  components: {
    StudentAuditHistoryDetailCard,
    PrimaryButton,
    AlertMessage
  },
  props: {
    disabled: {
      type: Boolean,
      required: true
    },
    currentStudentDetail: {
      type: Object,
      required: true
    },
    studentDetailForRevert: {
      type: Object,
    },
    newStudentDetail: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      studentDetail: null,
      revertCurrentStudent: false,
      modalOpen: false,
      isProcessing: false,
    };
  },
  computed: {
    ...mapState('student', ['studentsInProcess']),
    ...mapGetters('notifications', ['notification']),
    hasSagaInProgress() {
      return this.studentDetail && (this.studentDetail.sagaInProgress || this.studentsInProcess.has(this.studentDetail.studentID));
    },
  },
  created() {
    this.studentDetail = this.currentStudentDetail;
  },
  watch: {
    revertCurrentStudent(newValue) {
      if(newValue) {
        this.studentDetail = this.studentDetailForRevert;
      } else {
        this.studentDetail = this.currentStudentDetail;
      }
    },
    notification(notificationData) {
      if (notificationData) {
        if (notificationData.eventType === 'UPDATE_STUDENT' && notificationData.eventOutcome === 'STUDENT_UPDATED' && notificationData.eventPayload) {
          try {
            const student = JSON.parse(notificationData.eventPayload);
            if (student?.pen && student?.pen === this.studentDetail?.pen) {
              this.setWarningAlert(`student details for ${student.pen} is updated by ${student.updateUser}, please refresh the page.`);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    },
  },
  methods: {
    ...mapMutations('student', ['setStudentInProcessStatus', 'resetStudentInProcessStatus']),
    openModal() {
      this.modalOpen = true;
    },
    closeModal() {
      this.modalOpen = false;
      this.revertCurrentStudent = false;
    },
    splitPen() {
      this.isProcessing = true;
      this.setStudentInProcessStatus(this.studentDetail.studentID);
      const request = {
        ...this.studentDetail,
        requestStudentID: this.studentDetail.studentID,
        historyActivityCode: 'SPLITNEW',
        newStudent: {
          ..._.omitBy(this.newStudentDetail, (_, key) => key.includes('_diff')),
          studentID: null,
          pen: null,
          historyActivityCode: 'SPLITNEW'
        }
      };
      const params = {
        penNumbersInOps: this.studentDetail.pen
      };
      ApiService.apiAxios
        .post(`${Routes['penServices'].ROOT_ENDPOINT}/${this.studentDetail.studentID}/split-pen`, request,{params})
        .then(() => {
          this.closeModal();
          this.$emit('split');
        })
        .catch(error => {
          console.error(error);
          this.resetStudentInProcessStatus(this.studentDetail.studentID);
          if (error?.response?.data?.code === 409) {
            this.setFailureAlert(error?.response?.data?.message);
          } else {
            this.setFailureAlert('Your request to split pen could not be accepted. Please try again later.');
          }
        })
        .finally(() => {
          this.isProcessing = false;
        });
    },
    searchPen() {
      const searchParams = {
        legalLastName: this.newStudentDetail.legalLastName,
        legalFirstName: this.newStudentDetail.legalFirstName,
        legalMiddleNames: this.newStudentDetail.legalMiddleNames,
        postalCode: this.newStudentDetail.postalCode,
        genderCode: this.newStudentDetail.genderCode,
        dob: this.newStudentDetail.dob?.replace(/-/g,'/'),
        mincode: this.newStudentDetail.mincode,
        usualLastName: this.newStudentDetail.usualLastName,
        usualFirstName: this.newStudentDetail.usualFirstName,
        usualMiddleNames: this.newStudentDetail.usualMiddleNames,
        localID: this.newStudentDetail.localID,
        gradeCode: this.newStudentDetail.gradeCode
      };

      const route = router.resolve({ name: 'basicSearch', query: { ...searchParams }});
      window.open(route.href, '_blank');
    }
  }
};
</script>

<style scoped>
  #studentSearchCompareButton {
    float: right;
  }
  .title{
    padding-top: 9px;
    padding-bottom: 11px;
  }
</style>
