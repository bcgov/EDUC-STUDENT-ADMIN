<template>
  <v-dialog
          id="studentDetailDialog"
          v-model="studentDetailDialogOpen"
          max-width="1024px"
  >
    <template v-slot:activator="{ on, attrs }">
      <a class="pen-link" id="studentDetailDialogLink" v-bind="attrs" v-on="on">
        <span :class="['top-column-item', 'pen-link', isMatched?'font-weight-bold':'']">
          {{formatPen(pen)}}
        </span>
      </a>
    </template>
    <v-card class="studentDetailDialogCard fill-height ma-0 pa-4" v-if="!isLoading">

      <v-col cols="12" class="fill-height ma-0 px-4 py-0">
        <v-row>
          <v-col cols="3" class="pa-0 ma-0">
            <span class="headline">Student Details</span>
          </v-col>
          <v-col cols="9">
            <div class="close-icon-relative">
              <div class="close-icon-absolute">
                <v-btn 
                        id="closeIconButton"
                        color="#003366"
                        icon 
                        @click.native="closeStudentDetailDialog()">
                  <v-icon>fa-times</v-icon>
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="3" class="pr-6 pl-0 ma-0">
            <v-card class="px-4 pt-2 ma-0" color="#D7D7D7" width="100%" elevation=0>

              <StudentDetailsTextFieldSideCardReadOnly :model="studentCopy.pen" :name="STUDENT_DETAILS_FIELDS.PEN"
                                                        colspan="3" label="PEN"
                                                        :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.PEN)"></StudentDetailsTextFieldSideCardReadOnly>

              <StudentDetailsTextFieldSideCardReadOnly :model="formatDemogCode(studentCopy.demogCode)" :name="STUDENT_DETAILS_FIELDS.DEMOG_CODE"
                                                        colspan="3" label="Demog Code"
                                                        :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.DEMOG_CODE)"></StudentDetailsTextFieldSideCardReadOnly>

              <StudentDetailsTextFieldSideCardReadOnly :model="''" :name="STUDENT_DETAILS_FIELDS.TRAX_STATUS"
                                                        colspan="3" label="TRAX Status"
                                                        :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.TRAX_STATUS)"></StudentDetailsTextFieldSideCardReadOnly>

              <StudentDetailsTextFieldSideCardReadOnly :model="''" :name="STUDENT_DETAILS_FIELDS.GRAD_DATE"
                                                        colspan="3" label="Grad Date"
                                                        :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.GRAD_DATE)"></StudentDetailsTextFieldSideCardReadOnly>

              <StudentDetailsTextFieldSideCardReadOnly :model="getCreatedDateTime()"
                                                        :name="STUDENT_DETAILS_FIELDS.CREATED_DATE" colspan="3"
                                                        label="Created"
                                                        :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.CREATED_DATE)"></StudentDetailsTextFieldSideCardReadOnly>

              <StudentDetailsTextFieldSideCardReadOnly :model="getUpdatedDateTime()"
                                                        :name="STUDENT_DETAILS_FIELDS.UPDATED_DATE" colspan="3"
                                                        label="Updated"
                                                        :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.UPDATED_DATE)"></StudentDetailsTextFieldSideCardReadOnly>
              <div v-if="studentCopy.statusCode === STUDENT_CODES.MERGED">
                <v-row cols="1" no-gutters>
                  <v-col>
                    <p class="mb-0">Status</p>
                  </v-col>
                </v-row>
                <v-chip color="#003366"
                        small
                        dark>
                  <Strong>{{ statusCodeObjects.filter(obj => obj.statusCode === studentCopy.statusCode)[0].label }}</Strong></v-chip>
              </div>
              <StudentDetailsTextFieldSideCardReadOnly :model="formatStatusCode(studentCopy.statusCode)" :name="statusCode"
                                                        colspan="3" label="Status"
                                                        :disabled="isFieldDisabled('statusCode')"></StudentDetailsTextFieldSideCardReadOnly>
            </v-card>
          </v-col>
          <v-col cols="9" class="pa-0">
            <v-card class="pa-0" height="100%" width="100%" elevation=0>

              <StudentDetailsTextFieldReadOnly max-length="255" :name="STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME" tab-index="1"
                                        :model="studentCopy.legalLastName?studentCopy.legalLastName:''"
                                        label="Legal Surname" colspan="3" titleColSpan="3"
                                        :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME)"></StudentDetailsTextFieldReadOnly>

              <StudentDetailsTextFieldReadOnly max-length="255" :name="STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME" tab-index="2"
                                        :model="studentCopy.legalFirstName?studentCopy.legalFirstName:''"
                                        label="Legal Given" colspan="3"
                                        :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME)"></StudentDetailsTextFieldReadOnly>

              <StudentDetailsTextFieldReadOnly max-length="255" :name="STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES" tab-index="3"
                                        :model="studentCopy.legalMiddleNames?studentCopy.legalMiddleNames:''"
                                        label="Legal Middle" colspan="5"
                                        :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES)"></StudentDetailsTextFieldReadOnly>

              <StudentDetailsTextFieldReadOnly max-length="255" :name="STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME" tab-index="4"
                                        :model="studentCopy.usualLastName?studentCopy.usualLastName:''"
                                        label="Usual Surname" colspan="5"
                                        :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME)"></StudentDetailsTextFieldReadOnly>

              <StudentDetailsTextFieldReadOnly max-length="255" :name="STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME" tab-index="5"
                                        :model="studentCopy.usualFirstName?studentCopy.usualFirstName:''"
                                        label="Usual Given" colspan="5"
                                        :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME)"></StudentDetailsTextFieldReadOnly>

              <StudentDetailsTextFieldReadOnly max-length="255" :name="STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES" tab-index="6"
                                        :model="studentCopy.usualMiddleNames?studentCopy.usualMiddleNames:''"
                                        label="Usual Middle" colspan="5"
                                        :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES)"></StudentDetailsTextFieldReadOnly>


              <!-- some fields cant be ported to child component, left as is-->
              <v-row no-gutters class="py-1">
                <v-col cols="2">
                  <p class="labelField">Gender</p>
                </v-col>
                <v-col cols="1" :class="{textFieldColumn: !genderError}">
                  <v-text-field
                      tabindex="7"
                      v-model="studentCopy.genderCode"
                      class="onhoverEdit bolder customNoBorder"
                      :class="{onhoverPad: !hoveringGender, darkBackgound: hoveringGender}"
                      :id='STUDENT_DETAILS_FIELDS.GENDER_CODE'
                      color="#000000"
                      dense
                      maxlength="1"
                      readonly
                      :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.GENDER_CODE)"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters class="py-1">
                <v-col cols="2">
                  <div class="labelField">
                    <div style="display: inline-block;vertical-align: middle;">
                      Date of Birth
                    </div>
                    <div style="display: inline-block;vertical-align: sub;">
                      <img title="YYYYMMDD" :class="{'ml-3': true, 'dob-disabled': isFieldDisabled(STUDENT_DETAILS_FIELDS.DOB)}"
                        src="@/assets/images/information.svg"
                        alt="YYYYMMDD"
                      >
                    </div>
                  </div>
                </v-col>
                <v-col cols="2" :class="{textFieldColumn: !dobError}">
                  <v-text-field
                    tabindex="8"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hoveringDOB, darkBackgound: hoveringDOB}"
                    v-model="studentCopy.dob"
                    :id='STUDENT_DETAILS_FIELDS.DOB'
                    color="#000000"
                    dense
                    maxlength="10"
                    readonly
                    :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.DOB)"
                  ></v-text-field>
                </v-col>
              </v-row>
              <StudentDetailsTextFieldReadOnly :model="studentCopy.gradeCode?studentCopy.gradeCode:''"
                                                :name="STUDENT_DETAILS_FIELDS.GRADE_CODE" colspan="1" label="Grade" :grade-level="gradeLabel"
                                                :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.GRADE_CODE)"></StudentDetailsTextFieldReadOnly>

              <StudentDetailsTextFieldReadOnly :model="studentCopy.gradeYear?studentCopy.gradeYear:''"
                                                :name="STUDENT_DETAILS_FIELDS.GRADE_YEAR" colspan="1" label="Grade School Year"
                                                :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.GRADE_YEAR)"></StudentDetailsTextFieldReadOnly>

              <StudentDetailsTextFieldReadOnly :model="spacePostalCode?spacePostalCode:''" :name="STUDENT_DETAILS_FIELDS.POSTAL_CODE"
                                                colspan="2" label="Postal Code"
                                                :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.LOCAL_ID)"></StudentDetailsTextFieldReadOnly>

              <StudentDetailsTextFieldReadOnly max-length="9" min-length="8" :name="STUDENT_DETAILS_FIELDS.MINCODE" tab-index="9"
                                        :model="mincode" :fieldValidationRequired=true
                                        :label="Mincode" colspan="2"
                                        :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.MINCODE)"></StudentDetailsTextFieldReadOnly>

              <StudentDetailsTextFieldReadOnly :model="studentCopy.localID?studentCopy.localID:''" :name="STUDENT_DETAILS_FIELDS.LOCAL_ID"
                                                colspan="2" label="Local ID"
                                                :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.LOCAL_ID)"></StudentDetailsTextFieldReadOnly>

              <StudentDetailsTemplateTextField colspan="2" label="Twin(s)?" :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.TWINS)">
                <span v-if="twins.length > 0">
                  Yes
                </span>
                <span v-else>
                  No
                </span>
              </StudentDetailsTemplateTextField>

              <StudentDetailsTemplateTextField colspan="8" label="Merged To" :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.MERGED_TO)">
                <div v-if="mergedTo">
                  <router-link :to="{params: {studentID: mergedTo.mergeStudentID}}" class="pr-4">
                    {{formatPen(mergedTo.mergeStudent.pen)}}
                  </router-link>
                  <span class="pr-4">{{formatUpdateTime(mergedTo.updateDate)}}</span>
                  <span class="pr-4">{{mergedTo.studentMergeSourceCode}}</span>
                  <span>{{mergedTo.updateUser}}</span>
                </div>
              </StudentDetailsTemplateTextField>

              <StudentDetailsTemplateTextField colspan="8" label="Merged From" :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.MERGED_FROM)">
                <div v-if="mergedFrom.length > 0" class="d-flex flex-wrap">
                  <router-link 
                    v-for="merge in mergedFrom" 
                    :key="merge.studentMergeID" 
                    :to="{params: {studentID: merge.mergeStudentID}}"
                    class="pr-4 pen"
                  >
                    {{formatPen(merge.mergeStudent.pen)}}
                  </router-link>
                </div>
              </StudentDetailsTemplateTextField>

              <v-row no-gutters dense>
                <v-col cols="2">
                  <p class="labelField">Memo</p>
                </v-col>
                <v-col class="textAreaColumn">
                  <v-textarea
                    tabindex="10"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hoveringMemo, darkBackgound: hoveringMemo}"
                    v-model="studentCopy.memo"
                    :id='STUDENT_DETAILS_FIELDS.MEMO'
                    color="#000000"
                    maxlength="4000"
                    dense
                    rows="2"
                    auto-grow
                    readonly
                    :outlined="hoveringMemo || editingMemo"
                    :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.MEMO)"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
        <v-divider />
        <v-row no-gutters dense class="mt-1 pr-2">
          <v-alert
              v-model="alert"
              dense
              text
              dismissible
              outlined
              transition="scale-transition"
              :class="`${alertType} flex-grow-1 mx-3`"
          >
            {{ alertMessage }}
          </v-alert>
          <v-col cols="12">
            <v-card-actions style="float: right;">
              <PrimaryButton :secondary="true" class="mx-1" text="Cancel" @click.native="closeStudentDetailDialog()"></PrimaryButton>
              <PrimaryButton class="mx-1" text="Go to Record" @click.native="viewStudentDetails()"></PrimaryButton>
              <PrimaryButton class="mx-1" text="Open in new window" @click.native="openStudentDetails()"></PrimaryButton>
            </v-card-actions>
          </v-col>
        </v-row>
      </v-col>
    </v-card>
    <v-card fluid class="full-height" v-else-if="isLoading">
      <article id="pen-display-container" class="top-banner full-height">
        <v-row align="center" justify="center">
          <v-progress-circular
              :size="70"
              :width="7"
              color="primary"
              indeterminate
          ></v-progress-circular>
        </v-row>
      </article>
    </v-card>
  </v-dialog>
