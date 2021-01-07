<template>
  <div class="full-width mt-n15">
    <v-row>
      <v-col cols="11" class="ml-10">
        <div id="auditHistoryDetailHeader" class="pt-4 pl-2">
          <span id="headerLabel">Changed by</span>
          <span id="headerUser">{{studentHistoryDetail.updateUser}}</span>
          <span id="headerUpdateDate">{{frontEndDateFormat(studentHistoryDetail.updateDate)}}</span>
          <span id="headerUpdateTime">at {{frontEndTimeFormat(studentHistoryDetail.updateDate)}}</span>
          <span class="float-right mt-n2"> 
            <v-btn 
              class="mr-3"
              id="previousHistoryDetail"
              icon
              dark
              small
              :disabled="previousDisabled"
              @click="clickPrevious"
            >
              <v-icon large>fa-arrow-alt-circle-left</v-icon>
            </v-btn >
            <v-btn 
              class="mr-2"
              id="nextHistoryDetail"
              icon
              dark
              :disabled="nextDisabled"
              @click="clickNext"
            >
              <v-icon large>fa-arrow-alt-circle-right</v-icon>
            </v-btn>
          </span>
        </div>
        <v-card id="auditHistoryDetail" class="pl-4" height="auto" width="100%" elevation=0>
          <StudentDetailsTextFieldReadOnly :model="formatPen(studentHistoryDetail.pen)" :name="STUDENT_DETAILS_FIELDS.PEN"
                                            labelSpan="4" colspan="4" label="PEN"
                                            :disabled="false"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :model="getDemogCode()" :name="STUDENT_DETAILS_FIELDS.DEMOG_CODE"
                                            :highlight="!!studentHistoryDetail.demogCode_diff"
                                            labelSpan="4" colspan="4" label="Demog Code"
                                            :disabled="false"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :model="studentHistoryDetail.legalLastName" :name="STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME"
                                            :highlight="!!studentHistoryDetail.legalLastName_diff"
                                            labelSpan="4" colspan="8" label="Legal Surname"
                                            :disabled="false"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :model="studentHistoryDetail.legalFirstName" :name="STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME"
                                            :highlight="!!studentHistoryDetail.legalFirstName_diff"
                                            labelSpan="4" colspan="8" label="Legal Given"
                                            :disabled="false"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :model="studentHistoryDetail.legalMiddleNames || ''" :name="STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES"
                                            :highlight="!!studentHistoryDetail.legalMiddleNames_diff"
                                            labelSpan="4" colspan="8" label="Legal Middle"
                                            :disabled="false"></StudentDetailsTextFieldReadOnly>
          
          <StudentDetailsTextFieldReadOnly :model="studentHistoryDetail.usualLastName || ''" :name="STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME"
                                            :highlight="!!studentHistoryDetail.usualLastName_diff"
                                            labelSpan="4" colspan="8" label="Usual Surname"
                                            :disabled="false"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :model="studentHistoryDetail.usualFirstName || ''" :name="STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME"
                                            labelSpan="4" colspan="8" label="Usual Given"
                                            :highlight="!!studentHistoryDetail.usualFirstName_diff"
                                            :disabled="false"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :model="studentHistoryDetail.usualMiddleNames || ''" :name="STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES"
                                            labelSpan="4" colspan="8" label="Usual Middle"
                                            :highlight="!!studentHistoryDetail.usualMiddleNames_diff"
                                            :disabled="false"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :model="studentHistoryDetail.genderCode || ''"
                                            :highlight="!!studentHistoryDetail.genderCode_diff"
                                            :name="STUDENT_DETAILS_FIELDS.GENDER_CODE" 
                                            labelSpan="4" colspan="1" label="Gender"
                                            :disabled="false"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :model="studentHistoryDetail.dob || ''"
                                            :highlight="!!studentHistoryDetail.dob_diff"
                                            :name="STUDENT_DETAILS_FIELDS.DOB" 
                                            labelSpan="4" colspan="4" label="Date of Birth"
                                            :disabled="false"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :model="studentHistoryDetail.gradeCode || ''"
                                            :highlight="!!studentHistoryDetail.gradeCode_diff"
                                            :name="STUDENT_DETAILS_FIELDS.GRADE_CODE" 
                                            labelSpan="4" colspan="1" label="Grade" :grade-level="getGradeLabel()"
                                            :disabled="false"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :model="studentHistoryDetail.gradeYear || ''"
                                            :highlight="studentHistoryDetail.gradeYear_diff"
                                            :name="STUDENT_DETAILS_FIELDS.GRADE_YEAR"
                                            labelSpan="4" colspan="4" label="Grade School Year"
                                            :disabled="false"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :model="formatPostalCode(studentHistoryDetail.postalCode)" :name="STUDENT_DETAILS_FIELDS.POSTAL_CODE"
                                          :highlight="studentHistoryDetail.postalCode_diff"
                                          labelSpan="4" colspan="4" label="Postal Code"
                                          :disabled="false"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly max-length="9" min-length="8" :name="STUDENT_DETAILS_FIELDS.MINCODE"
                                    :highlight="studentHistoryDetail.mincode_diff"
                                    :model="formatMincode(studentHistoryDetail.mincode)" :has-edits="false"
                                    labelSpan="4" colspan="6" label="Mincode" 
                                    :disabled="false"></StudentDetailsTextFieldReadOnly>

          <StudentDetailsTextFieldReadOnly :model="studentHistoryDetail.localID || ''" :name="STUDENT_DETAILS_FIELDS.LOCAL_ID"
                                            :highlight="studentHistoryDetail.localID_diff"
                                            labelSpan="4" colspan="6" label="Local ID"
                                            :disabled="false"></StudentDetailsTextFieldReadOnly>

          <v-row>
            <v-col cols="4">
              <p :class="['labelField', !!studentHistoryDetail.memo_diff && !studentHistoryDetail.memo? 'diff-value' : 'plain-value' ]">Memo</p>
            </v-col>
            <v-col class="textAreaColumn mr-2">
              <v-textarea
                :class="['onhoverEdit', 'bolder', 'customNoBorder', !!studentHistoryDetail.memo_diff? 'diff-value' : 'plain-value' ]"
                v-model="studentHistoryDetail.memo"
                :id='STUDENT_DETAILS_FIELDS.MEMO'
                color="#000000"
                maxlength="4000"
                dense
                rows="2"
                :readonly="true"
                :outlined="false"
                :disabled="false"
                :no-resize="true"
              ></v-textarea>
            </v-col>
          </v-row>

          <StudentDetailsTextFieldReadOnly no-gutters :model="getStatusCode()" :name="STUDENT_DETAILS_FIELDS.STATUS_CODE"
                                            :highlight="!!studentHistoryDetail.statusCode_diff"
                                            labelSpan="4" colspan="4" label="Status"
                                            :disabled="false"></StudentDetailsTextFieldReadOnly>
          <v-card-actions class="my-4 py-6">
            <v-spacer></v-spacer>
            <PrimaryButton :secondary="true" class="mx-1" text="Close" @click.native="$emit('close')"></PrimaryButton>
            <PrimaryButton class="mx-1" text="View PEN request"></PrimaryButton>
            <PrimaryButton class="mx-1" text="Revert"></PrimaryButton>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {mapGetters} from 'vuex';
