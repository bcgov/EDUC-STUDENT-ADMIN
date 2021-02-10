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
        <v-card id="auditHistoryDetail" class="pl-4" height="auto" width="100%" elevation=0>
          <StudentDetailsTextFieldReadOnly :disabled="false"
                                           :model="formatPen(studentHistoryDetail.pen)"
                                           :name="STUDENT_DETAILS_FIELDS.PEN" colspan="4" label="PEN"
                                           labelSpan="4"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :model="getDemogCode()" :name="STUDENT_DETAILS_FIELDS.DEMOG_CODE"
                                           :disabled="false"
                                           :highlight="!!studentHistoryDetail.demogCode_diff" colspan="4"
                                           label="Demog Code"
                                           labelSpan="4"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :disabled="false"
                                           :highlight="!!studentHistoryDetail.legalLastName_diff"
                                           :model="studentHistoryDetail.legalLastName"
                                           :name="STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME" colspan="8"
                                           label="Legal Surname"
                                           labelSpan="4"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :disabled="false"
                                           :highlight="!!studentHistoryDetail.legalFirstName_diff"
                                           :model="studentHistoryDetail.legalFirstName"
                                           :name="STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME" colspan="8"
                                           label="Legal Given"
                                           labelSpan="4"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :disabled="false"
                                           :highlight="!!studentHistoryDetail.legalMiddleNames_diff"
                                           :model="studentHistoryDetail.legalMiddleNames || ''"
                                           :name="STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES" colspan="8"
                                           label="Legal Middle"
                                           labelSpan="4"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :disabled="false"
                                           :highlight="!!studentHistoryDetail.usualLastName_diff"
                                           :model="studentHistoryDetail.usualLastName || ''"
                                           :name="STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME" colspan="8"
                                           label="Usual Surname"
                                           labelSpan="4"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :disabled="false"
                                           :highlight="!!studentHistoryDetail.usualFirstName_diff"
                                           :model="studentHistoryDetail.usualFirstName || ''"
                                           :name="STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME" colspan="8"
                                           label="Usual Given"
                                           labelSpan="4"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :disabled="false"
                                           :highlight="!!studentHistoryDetail.usualMiddleNames_diff"
                                           :model="studentHistoryDetail.usualMiddleNames || ''"
                                           :name="STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES" colspan="8"
                                           label="Usual Middle"
                                           labelSpan="4"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :model="studentHistoryDetail.genderCode || ''"
                                           :disabled="false"
                                           :highlight="!!studentHistoryDetail.genderCode_diff"
                                           :name="STUDENT_DETAILS_FIELDS.GENDER_CODE" colspan="1" label="Gender"
                                           labelSpan="4"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :model="studentHistoryDetail.dob || ''"
                                           :disabled="false"
                                           :highlight="!!studentHistoryDetail.dob_diff"
                                           :name="STUDENT_DETAILS_FIELDS.DOB" colspan="4" label="Date of Birth"
                                           labelSpan="4"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :model="studentHistoryDetail.gradeCode || ''"
                                           :disabled="false"
                                           :grade-level="getGradeLabel()"
                                           :highlight="!!studentHistoryDetail.gradeCode_diff"
                                           :name="STUDENT_DETAILS_FIELDS.GRADE_CODE" colspan="1" label="Grade"
                                           labelSpan="4"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :model="studentHistoryDetail.gradeYear || ''"
                                           :disabled="false"
                                           :highlight="studentHistoryDetail.gradeYear_diff"
                                           :name="STUDENT_DETAILS_FIELDS.GRADE_YEAR" colspan="4"
                                           label="Grade School Year"
                                           labelSpan="4"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :disabled="false"
                                           :highlight="studentHistoryDetail.postalCode_diff"
                                           :model="formatPostalCode(studentHistoryDetail.postalCode)"
                                           :name="STUDENT_DETAILS_FIELDS.POSTAL_CODE" colspan="4" label="Postal Code"
                                           labelSpan="4"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly max-length="9" min-length="8" :name="STUDENT_DETAILS_FIELDS.MINCODE"
                                           :disabled="false"
                                           :has-edits="false" :highlight="studentHistoryDetail.mincode_diff"
                                           :model="formatMincode(studentHistoryDetail.mincode)" colspan="6"
                                           label="Mincode"
                                           labelSpan="4"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :disabled="false"
                                           :highlight="studentHistoryDetail.localID_diff"
                                           :model="studentHistoryDetail.localID || ''"
                                           :name="STUDENT_DETAILS_FIELDS.LOCAL_ID" colspan="6" label="Local ID"
                                           labelSpan="4"></StudentDetailsTextFieldReadOnly>

          <v-row>
            <v-col cols="4">
              <p :class="['labelField', !!studentHistoryDetail.memo_diff && !studentHistoryDetail.memo? 'diff-value' : 'plain-value' ]">
                Memo</p>
            </v-col>
            <v-col class="textAreaColumn mr-2">
              <v-textarea
                  :id='STUDENT_DETAILS_FIELDS.MEMO'
                  v-model="studentHistoryDetail.memo"
                  :class="['onhoverEdit', 'bolder', 'customNoBorder', !!studentHistoryDetail.memo_diff? 'diff-value' : 'plain-value' ]"
                  :disabled="false"
                  :no-resize="true"
                  :outlined="false"
                  :readonly="true"
                  color="#000000"
                  dense
                  maxlength="4000"
                  rows="2"
              ></v-textarea>
            </v-col>
          </v-row>

          <StudentDetailsTextFieldReadOnly :disabled="false" :highlight="!!studentHistoryDetail.statusCode_diff"
                                           :model="getStatusCode()"
                                           :name="STUDENT_DETAILS_FIELDS.STATUS_CODE"
                                           colspan="4" label="Status" labelSpan="4"
                                           no-gutters></StudentDetailsTextFieldReadOnly>
          <v-card-actions class="my-4 py-6">

            <v-spacer></v-spacer>
            <PrimaryButton :secondary="true" class="mx-1" text="Close" @click.native="$emit('close')"></PrimaryButton>
            <PrimaryButton class="mx-1" text="View PEN request"></PrimaryButton>
            <PrimaryButton :loading="isRevertingStudent" class="mx-1" text="Revert"
                           @click.native="revertStudentDataFromStudentHistory()"></PrimaryButton>
          </v-card-actions>

        </v-card>
      </v-col>

    </v-row>
    <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
  </div>
