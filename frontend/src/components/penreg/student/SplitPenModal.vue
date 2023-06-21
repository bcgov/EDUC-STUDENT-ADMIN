<template>
  <v-dialog
    id="splitPenModal"
    v-model="modalOpen"
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
      <v-card-title class="px-0 pb-0 pt-5">
      </v-card-title>
      <v-row>
        <v-col cols="6" class="pt-0">
          <v-row no-gutters>
            <v-col cols="4" class="title pt-0">
              <h4>Current PEN</h4>
            </v-col>
            <v-col class="pt-0">
              <v-checkbox
                id="revertCheckbox"
                class="split-checkbox ma-0 pa-0 ml-4 mt-1"
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
        <v-col cols="6" class="pt-0">
          <div class="title d-flex justify-space-between pt-0">
            <h4>New PEN</h4>
            <v-btn id="closeModalBtn" text icon @click="closeModal">
              <v-icon large color="#38598A">mdi-close</v-icon>
            </v-btn>
          </div>
          <StudentAuditHistoryDetailCard
            :studentHistoryDetail="newStudentDetail"
            :highlightDiff="false"
            idPrefix="new"
            :showPEN=false
          ></StudentAuditHistoryDetailCard>
        </v-col>
      </v-row>
      <v-card-actions class="pt-0 pr-0">
        <v-spacer></v-spacer>
        <PrimaryButton id="closeSplitPenModal" class="mx-1" text="Cancel" secondary @click.native="closeModal"></PrimaryButton>
        <PrimaryButton id="acceptSplitPen" :disabled="hasSagaInProgress" :loading="isProcessing" class="mx-1"
                       text="Accept" @click.native="splitPen"></PrimaryButton>
        <PrimaryButton id="searchPen" class="ml-1" text="Search" @click.native="searchPen"></PrimaryButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import PrimaryButton from '../../util/PrimaryButton.vue';
import StudentAuditHistoryDetailCard from './StudentAuditHistoryDetailCard.vue';
import router from '../../../router';
import {Routes} from '@/utils/constants';
import ApiService from '../../../common/apiService';
import alertMixin from '../../../mixins/alertMixin';
import {mapActions, mapState} from 'pinia';
import staleStudentRecordMixin from '@/mixins/staleStudentRecordMixin';
import {notificationsStore} from '@/store/modules/notifications';
import {studentStore} from '@/store/modules/student';

export default {
  name: 'SplitPenModal',
  mixins: [alertMixin, staleStudentRecordMixin],
  components: {
    StudentAuditHistoryDetailCard,
    PrimaryButton,
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
    },
    isStudentUpdated: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      studentDetail: null,
      revertCurrentStudent: false,
      modalOpen: false,
      isProcessing: false,
      isStudentDataUpdated: false,
    };
  },
  computed: {
    ...mapState(studentStore, ['studentsInProcess']),
    ...mapState(notificationsStore, ['notification']),
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
            if (student?.pen && student?.pen === this.studentDetail?.pen && !this.hasSagaInProgress) { // dont show if it is part of the saga.
              this.isStudentDataUpdated = true;
              const warningMessage = `Student details for ${student.pen}, is updated by ${student.updateUser}. Please refresh the page`;
              const studentID = student.studentID;
              this.addStaleDataToMap({studentID, warningMessage});
              this.$emit('isStudentUpdated', true);
              this.setWarningAlert(warningMessage);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    },
  },
  methods: {
    ...mapActions(studentStore, ['setStudentInProcessStatus', 'resetStudentInProcessStatus']),
    openModal() {
      this.modalOpen = true;
    },
    closeModal() {
      this.modalOpen = false;
      this.revertCurrentStudent = false;
    },
    splitPen() {
      if (this.isStudentDataUpdated || this.isStudentUpdated) {
        const warningMessage = this.getMessageForStudent(this.studentDetail?.studentID);
        this.setWarningAlert(warningMessage);
        return;
      }
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
        .post(`${Routes['penServices'].ROOT_ENDPOINT}/${this.studentDetail.studentID}/split-pen`, request, {params})
        .then((response) => {
          const sagaId = response.data;
          this.$emit('split', sagaId);
          this.closeModal();
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
  .split-checkbox /deep/ .v-input__slot {
    padding-top: 0;
  }
</style>
