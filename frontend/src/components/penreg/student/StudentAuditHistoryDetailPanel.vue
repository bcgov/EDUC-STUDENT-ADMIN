<template>
  <div class="full-width mt-n15">

    <v-row>

      <v-col cols="11" class="ml-10">
        <div id="auditHistoryDetailHeader" class="pt-4 pl-2">
          <span id="headerLabel">Changed by</span>
          <span id="headerUser">{{ studentHistoryDetail.updateUser }}</span>
          <span id="headerUpdateDate">{{ frontEndDateFormat(studentHistoryDetail.updateDate) }}</span>
          <span id="headerUpdateTime">at {{ frontEndTimeFormat(studentHistoryDetail.updateDate) }}</span>
          <span class="float-right mt-n2">
            <v-btn
                id="previousHistoryDetail"
                :disabled="previousDisabled"
                class="mr-3"
                dark
                icon
                small
                @click="clickPrevious"
            >
              <v-icon large>fa-arrow-alt-circle-left</v-icon>
            </v-btn>
            <v-btn
                id="nextHistoryDetail"
                :disabled="nextDisabled"
                class="mr-2"
                dark
                icon
                @click="clickNext"
            >
              <v-icon large>fa-arrow-alt-circle-right</v-icon>
            </v-btn>
          </span>
        </div>

        <StudentAuditHistoryDetailCard :studentHistoryDetail="studentHistoryDetail">
          <v-card-actions class="pb-2">
            <v-spacer></v-spacer>
            <PrimaryButton id="closePanel" :secondary="true" class="mx-1" text="Close" @click.native="$emit('close')"></PrimaryButton>
            <SplitPenModal
              :disabled="isSplitPenDisabled || isStudentUpdated"
              :currentStudentDetail="student"
              :studentDetailForRevert="studentDetailForRevert"
              :newStudentDetail="studentHistoryDetail"
              @split="$emit('split')"
            ></SplitPenModal>
            <PrimaryButton id="revertData" :disabled="isRevertDisabled || isStudentUpdated" :loading="isRevertingStudent" class="mx-1" text="Revert"
                           @click.native="revertStudentDataFromStudentHistory()"></PrimaryButton>
          </v-card-actions>

        </StudentAuditHistoryDetailCard>
      </v-col>

    </v-row>
    <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
  </div>
</template>

<script>
import {mapGetters, mapState} from 'vuex';
import moment from 'moment';
import {STUDENT_DETAILS_FIELDS} from '@/utils/constants';
import PrimaryButton from '../../util/PrimaryButton';
import {formatPen, formatPostalCode} from '@/utils/format';
import alertMixin from '../../../mixins/alertMixin';
import ConfirmationDialog from '../../util/ConfirmationDialog';
import SplitPenModal from './SplitPenModal';
import StudentAuditHistoryDetailCard from './StudentAuditHistoryDetailCard';

