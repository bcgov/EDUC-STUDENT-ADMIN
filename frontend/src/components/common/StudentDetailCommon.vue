<template>
    <v-row>
      <v-row v-if="!isLoading">
        <v-col cols="3" class="pr-6 pl-0 ma-0">
          <v-card class="pa-2 ma-0" color="#D7D7D7" width="100%" elevation=0>

            <StudentDetailsTextFieldSideCardReadOnly :model="studentCopy.pen" :name="STUDENT_DETAILS_FIELDS.PEN"
                                                      colspan="1" label="PEN"
                                                      :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.PEN)"></StudentDetailsTextFieldSideCardReadOnly>

            <StudentDetailsComboBox label="Demog Code" colspan="1" :name="STUDENT_DETAILS_FIELDS.DEMOG_CODE"
                                    @changeStudentObjectValue="changeStudentObjectValue"
                                    :model="studentCopy.demogCode?studentCopy.demogCode:''"
                                    :has-edits="hasEdits" tab-index="11" :revert-field="revertField"
                                    :items="getDemogCodeComboBox()" revert-id="revertDemogCode"
                                    :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.DEMOG_CODE)"></StudentDetailsComboBox>

            <StudentDetailsTextFieldSideCardReadOnly :model="''" :name="STUDENT_DETAILS_FIELDS.TRAX_STATUS"
                                                      colspan="1" label="TRAX Status"
                                                      :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.TRAX_STATUS)"></StudentDetailsTextFieldSideCardReadOnly>

            <StudentDetailsTextFieldSideCardReadOnly :model="''" :name="STUDENT_DETAILS_FIELDS.GRAD_DATE"
                                                      colspan="1" label="Grad Date"
                                                      :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.GRAD_DATE)"></StudentDetailsTextFieldSideCardReadOnly>

            <StudentDetailsTextFieldSideCardReadOnly :model="getCreatedDateTime()"
                                                      :name="STUDENT_DETAILS_FIELDS.CREATED_DATE" colspan="1"
                                                      label="Created"
                                                      :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.CREATED_DATE)"></StudentDetailsTextFieldSideCardReadOnly>

            <StudentDetailsTextFieldSideCardReadOnly :model="getUpdatedDateTime()"
                                                      :name="STUDENT_DETAILS_FIELDS.UPDATED_DATE" colspan="1"
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
            <StudentDetailsComboBox v-else label="Status" colspan="1" name="statusCode"
                                    @changeStudentObjectValue="changeStudentObjectValue"
                                    :model="studentCopy.statusCode?studentCopy.statusCode:''"
                                    :has-edits="hasEdits" tab-index="12" :revert-field="revertField"
                                    :items="getStatusLevels()" revert-id="revertDemogCode"
                                    :deceased-dialog="openDeceasedDialog"
                                    :disabled="isFieldDisabled('statusCode')"></StudentDetailsComboBox>
          </v-card>
        </v-col>
        <v-col cols="9" class="py-0 pl-0">
          <v-card class="pa-0" height="100%" width="100%" elevation=0>

            <StudentDetailsTextField max-length="255" :name="STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME" tab-index="1"
                                      @changeStudentObjectValue="changeStudentObjectValue"
                                      :model="studentCopy.legalLastName?studentCopy.legalLastName:''"
                                      :has-edits="hasEdits" revert-id="revertLegalLastName"
                                      :fieldValidationRequired=true :validation-rules="validateLegalLastName"
                                      :revert-field="revertField" label="Legal Surname" colspan="5"
                                      :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME)"></StudentDetailsTextField>

            <StudentDetailsTextField max-length="255" :name="STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME" tab-index="2"
                                      @changeStudentObjectValue="changeStudentObjectValue"
                                      :model="studentCopy.legalFirstName?studentCopy.legalFirstName:''"
                                      :has-edits="hasEdits" revert-id="revertLegalFirstName"
                                      :revert-field="revertField" label="Legal Given" colspan="5"
                                      :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME)"></StudentDetailsTextField>

            <StudentDetailsTextField max-length="255" :name="STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES" tab-index="3"
                                      @changeStudentObjectValue="changeStudentObjectValue"
                                      :model="studentCopy.legalMiddleNames?studentCopy.legalMiddleNames:''"
                                      :has-edits="hasEdits" revert-id="revertLegalMiddleNames"
                                      :revert-field="revertField" label="Legal Middle" colspan="5"
                                      :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES)"></StudentDetailsTextField>

            <StudentDetailsTextField max-length="255" :name="STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME" tab-index="4"
                                      @changeStudentObjectValue="changeStudentObjectValue"
                                      :model="studentCopy.usualLastName?studentCopy.usualLastName:''"
                                      :has-edits="hasEdits" revert-id="revertUsualLastName"
                                      :revert-field="revertField" label="Usual Surname" colspan="5"
                                      :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME)"></StudentDetailsTextField>

            <StudentDetailsTextField max-length="255" :name="STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME" tab-index="5"
                                      @changeStudentObjectValue="changeStudentObjectValue"
                                      :model="studentCopy.usualFirstName?studentCopy.usualFirstName:''"
                                      :has-edits="hasEdits" revert-id="revertUsualFirstName"
                                      :revert-field="revertField" label="Usual Given" colspan="5"
                                      :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME)"></StudentDetailsTextField>

            <StudentDetailsTextField max-length="255" :name="STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES" tab-index="6"
                                      @changeStudentObjectValue="changeStudentObjectValue"
                                      :model="studentCopy.usualMiddleNames?studentCopy.usualMiddleNames:''"
                                      :has-edits="hasEdits" revert-id="revertUsualMiddleNames"
                                      :revert-field="revertField" label="Usual Middle" colspan="5"
                                      :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES)"></StudentDetailsTextField>


            <!-- some fields cant be ported to child component, left as is-->
            <v-row no-gutters class="py-1">
              <v-col cols="2">
                <p class="labelField">Gender</p>
              </v-col>
              <v-col cols="1" :class="{textFieldColumn: !genderError}">
                <v-text-field
                    tabindex="7"
                    v-on:keyup.tab="[editingGender = true, hoveringGender = true]"
                    v-on:mouseover="isFieldDisabled('memo')?hoveringGender=false:hoveringGender = true"
                    v-on:mouseout="editingGender ? hoveringGender = true : hoveringGender=false"
                    v-on:blur="[editingGender = false, hoveringGender = false]"
                    v-on:click="[editingGender = true, hoveringGender = true]"
                    v-on:input="uppercaseGender()"
                    v-model="studentCopy.genderCode"
                    class="onhoverEdit bolder customNoBorder"
                    :class="{onhoverPad: !hoveringGender && !hasEdits('genderCode'), darkBackgound: hoveringGender || hasEdits(STUDENT_DETAILS_FIELDS.GENDER_CODE)}"
                    :id='STUDENT_DETAILS_FIELDS.GENDER_CODE'
                    color="#000000"
                    :rules="validateGender()"
                    dense
                    maxlength="1"
                    :readonly="!hoveringGender || !editingGender"
                    :outlined="hoveringGender || editingGender || hasEdits(STUDENT_DETAILS_FIELDS.GENDER_CODE)"
                    :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.GENDER_CODE)"
                ></v-text-field>
              </v-col>
              <v-col class="textFieldColumn" cols="2">
                <v-text-field
                    id='revertGender'
                    v-on:click="revertField(STUDENT_DETAILS_FIELDS.GENDER_CODE)"
                    class="onhoverEdit revert customNoBorder ml-3"
                    readonly
                    v-if="hasEdits(STUDENT_DETAILS_FIELDS.GENDER_CODE)"
                    value="Revert"
                    dense
                    tabindex="-1"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row no-gutters class="py-1">
              <v-col cols="2">
                <div class="labelField">
                  <div style="display: inline-block;">
                    Date of Birth
                  </div>
                  <div style="display: inline-block">
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
                  v-on:keyup.tab="[editingDOB = true, hoveringDOB = true, shortDOBStyle()]"
                  v-on:mouseover="isFieldDisabled('memo')? hoveringDOB = false : hoveringDOB = true"
                  v-on:mouseout="editingDOB ? hoveringDOB = true : hoveringDOB = false"
                  v-on:blur="[editingDOB = false, hoveringDOB = false, longDOBStyle()]"
                  v-on:click="[editingDOB = true, hoveringDOB = true, shortDOBStyle()]"
                  v-on:input="updateDOBLabel()"
                  class="onhoverEdit bolder customNoBorder"
                  :class="{onhoverPad: !hoveringDOB && !dobHasChanged('dob'), darkBackgound: hoveringDOB || dobHasChanged('dob')}"
                  v-model="studentCopy.dob"
                  :id='STUDENT_DETAILS_FIELDS.DOB'
                  color="#000000"
                  dense
                  :rules="validateDOB()"
                  maxlength="10"
                  :readonly="!hoveringDOB || !editingDOB"
                  :outlined="hoveringDOB || editingDOB || dobHasChanged()"
                  :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.DOB)"
                ></v-text-field>
              </v-col>
              <v-col cols="3" class="textFieldColumn">
                <v-text-field
                  class="onhoverEdit bolder customNoBorder onhoverPad"
                  v-model="longDOB"
                  v-if="hoveringDOB && !editingDOB"
                  id='dobFull'
                  color="#000000"
                  dense
                  readonly
                  tabindex="-1"
                ></v-text-field>
              </v-col>
              <v-col class="textFieldColumn" cols="2">
                <v-text-field
                  id='revertDOB'
                  v-on:click="revertDOBField(STUDENT_DETAILS_FIELDS.DOB)"
                  class="onhoverEdit revert customNoBorder ml-3"
                  readonly
                  v-show="dobHasChanged(STUDENT_DETAILS_FIELDS.DOB)"
                  value="Revert"
                  style="padding-top: 2px;"
                  dense
                  tabindex="-1"
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

            <StudentDetailsTextField max-length="9" min-length="8" :name="STUDENT_DETAILS_FIELDS.MINCODE" tab-index="9"
                                      @changeStudentObjectValue="changeStudentObjectValue"
                                      :model="mincode" :has-edits="hasEdits"
                                      revert-id="revertMincode" :fieldValidationRequired=true
                                      :validation-rules="validateMincode" :revert-field="revertField" label="Mincode"
                                      colspan="2" :handle-on-input="handleInput(STUDENT_DETAILS_FIELDS.MINCODE)"
                                      :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.MINCODE)"></StudentDetailsTextField>

            <StudentDetailsTextFieldReadOnly :model="studentCopy.localID?studentCopy.localID:''" :name="STUDENT_DETAILS_FIELDS.LOCAL_ID"
                                              colspan="2" label="Local ID"
                                              :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.LOCAL_ID)"></StudentDetailsTextFieldReadOnly>

            <StudentDetailsTemplateTextField v-if="twins.length > 0" colspan="2" label="Twin(s)?" :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.TWINS)">
              <a @click="twinsDialog=true">
                Yes
              </a>
            </StudentDetailsTemplateTextField>

            <StudentDetailsTemplateTextField v-if="mergedTo" colspan="8" label="Merged To" :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.MERGED_TO)">
              <div>
                <router-link :to="{params: {studentID: mergedTo.mergeStudentID}}" class="pr-4">
                  {{formatPen(mergedTo.mergeStudent.pen)}}
                </router-link>
                <span class="pr-4">{{formatUpdateTime(mergedTo.updateDate)}}</span>
                <span class="pr-4">{{mergedTo.studentMergeSourceCode}}</span>
                <span>{{mergedTo.updateUser}}</span>
              </div>
            </StudentDetailsTemplateTextField>

            <StudentDetailsTemplateTextField v-if="mergedFrom.length > 0" colspan="8" label="Merged From" :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.MERGED_FROM)">
              <div class="d-flex flex-wrap">
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
                  v-on:keyup.tab="[editingMemo = true, hoveringMemo = true]"
                  v-on:mouseover="isFieldDisabled('memo')?hoveringMemo = false:hoveringMemo = true"
                  v-on:mouseout="editingMemo ? hoveringMemo = true : hoveringMemo = false"
                  v-on:blur="[editingMemo = false, hoveringMemo = false]"
                  v-on:click="[editingMemo = true, hoveringMemo = true]"
                  class="onhoverEdit bolder customNoBorder"
                  :class="{onhoverPad: !hoveringMemo && !hasEdits('memo'), darkBackgound: hoveringMemo || hasEdits('memo')}"
                  v-model="studentCopy.memo"
                  :id='STUDENT_DETAILS_FIELDS.MEMO'
                  color="#000000"
                  maxlength="4000"
                  dense
                  rows="2"
                  auto-grow
                  :readonly="!hoveringMemo || !editingMemo"
                  :outlined="hoveringMemo || editingMemo || hasEdits(STUDENT_DETAILS_FIELDS.MEMO)"
                  :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.MEMO)"
                ></v-textarea>
              </v-col>
              <v-col class="textFieldColumn" cols="2">
                <v-text-field
                  id='revertMemo'
                  v-on:click="revertField(STUDENT_DETAILS_FIELDS.MEMO)"
                  class="onhoverEdit revert customNoBorder ml-3"
                  readonly
                  v-if="hasEdits(STUDENT_DETAILS_FIELDS.MEMO)"
                  value="Revert"
                  dense
                  tabindex="-1"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <AlertMessage v-model="alert" :alertMessage="alertMessage" :alertType="alertType" :timeoutMs="3000"></AlertMessage>
            </v-row>
          </v-card>
        </v-col>
        <slot 
          name="buttonbar"
          :isAdvancedSearch="isAdvancedSearch"
          :hasAnyEdits="hasAnyEdits"
          :saveStudent="saveStudent"
          :REQUEST_TYPES="REQUEST_TYPES">
        </slot>
      </v-row>
      <v-row fluid class="full-height align-center justify-center" v-else-if="isLoading">
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
      </v-row>
      <v-dialog
          v-model="deceasedDialog"
          width="400px"
      >
        <v-card>
          <v-card-text class="px-5 py-5">
            Change Student Status to Deceased?
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                outlined
                tabindex="-1"
                color="#38598a"
                class="mx-2"
                @click="cancelDeceasedDialog"
            >
              Cancel
            </v-btn>

            <v-btn
                color="#003366"
                tabindex="-1"
                class="white--text"
                @click="confirmDeceasedDialog"
            >
              Confirm
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="twinsDialog"
        width="900px"
      >
        <TwinnedStudentsCard 
          :student="studentCopy"
          :twins="twins"
          @close="twinsDialog=false"
        ></TwinnedStudentsCard>
      </v-dialog>
      <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
    </v-row>