import moment from 'moment';
import {STUDENT_DETAILS_FIELDS} from '@/utils/constants';
import StudentDetailsTextFieldReadOnly from '@/components/penreg/student/StudentDetailsTextFieldReadOnly';
import PrimaryButton from '../../util/PrimaryButton';
import {formatMincode, formatPen, formatPostalCode} from '../../../utils/format';
import alertMixin from '../../../mixins/alertMixin';

export default {
  name: 'studentAudtiHistoryDetail',
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
  },
  components: {
    StudentDetailsTextFieldReadOnly,
    PrimaryButton,
  },
  data() {
    return {
      studentHistoryDetail: null,
      rowNumber: 0,
      STUDENT_DETAILS_FIELDS:STUDENT_DETAILS_FIELDS,
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
    frontEndDateFormat(date) {
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('YYYY/MM/DD');
    },
    frontEndTimeFormat(date) {
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('HH:mm');
    },
    getGradeLabel() {
      return this.studentHistoryDetail.gradeCode? this.gradeCodeObjects.filter(it => (it.gradeCode === this.studentHistoryDetail.gradeCode))[0].label : '';
    },
    getStatusCode(){
      return this.studentHistoryDetail.statusCode? this.statusCodeObjects.filter(it => (it.statusCode === this.studentHistoryDetail.statusCode))[0].label : '';
    },
    getDemogCode(){
      return this.studentHistoryDetail.demogCode? this.demogCodeObjects.filter(it => (it.demogCode === this.studentHistoryDetail.demogCode))[0].label : '';
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
