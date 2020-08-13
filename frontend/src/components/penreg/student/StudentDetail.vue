<template>
  <v-main class="fill-height">
    <v-form ref="studentDetailForm" id="detailStudentForm"
            v-model="validForm" class="fill-height"
    >
      <v-container class="fill-height" v-if="!isLoading">
        <v-col cols="15" class="fill-height pb-5">
          <v-row class="flex-grow-0 pb-2">
            <v-card style="background-color:#d7d7d7;" height="100%" width="100%" elevation=0>
              <v-row>
                <v-col cols="1" class="topMenu pl-16 mr-12">
                  <img
                      src="@/assets/images/hamburger.svg"
                      alt="Menu"
                  >
                  <p class="pl-2 mb-0">Menu</p>
                </v-col>
                <v-col cols="10" class="pl-0">
                  <v-card-title class="bolder px-0 pl-5">Student Details</v-card-title>
                </v-col>
              </v-row>
            </v-card>
          </v-row>
          <v-row class="flex-grow-0">
                <v-tabs active-class="active-display" v-model="tab" align-with-title>
                  <v-tab>DEMOGRAPHICS</v-tab>
                  <v-tab :disabled="true">SLD DATA</v-tab>
                  <v-tab :disabled="true">AUDIT HISTORY</v-tab>
                  <v-tab :disabled="true">TRANSCRIPT</v-tab>

                  <v-tab-item value="DEMOGRAPHICS"/>
                  <v-tab-item value="SLD"/>
                  <v-tab-item value="AUDIT"/>
                  <v-tab-item value="TRANSCRIPT"/>
                </v-tabs>
          </v-row>
          <v-row>
            <v-col cols="3" class="pr-15 pl-0">
              <v-card class="px-3 py-2" color="#D7D7D7" width="100%" elevation=0>

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

                <StudentDetailsComboBox label="Status" colspan="1" name="statusCode"
                                        @changeStudentObjectValue="changeStudentObjectValue"
                                        :model="studentCopy.statusCode?studentCopy.statusCode:''"
                                        :has-edits="hasEdits" tab-index="12" :revert-field="revertField"
                                        :items="getStatusLevels()" revert-id="revertDemogCode"
                                        :deceased-dialog="openDeceasedDialog"
                                        :disabled="isFieldDisabled('statusCode')"></StudentDetailsComboBox>
              </v-card>
            </v-col>
            <v-col cols="9" class="py-0 pl-0">
              <v-card class="px-0 py-2" height="100%" width="100%" elevation=0>

                <StudentDetailsTextField max-length="255" :name="STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME" tab-index="1"
                                         @changeStudentObjectValue="changeStudentObjectValue"
                                         :model="studentCopy.legalLastName?studentCopy.legalLastName:''"
                                         :has-edits="hasEdits" revert-id="revertLegalLastName"
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
                      <div style="display: inline-block;vertical-align: middle;">
                        Date of Birth
                      </div>
                      <div style="display: inline-block;vertical-align: sub;">
                        <img title="YYYYMMDD" class="ml-3"
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

                <StudentDetailsTextField :model="spacePostalCode?spacePostalCode:''" :has-edits="hasEdits"
                                         revert-id="revertPostalCode" @changeStudentObjectValue="changeStudentObjectValue"
                                         :name="STUDENT_DETAILS_FIELDS.POSTAL_CODE" colspan="2"
                                         label="Postal Code" max-length="7" min-length="6" tab-index="9"
                                         :revert-field="revertField" :handle-on-input="handleInput(STUDENT_DETAILS_FIELDS.POSTAL_CODE)"
                                         :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.POSTAL_CODE)"></StudentDetailsTextField>

                <StudentDetailsTextField max-length="9" min-length="8" :name="STUDENT_DETAILS_FIELDS.MINCODE" tab-index="9"
                                         @changeStudentObjectValue="changeStudentObjectValue"
                                         :model="studentCopy.mincode?studentCopy.mincode:''" :has-edits="hasEdits"
                                         revert-id="revertMincode" :fieldValidationRequired=true
                                         :validation-rules="validateMincode" :revert-field="revertField" label="Mincode"
                                         colspan="2" :handle-on-input="handleInput(STUDENT_DETAILS_FIELDS.MINCODE)"
                                         :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.MINCODE)"></StudentDetailsTextField>

                <StudentDetailsTextFieldReadOnly :model="studentCopy.localID?studentCopy.localID:''" :name="STUDENT_DETAILS_FIELDS.LOCAL_ID"
                                                 colspan="2" label="Local ID"
                                                 :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.LOCAL_ID)"></StudentDetailsTextFieldReadOnly>

                <StudentDetailsTextFieldReadOnly :model="''" :name="STUDENT_DETAILS_FIELDS.TWINS" colspan="2" label="Twin(s)?"
                                                 :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.TWINS)"></StudentDetailsTextFieldReadOnly>

                <StudentDetailsTextFieldReadOnly :model="''" :name="STUDENT_DETAILS_FIELDS.MERGED_TO" colspan="2" label="Merged To"
                                                 :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.MERGED_TO)"></StudentDetailsTextFieldReadOnly>

                <StudentDetailsTextFieldReadOnly :model="''" :name="STUDENT_DETAILS_FIELDS.MERGED_FROM" colspan="2" label="Merged From"
                                                 :disabled="isFieldDisabled(STUDENT_DETAILS_FIELDS.MERGED_FROM)"></StudentDetailsTextFieldReadOnly>

                <v-row no-gutters class="py-1">
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
                  <v-col cols="10">
                    <v-card-actions style="float: right;">
                      <router-link :to="`${this.isAdvancedSearch?REQUEST_TYPES.studentSearch.path.advanced:REQUEST_TYPES.studentSearch.path.basic}`">
                        <v-btn
                          outlined
                          tabindex="-1"
                          color="#38598a"
                          class="mx-1"
                        >
                          Cancel
                        </v-btn>
                      </router-link>
                      <v-btn
                        tabindex="-1"
                        color="#003366"
                        :disabled="!hasAnyEdits()"
                        :dark="hasAnyEdits()"
                        @click="saveStudent()"
                        >
                        Save
                      </v-btn>
                    </v-card-actions>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-container>
      <v-container fluid class="full-height" v-else-if="isLoading">
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
      </v-container>
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
    </v-form>
  </v-main>