</template>

<script>
import {mapGetters} from 'vuex';
import moment from 'moment';
import {STUDENT_DETAILS_FIELDS} from '@/utils/constants';
import StudentDetailsTextFieldReadOnly from '@/components/penreg/student/StudentDetailsTextFieldReadOnly';
import PrimaryButton from '../../util/PrimaryButton';
import {formatMincode, formatPen, formatPostalCode} from '@/utils/format';
import alertMixin from '../../../mixins/alertMixin';
import ConfirmationDialog from '../../util/ConfirmationDialog';

export default {
  name: 'studentAuditHistoryDetail',
  mixins: [alertMixin],
  props: {
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
    }
  },
  components: {
    StudentDetailsTextFieldReadOnly,
    PrimaryButton,
    ConfirmationDialog,
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
    previousDisabled() {
      return this.rowNumber <= 0;
    },
    nextDisabled() {
      return this.rowNumber >= this.studentHistory.content.length - 1;
    }
  },
  methods: {
    formatPen,
    formatPostalCode,
    formatMincode,
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
      this.$refs.confirmationDialog.open(undefined, `Please confirm that you would like to revert the student's current details to match those in the audit record.`,
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

<style>

div#auditHistoryDetail {
  background-color: rgba(0, 0, 0, 0.06);
}

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

<style scoped>

.diff-value >>> .v-text-field__slot textarea {
  font-weight: bold;
  color: #008000 !important;
}

p.diff-value {
  font-weight: bold;
  color: #008000 !important;
}

</style>