</template>

<script>
import {mapGetters, mapState} from 'vuex';
import moment from 'moment';
import ApiService from '../../common/apiService';
import {REQUEST_TYPES, Routes, STUDENT_DETAILS_FIELDS, STUDENT_CODES} from '@/utils/constants';
import StudentDetailsTextField from '@/components/penreg/student/StudentDetailsTextField';
import {LocalDate} from '@js-joda/core';
import StudentDetailsTextFieldReadOnly from '@/components/penreg/student/StudentDetailsTextFieldReadOnly';
import StudentDetailsComboBox from '@/components/penreg/student/StudentDetailsComboBox';
import StudentDetailsTextFieldSideCardReadOnly
  from '@/components/penreg/student/StudentDetailsTextFieldSideCardReadOnly';
import StudentDetailsTemplateTextField from '@/components/penreg/student/StudentDetailsTemplateTextField';
import {formatMinCode, formatPen} from '../../utils/format';
import {sortBy} from 'lodash';
import alterMixin from '../../mixins/alterMixin';
import ConfirmationDialog from '../util/ConfirmationDialog';
import AlertMessage from '../util/AlertMessage';
import TwinnedStudentsCard from '@/components/penreg/student/TwinnedStudentsCard';

const JSJoda = require('@js-joda/core');