</template>

<script>
import {mapGetters, mapState} from 'vuex';
import router from '../../../router';
import moment from 'moment';
import ApiService from '../../../common/apiService';
import {REQUEST_TYPES, Routes, STUDENT_DETAILS_FIELDS, STUDENT_CODES} from '@/utils/constants';
import StudentDetailsTextFieldReadOnly from '@/components/penreg/student/StudentDetailsTextFieldReadOnly';
import StudentDetailsTextFieldSideCardReadOnly
  from '@/components/penreg/student/StudentDetailsTextFieldSideCardReadOnly';
import PrimaryButton from '../../util/PrimaryButton';
import StudentDetailsTemplateTextField from '@/components/penreg/student/StudentDetailsTemplateTextField';
import {formatMinCode, formatPen} from '../../../utils/format';
import {sortBy} from 'lodash';
import alterMixin from '../../../mixins/alterMixin';

const JSJoda = require('@js-joda/core');

export default {
  name: 'studentDetailDialog',
  mixins: [alterMixin],
  props: {
    studentID: {
      type: String,
      required: true
    },
    pen: {
      type: String,
      required: true
    },
    isMatched: {
      type: Boolean,
      required: true
    }
  },
  components: {
    PrimaryButton,
    StudentDetailsTextFieldSideCardReadOnly,
    StudentDetailsTextFieldReadOnly,
    StudentDetailsTemplateTextField
  },
  data() {
    return {
      studentDetailDialogOpen: false,
      spacePostalCode: null,
      validForm: false,
      isLoading: true,
      mincodeHint: 'Invalid Mincode',
      mincodeError: false,
      genderHint: 'Invalid Gender Code',
      genderError: false,
      dobHint: 'Invalid Date of Birth',
      dobError: false,
      genderCodes: [],
      demogLabels: [],
      statusLabels: [],
      gradeLabels: [],
      gradeLabel: null,
      createdDateTime: null,
      updatedDateTime: null,
      longDOB: null,
      studentCopy: null,
      REQUEST_TYPES: REQUEST_TYPES,
      editingDOB: false,
      hoveringDOB: false,
      editingGender: false,
      hoveringGender: false,
      editingMemo: false,
      hoveringMemo: false,
      enableDisableFieldsMap: new Map(),
      fieldNames: Object.values(STUDENT_DETAILS_FIELDS),
      tab:'Demographics',
      STUDENT_DETAILS_FIELDS:STUDENT_DETAILS_FIELDS,
      STUDENT_CODES: STUDENT_CODES,
      merges: [],
      twins: [],
      twinsDialog: false,
    };
  },
  created() {
    this.genderCodes = this.genders ? this.genders.map(a => a.genderCode) : [];
    this.demogLabels = this.demogCodeObjects ? this.demogCodeObjects.map(a => a.label) : [];
    this.statusLabels = this.statusCodeObjects ? this.statusCodeObjects.map(a => a.label) : [];
    this.gradeLabels = this.gradeCodeObjects ? this.gradeCodeObjects.map(a => a.label) : [];
  },
  computed: {
    ...mapGetters('student', ['genders', 'demogCodeObjects', 'statusCodeObjects', 'gradeCodeObjects']),
    ...mapState('studentSearch', ['isAdvancedSearch']),
    mincode() {
      return formatMinCode(this.studentCopy.mincode);
    },
    mergedTo() {
      return this.merges.find(merge => merge.studentMergeDirectionCode === 'TO');
    },
    mergedFrom() {
      return sortBy(this.merges.filter(merge => merge.studentMergeDirectionCode === 'FROM'), ['mergeStudent.pen']);
    }
  },
  mounted() {
    this.$store.dispatch('student/getCodes');
    //console.log('mounted -  student in dialog: id = ' + this.studentID);
    this.refreshStudent();
  },
  watch: {
    studentID() {
      this.refreshStudent();
    }
  },
  methods: {
    formatPen,
    formatDemogCode(demogCode) {
      const codeLabel = this.getDemogCodeComboBox().find((item) => item.value === demogCode);
      if (codeLabel) {
        return codeLabel.text;
      }
      return '';
    },
    formatStatusCode(statusCode) {
      const codeLabel = this.getStatusLevels().find((item) => item.value === statusCode);
      if (codeLabel) {
        return codeLabel.text;
      }
      return '';
    },
    closeStudentDetailDialog() {
      this.studentDetailDialogOpen = false;
    },
    viewStudentDetails() {
      router.push({ name: REQUEST_TYPES.student.label, params: {studentID: this.studentID}});
    },
    openStudentDetails() {
      //console.log('routeer: name = ' + REQUEST_TYPES.student.label + ', studentId = ' + this.studentID);
      const route = router.resolve({ name: REQUEST_TYPES.student.label, params: {studentID: this.studentID}});
      window.open(route.href, '_blank');
    },
    setEnableDisableForFields(value, ...excludedFields) {
      this.enableDisableFieldsMap.forEach((fieldValue, fieldKey) => excludedFields.includes(fieldKey) ? this.enableDisableFieldsMap.set(fieldKey, fieldValue) : this.enableDisableFieldsMap.set(fieldKey, value));
    },
    frontEndDateTimeFormat(date) {
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('YYYY/MM/DD HH:mm:ss a');
    },
    updateDOBLabel(initialLoad) {
      if(!initialLoad){
        if(this.studentCopy && this.studentCopy.dob) {
          this.studentCopy.dob = this.studentCopy.dob.replace(/[^0-9]/g, '');
        }
      }
      this.longDOB = this.frontEndDOBFormat(this.studentCopy.dob);
      this.longDOB = this.frontEndDOBFormat(this.studentCopy.dob);
    },
    getDateFormatterShort() {
      return (new JSJoda.DateTimeFormatterBuilder)
        .appendPattern('uuuuMMdd')
        .toFormatter(JSJoda.ResolverStyle.STRICT);
    },
    getDateFormatterLong() {
      return (new JSJoda.DateTimeFormatterBuilder)
        .appendPattern('uuuu-MM-dd')
        .toFormatter(JSJoda.ResolverStyle.STRICT);
    },
    setStudent(student) {
      this.studentCopy = JSON.parse(JSON.stringify(student));
      this.createdDateTime = this.frontEndDateTimeFormat(this.studentCopy.createDate);
      this.updatedDateTime = this.frontEndDateTimeFormat(this.studentCopy.updateDate);
      this.updateDOBLabel(true);
      this.formatPostalCode();
      this.setGradeLabel();
      if (this.studentCopy.statusCode === STUDENT_CODES.MERGED) {
        this.setEnableDisableForFields(true, STUDENT_DETAILS_FIELDS.MERGED_TO, STUDENT_DETAILS_FIELDS.PEN);
      }
      if (this.studentCopy.statusCode === STUDENT_CODES.DECEASED || this.studentCopy.statusCode === STUDENT_CODES.DELETED) {
        this.setEnableDisableForFields(true, STUDENT_DETAILS_FIELDS.STATUS_CODE);
      }
    },
    refreshStudent() {
      this.isLoading = true;
      this.fieldNames.forEach(value => this.enableDisableFieldsMap.set(value, false));
      //console.log('refresh student in dialog: id = ' + this.studentID);
      ApiService.apiAxios
        .get(Routes['student'].ROOT_ENDPOINT + '/detail/' + this.studentID)
        .then(response => {
          this.setStudent(response.data.student);
          this.merges = response.data.merges;
          this.twins = response.data.twins;
        })
        .catch(error => {
          console.log(error);
          this.isLoading = false;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    setGradeLabel() {
      if (this.studentCopy && this.studentCopy.gradeCode && this.gradeCodeObjects) {
        this.gradeLabel = this.gradeCodeObjects.filter(it => (it.gradeCode === this.studentCopy.gradeCode))[0].label;
      }
    },
    frontEndDOBFormat(date) {
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('MMMM DD, YYYY');
    },
    formatPostalCode() {
      if (this.studentCopy.postalCode) {
        this.spacePostalCode = this.studentCopy.postalCode.replace(/.{3}$/, ' $&');
      }
    },
    getGenderCodes() {
      if (this.genders && this.genderCodes.length === 0) {
        this.genderCodes = this.genders.map(a => a.genderCode);
      }
      return this.genderCodes;
    },
    getDemogCodeComboBox(){
      const demogCodeComboBox = [];
      if (this.demogCodeObjects) {
        for (const element of this.demogCodeObjects) {
          const item = {
            value: element.demogCode,
            text: element.label,
            disabled: element.demogCode === 'F'
          };
          demogCodeComboBox.push(item);
        }
      }
      return demogCodeComboBox;
    },
    getStatusLevels(){
      const statusCodeComboBox = [];
      if (this.statusCodeObjects) {
        for (const element of this.statusCodeObjects) {
          if(([STUDENT_CODES.ACTIVE,STUDENT_CODES.DECEASED].includes(element.statusCode) && this.studentCopy.statusCode !== STUDENT_CODES.DELETED) ||
            ([STUDENT_CODES.DELETED,STUDENT_CODES.ACTIVE].includes(element.statusCode) && this.studentCopy.statusCode === STUDENT_CODES.DELETED)) {
            const item = {
              value: element.statusCode,
              text: element.label,
            };
            statusCodeComboBox.push(item);
          }
        }
      }
      return statusCodeComboBox;
    },
    getCreatedDateTime(){
      return this.createdDateTime;
    },
    getUpdatedDateTime(){
      return this.updatedDateTime;
    },
    isFieldDisabled(fieldName){
      return !!this.enableDisableFieldsMap.get(fieldName);
    },
    formatUpdateTime(datetime) {
      return moment(JSON.stringify(datetime), 'YYYY-MM-DDTHH:mm:ss').format('YYYY/MM/DD H:mma');
    }
  }
};
</script>

<style>
.studentDetailDialogCard {
  font-size: 14px !important;
  line-height: 1.1;
}

.onhoverEdit.v-text-field > .v-input__control > .v-input__slot:before {
  border-style: none;
}

.onhoverEdit.v-text-field > .v-input__control > .v-input__slot:after {
  border-style: none;
}

.onhoverPad {
  padding-left: 12px !important;
  padding-top: 2px !important;
}

.onEditPad {
  padding-left: 12px !important;
  padding-top: 2px !important;
}

.textField {
  padding-left: 38px !important;
}

.textFieldColumn {
  display: table-cell;
  height: 1rem;
  padding-left: 25px !important;
}

.darkBackgound.v-text-field > .v-input__control > .v-input__slot {
  background-color: #eeeeee;
}

.textAreaColumn {
  display: table-cell;
  padding-left: 25px !important;
}

.sideCardField {
  display: table-cell;
  height: 3em;
}

.labelField {
  display: table-cell;
  height: 1em;
  padding-top: 12px !important;
}

.customNoBorder.v-text-field > .v-input__control > .v-input__slot {
  padding-top: 0px !important;
  padding-bottom: 0px !important;
}

.revert.v-text-field > .v-input__control > .v-input__slot > .v-text-field__slot > input {
  color: #1a5a96 !important;
  font-weight: bolder;
  cursor: pointer;
}

.bolder {
  color: #000000 !important;
  font-weight: bolder;
}

.top-banner {
  background-color: white;
  background-size: cover;
  align-items: center;
  display: flex;
}

.full-height {
  height: 100%;
}
.active-display {
  background-color: #eaf8fe;
}

.pen {
  white-space: nowrap;
}

.pen-link {
  text-decoration: underline;
}

.dob-disabled {
  visibility: hidden;
}
.student-details-tabs-style{
  text-transform: none;
}

.close-icon-relative {
  display: block;
  position: relative;
}

.close-icon-absolute {
  position: absolute;
  top: -25px;
  right: -25px;
}

</style>