export default {
  name: 'StudentAuditHistoryDetailPanel',
  mixins: [alertMixin],
  props: {
    student: {
      type: Object,
      required: true
    },
    nextStudentHistoryContent: {
      type: Array,
      required: true
    },
    studentHistory: {
      type: Object,
      required: true
    },
    studentHistoryId: {
      type: String,
      required: true
    },
    isRevertingStudent: {
      type: Boolean,
      defaultValue: false
    },
    isStudentUpdated: {
      type: Boolean,
      defaultValue: false
    }
  },
  components: {
    PrimaryButton,
    ConfirmationDialog,
    SplitPenModal,
    StudentAuditHistoryDetailCard,
  },
  data() {
    return {
      studentHistoryDetail: null,
      rowNumber: 0,
      STUDENT_DETAILS_FIELDS: STUDENT_DETAILS_FIELDS,
    };
  },
  created() {
    this.studentHistory.content.forEach((item, idx) => {
      if (item.studentHistoryID === this.studentHistoryId) {
        this.studentHistoryDetail = item;
        this.rowNumber = idx;
      }
    });
  },
  watch: {
    studentHistoryId(newValue) {
      this.studentHistory.content.forEach((item, idx) => {
        if (item.studentHistoryID === newValue) {
          this.studentHistoryDetail = item;
          this.rowNumber = idx;
        }
      });
    }
  },
  computed: {
    ...mapGetters('student', ['genders', 'demogCodeObjects', 'statusCodeObjects', 'gradeCodeObjects']),
    ...mapState('student', ['studentsInProcess']),
    previousDisabled() {
      return this.rowNumber <= 0;
    },
    nextDisabled() {
      return this.rowNumber >= this.studentHistory.content.length - 1;
    },
    studentDetailForRevert() {
      if (this.rowNumber < this.studentHistory.content.length - 1) {
        return this.studentHistory.content[this.rowNumber + 1];
      } else {
        return this.nextStudentHistoryContent[0];
      }
    },
    isSplitPenDisabled() {
      return this.studentHistory?.totalElements === 1 || !this.studentDetailForRevert || this.hasSagaInProgress;
    },
    isRevertDisabled() {
      return this.studentHistory?.content?.length === 1 || this.hasSagaInProgress;
    },
    hasSagaInProgress() {
      return this.student && (this.student.sagaInProgress || this.studentsInProcess.has(this.student.studentID));
    },
  },
  methods: {
    formatPen,
    formatPostalCode,
    clickPrevious() {
      if (this.rowNumber > 0) {
        this.rowNumber -= 1;
        this.studentHistoryDetail = this.studentHistory.content[this.rowNumber];
        this.$emit('update', this.studentHistoryDetail.studentHistoryID);
      }
    },
    clickNext() {
      if (this.rowNumber < this.studentHistory.content.length - 1) {
        this.rowNumber += 1;
        this.studentHistoryDetail = this.studentHistory.content[this.rowNumber];
        this.$emit('update', this.studentHistoryDetail.studentHistoryID);
      }
    },
    revertStudentDataFromStudentHistory() {
      const opts = {
        width: '680px',
        messagePadding: 'px-4 pt-1',
        color: '',
        dark: false,
        titleBold: true,
        closeIcon: true,
        divider: false,
        resolveText: 'Confirm'
      };
      this.$refs.confirmationDialog.open(undefined, 'Please confirm that you would like to revert the student\'s current details to match those in the audit record.',
        opts)
        .then((result) => {
          if (result) { // the component returns true only when user confirms the dialog.
            this.studentHistoryDetail = this.studentHistory.content[this.rowNumber];
            this.$emit('revert', this.studentHistoryDetail);
          }
        });


    },
    frontEndDateFormat(date) {
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('YYYY/MM/DD');
    },
    frontEndTimeFormat(date) {
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('HH:mm');
    },
    getGradeLabel() {
      return this.studentHistoryDetail.gradeCode ? this.gradeCodeObjects.filter(it => (it.gradeCode === this.studentHistoryDetail.gradeCode))[0].label : '';
    },
    getStatusCode() {
      return this.studentHistoryDetail.statusCode ? this.statusCodeObjects.filter(it => (it.statusCode === this.studentHistoryDetail.statusCode))[0].label : '';
    },
    getDemogCode() {
      return this.studentHistoryDetail.demogCode ? this.demogCodeObjects.filter(it => (it.demogCode === this.studentHistoryDetail.demogCode))[0].label : '';
    },
  }
};
</script>

<style scoped>

div#auditHistoryDetailHeader {
  background-color: rgb(56, 89, 138);
  color: white;
  height: 50px;
}

span#headerLabel {
  margin-top: 5px;
  margin-left: 5px;
  font-weight: bold;
}

span#headerUser {
  margin-top: 10px;
  margin-left: 5px;
}

span#headerUpdateDate {
  margin-top: 10px;
  margin-left: 8px;
  font-size: 14px;
}

span#headerUpdateTime {
  margin-top: 10px;
  margin-left: 6px;
  font-size: 14px;
}

#previousHistoryDetail.v-btn--disabled .v-icon,
#nextHistoryDetail.v-btn--disabled .v-icon {
  background-color: rgba(255, 255, 255, 0.80) !important;
  color: white !important;
  border-radius: 50%;
}

</style>