export default {
  name: 'studentDetail',
  mixins: [alterMixin],
  props: {
    studentID: {
      type: String,
      required: true
    },
    validForm: {
      type: Boolean,
      required: false
    },
    parentRefs: {
      type: Object,
      required: false
    },
    fullReadOnly: {
      type: Boolean,
      required: true
    }
  },
  components: {
    AlertMessage,
    ConfirmationDialog,
    TwinnedStudentsCard,
    StudentDetailsTextFieldSideCardReadOnly,
    StudentDetailsComboBox,
    StudentDetailsTextFieldReadOnly,
    StudentDetailsTextField,
    StudentDetailsTemplateTextField,
  },
  data() {
    return {
      hovering: false,
      editing: false,
      spacePostalCode: null,
      isLoading: true,
      deceasedDialog: false,
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
      alert: false,
      createdDateTime: null,
      updatedDateTime: null,
      longDOB: null,
      origStudent: null,
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
      unsavedChanges: false
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
    this.refreshStudent();
  },
  watch: {
    studentID() {
      this.refreshStudent();
    }
  },
  beforeRouteLeave (to, from, next) {
    if(this.hasAnyEdits()) {
      this.$refs.confirmationDialog.open('Warning!', 'Changes will be lost. Are you sure?', { color: '#003366', rejectText: 'No, go back' }).then((result) => {
        if(result) {
          next();
        } else {
          next(false);
        }
      });
    } else {
      next();
    }
  },
  methods: {
    formatPen,
    changeStudentObjectValue(key, value) {
      this.studentCopy[`${key}`] = value;
      if (key === STUDENT_DETAILS_FIELDS.STATUS_CODE) {
        this.setEnableDisableForFields(false);
      }
      if (key === STUDENT_DETAILS_FIELDS.STATUS_CODE && value === STUDENT_CODES.MERGED) {
        this.setEnableDisableForFields(true, STUDENT_DETAILS_FIELDS.MERGED_TO, STUDENT_DETAILS_FIELDS.PEN, STUDENT_DETAILS_FIELDS.STATUS_CODE);
      } else if (key === STUDENT_DETAILS_FIELDS.STATUS_CODE &&( value === STUDENT_CODES.DECEASED || value === STUDENT_CODES.DELETED)) {
        this.setEnableDisableForFields(true, STUDENT_DETAILS_FIELDS.STATUS_CODE);
      }
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
    uppercaseGender() {
      if (this.studentCopy.genderCode) {
        this.studentCopy.genderCode = this.studentCopy.genderCode.toUpperCase();
      }
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
    validateDOB() {
      if (this.studentCopy) {
        if (!this.studentCopy.dob) {
          this.dobError = false;
          return [];
        } else {
          const formatterShort = this.getDateFormatterShort();
          const formatterLong = this.getDateFormatterLong();

          let isBeforeLongDate = false;
          let isBeforeShortDate = false;

          try {
            const dateLong = JSJoda.LocalDate.parse(this.studentCopy.dob, formatterLong);
            isBeforeLongDate = dateLong.isBefore(LocalDate.now());
          } catch (err) {
            //Do nothing
          }
          try {
            const dateShort = JSJoda.LocalDate.parse(this.studentCopy.dob, formatterShort);
            isBeforeShortDate = dateShort.isBefore(LocalDate.now());
          } catch (err) {
            //Do nothing
          }

          if (isBeforeLongDate || isBeforeShortDate) {
            this.dobError = false;
            return [];
          }
        }
      }
      this.dobError = true;
      return [
        this.dobHint
      ];
    },
    validateGender() {
      if (this.studentCopy) {
        if (!this.studentCopy.genderCode) {
          this.genderError = true;
          return ['Gender is required.'];
        } else {
          if (this.getGenderCodes().includes(this.studentCopy.genderCode)) {
            this.genderError = false;
            return [];
          }
        }
      }

      this.genderError = true;
      return [
        this.genderHint
      ];
    },
    validateMincode() {
      if (this.studentCopy) {
        if (!this.studentCopy.mincode) {
          this.mincodeError = false;
          return [];
        } else {
          if (this.studentCopy.mincode.match('^[0-9]\\d*$') && this.studentCopy.mincode.length === 8) {
            this.mincodeError = false;
            return [];
          }
        }
      }
      this.mincodeError = true;
      return [
        this.mincodeHint
      ];
    },
    setStudent(student) {
      this.origStudent = student;
      this.studentCopy = JSON.parse(JSON.stringify(this.origStudent));
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
    hasEdits(key) {
      let studentCopy = this.studentCopy[key];
      let studentOriginal = this.origStudent[key];
      studentCopy = (studentCopy === null || studentCopy === undefined) ? '' : studentCopy;
      studentOriginal = (studentOriginal === null || studentOriginal === undefined) ? '' : studentOriginal;
      return studentCopy !== studentOriginal;
    },
    hasAnyEdits() {
      return JSON.stringify(this.studentCopy) !== JSON.stringify(this.origStudent);
    },
    revertField(key) {
      this.studentCopy[key] = this.origStudent[key];
      if(key === STUDENT_DETAILS_FIELDS.STATUS_CODE && this.origStudent[key] ===STUDENT_CODES.DECEASED ){
        this.setEnableDisableForFields(true);
      }else if(key === STUDENT_DETAILS_FIELDS.STATUS_CODE && this.origStudent[key] ===STUDENT_CODES.ACTIVE ){
        this.setEnableDisableForFields(false);
      }
    },
    revertDOBField(value) {
      this.revertField(value);
      this.updateDOBLabel(true);
    },
    setGradeLabel() {
      if (this.studentCopy && this.studentCopy.gradeCode && this.gradeCodeObjects) {
        this.gradeLabel = this.gradeCodeObjects.filter(it => (it.gradeCode === this.studentCopy.gradeCode))[0].label;
      }
    },
    frontEndDOBFormat(date) {
      return moment(JSON.stringify(date), 'YYYY-MM-DDTHH:mm:ss').format('MMMM DD, YYYY');
    },
    shortDOBStyle() {
      if (this.studentCopy.dob) {
        const formatterShort = this.getDateFormatterShort();
        const formatterLong = this.getDateFormatterLong();
        try {
          const dateLong = JSJoda.LocalDate.parse(this.studentCopy.dob, formatterLong);
          this.studentCopy.dob = dateLong.format(formatterShort);
        } catch (err) {
          //Do nothing
        }
      }
    },
    formatPostalCode() {
      if (this.studentCopy.postalCode) {
        this.spacePostalCode = this.studentCopy.postalCode.replace(/.{3}$/, ' $&');
      }
    },
    longDOBStyle() {
      if (this.studentCopy.dob) {
        const formatterShort = this.getDateFormatterShort();
        const formatterLong = this.getDateFormatterLong();
        try {
          const dateShort = JSJoda.LocalDate.parse(this.studentCopy.dob, formatterShort);
          this.studentCopy.dob = dateShort.format(formatterLong);
        } catch (err) {
          //Do nothing
        }
      }
    },
    dobHasChanged() {
      if (this.origStudent.dob) {
        if (!this.studentCopy.dob) {
          return true;
        } else if (this.origStudent.dob === this.studentCopy.dob) {
          return false;
        }

        const formatterShort = this.getDateFormatterShort();
        const formatterLong = this.getDateFormatterLong();
        try {
          const dateLong = JSJoda.LocalDate.parse(this.origStudent.dob, formatterLong);
          const dateShort = JSJoda.LocalDate.parse(this.studentCopy.dob, formatterShort);

          if (dateLong.equals(dateShort)) {
            return false;
          }
        } catch (err) {
          return true;
        }
        return true;
      }
    },
    confirmDeceasedDialog() {
      this.deceasedDialog = false;
      this.studentCopy.statusCode = STUDENT_CODES.DECEASED;
      this.setEnableDisableForFields(true);
    },
    cancelDeceasedDialog() {
      this.deceasedDialog = false;
      this.studentCopy.statusCode = STUDENT_CODES.ACTIVE;
      this.setEnableDisableForFields(false);
    },
    openDeceasedDialog() {
      if (this.studentCopy.statusCode === STUDENT_CODES.DECEASED) {
        this.deceasedDialog = true;
      }
    },
    saveStudent() {
      if (this.parentRefs.studentDetailForm.validate()) {
        ApiService.apiAxios
          .put(Routes['student'].ROOT_ENDPOINT+'/'+ this.studentID, this.prepPut(this.studentCopy))
          .then(response => {
            this.setStudent(response.data);
            this.setSuccessAlert('Student data updated successfully.');
          })
          .catch(error => {
            console.log(error);
            this.setFailureAlert('Student data could not be updated, please try again.');
          })
          .finally(() => {
          });
      }
    },
    prepPut(student) {
      student.historyActivityCode = 'USEREDIT';
      return {
        student: student
      };
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
      return (!!this.enableDisableFieldsMap.get(fieldName) || this.fullReadOnly);
    },
    handleInput(fieldName){
      if(fieldName === STUDENT_DETAILS_FIELDS.POSTAL_CODE){
        if(this.studentCopy && this.studentCopy.postalCode) {
          this.studentCopy.postalCode = this.studentCopy.postalCode.replace(/[^0-9A-Za-z]/g, '');
        }
        this.spacePostalCode = this.studentCopy.postalCode;
      }
      if(fieldName === STUDENT_DETAILS_FIELDS.MINCODE){
        if(this.studentCopy && this.studentCopy.mincode) {
          this.studentCopy.mincode = this.studentCopy.mincode.replace(/[^0-9A-Za-z]/g, '');
        }
      }
    },
    formatUpdateTime(datetime) {
      return moment(JSON.stringify(datetime), 'YYYY-MM-DDTHH:mm:ss').format('YYYY/MM/DD H:mma');
    },
    validateLegalLastName(){
      if (this.studentCopy) {
        if (!this.studentCopy.legalLastName || this.studentCopy.legalLastName.length < 2) {
          return ['Legal Surname is required and must be more than one character.'];
        }
      }
      return [];
    },
  }
};
</script>

<style>
.topMenu {
  display: flex;
  align-items: center;
  justify-content: center;
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

.textFieldColumn {
  display: table-cell;
  height: 1rem;
  margin-top: -2px;
}

.darkBackgound.v-text-field > .v-input__control > .v-input__slot {
  background-color: #eeeeee;
}

.textAreaColumn {
  display: table-cell;
  height: 5em;
}

.sideCardField {
  display: table-cell;
  height: 3em;
}

.labelField {
  display: table-cell;
  height: 1em;
  padding-top: 8px !important;
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

.dob-disabled {
  visibility: hidden;
}
.student-details-tabs-style{
  text-transform: none;
}
</style>