</template>

<script>
import {mapGetters, mapState} from 'vuex';
import moment from 'moment';
import ApiService from '../../../common/apiService';
import {REQUEST_TYPES, Routes, STUDENT_DETAILS_FIELDS} from '@/utils/constants';
import StudentDetailsTextField from '@/components/penreg/student/StudentDetailsTextField';
import {LocalDate} from '@js-joda/core';
import StudentDetailsTextFieldReadOnly from '@/components/penreg/student/StudentDetailsTextFieldReadOnly';
import StudentDetailsComboBox from '@/components/penreg/student/StudentDetailsComboBox';
import StudentDetailsTextFieldSideCardReadOnly
  from '@/components/penreg/student/StudentDetailsTextFieldSideCardReadOnly';

const JSJoda = require('@js-joda/core');

export default {
  name: 'studentDetail',
  props: {
    studentID: {
      type: String,
      required: true
    }
  },
  components: {
    StudentDetailsTextFieldSideCardReadOnly,
    StudentDetailsComboBox,
    StudentDetailsTextFieldReadOnly,
    StudentDetailsTextField
  },
  data() {
    return {
      hovering: false,
      editing: false,
      spacePostalCode: null,
      validForm: false,
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
      tab:'DEMOGRAPHICS',
      STUDENT_DETAILS_FIELDS:STUDENT_DETAILS_FIELDS
    };
  },
  created() {
    this.genderCodes = this.genders ? this.genders.map(a => a.genderCode) : [];
    this.demogLabels = this.demogCodeObjects ? this.demogCodeObjects.map(a => a.label) : [];
    this.statusLabels = this.statusCodeObjects ? this.statusCodeObjects.map(a => a.label) : [];
    this.gradeLabels = this.gradeCodeObjects ? this.gradeCodeObjects.map(a => a.label) : [];
    this.fieldNames.forEach(value => this.enableDisableFieldsMap.set(value, false));
  },
  computed: {
    ...mapGetters('student', ['genders', 'demogCodeObjects', 'statusCodeObjects', 'gradeCodeObjects']),
    ...mapState('studentSearch', ['isAdvancedSearch'])
  },
  mounted() {
    this.refreshStudent();
  },
  methods: {
    changeStudentObjectValue(key, value) {
      this.studentCopy[`${key}`] = value;
      if (key === STUDENT_DETAILS_FIELDS.STATUS_CODE && value === 'M') {
        this.setEnableDisableForFields(true, STUDENT_DETAILS_FIELDS.MERGED_TO, STUDENT_DETAILS_FIELDS.PEN, STUDENT_DETAILS_FIELDS.STATUS_CODE);
      } else if (key === STUDENT_DETAILS_FIELDS.STATUS_CODE &&( value === 'D' || value === 'X')) {
        this.setEnableDisableForFields(true, STUDENT_DETAILS_FIELDS.STATUS_CODE);
      } else if (key === STUDENT_DETAILS_FIELDS.STATUS_CODE && value === 'A') {
        this.setEnableDisableForFields(false);
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
          this.genderError = false;
          return [];
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
      if (this.studentCopy.statusCode === 'M') {
        this.setEnableDisableForFields(true, STUDENT_DETAILS_FIELDS.MERGED_TO, STUDENT_DETAILS_FIELDS.PEN);
      }
      if (this.studentCopy.statusCode === 'D' || this.studentCopy.statusCode === 'X') {
        this.setEnableDisableForFields(true, STUDENT_DETAILS_FIELDS.STATUS_CODE);
      }
    },
    refreshStudent() {
      this.isLoading = true;
      ApiService.apiAxios
        .get(Routes['student'].ROOT_ENDPOINT + '/detail/' + this.studentID)
        .then(response => {
          this.setStudent(response.data);
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
      if(key === STUDENT_DETAILS_FIELDS.STATUS_CODE && this.origStudent[key] ==='D' ){
        this.setEnableDisableForFields(true);
      }else if(key === STUDENT_DETAILS_FIELDS.STATUS_CODE && this.origStudent[key] ==='A' ){
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
      this.studentCopy.statusCode = 'D';
      this.setEnableDisableForFields(true);
    },
    cancelDeceasedDialog() {
      this.deceasedDialog = false;
      this.studentCopy.statusCode = 'A';
      this.setEnableDisableForFields(false);
    },
    openDeceasedDialog() {
      if (this.studentCopy.statusCode === 'D') {
        this.deceasedDialog = true;
      }
    },
    saveStudent() {
      if (this.$refs.studentDetailForm.validate()) {
        ApiService.apiAxios
          .post(Routes['student'].ROOT_ENDPOINT, this.prepPut(this.studentCopy))
          .then(response => {
            this.setStudent(response.data);
          })
          .catch(error => {
            console.log(error);
          })
          .finally(() => {

          });
      }
    },
    prepPut(student) {
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
          const item = {
            value: element.statusCode,
            text: element.label,
          };
          statusCodeComboBox.push(item);
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
  height: 36px;
}

.darkBackgound.v-text-field > .v-input__control > .v-input__slot {
  background-color: #eeeeee;
}

.textAreaColumn {
  display: table-cell;
  min-height: 11em;
}

.sideCardField {
  display: table-cell;
  height: 3em;
}

.labelField {
  display: table-cell;
  height: 1em;
  padding-top: 9px !important;
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
  color: #02A7F0;
  font-weight: bolder;
}
</style>
