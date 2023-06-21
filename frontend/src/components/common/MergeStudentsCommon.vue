<template>
  <v-card fluid class="px-4" elevation="0">
    <v-card-title class="px-0 pb-0 pt-5">
      <v-row>
        <v-col v-if="title" cols="10" class="pr-0 pt-0 ml-2">
          {{ title }}
        </v-col>

        <v-col class="pt-0 d-flex justify-end">
          <v-btn id="closeStudentsMergeModalBtn" text icon
                 @click=closeStudentsMergeModal>
            <v-icon large color="#38598A">mdi-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>
    <v-form id="mergeStudentForm"
            v-model="validForm" class="fill-height">
      <v-container fluid class="fill-height ma-0 pa-2 pt-0 studentDetail">
        <v-row class="mt-0 pt-0">
          <v-col cols="12">
            <v-row no-gutters class="mb-2">
              <v-col offset="2" cols="3">
                <span class="penLabel">FROM:</span>
                <p class="penLinkLabel"><a @click="openStudentDetails(mergedStudent.studentID)">
                  {{ formatPen(mergedStudent.pen) }}
                </a></p>
              </v-col>
              <v-col offset="2" cols="3">
                <span class="penLabel">TO:</span>
                <p class="penLinkLabel"><a @click="openStudentDetails(student.studentID)">
                  {{ formatPen(student.pen) }}
                </a></p>
              </v-col>
            </v-row>
            <v-divider/>
            <v-progress-linear
                indeterminate
                color="blue"
                :active="isProcessing || isLoading"
            ></v-progress-linear>
            <v-row no-gutters class="mb-n1 mt-4 py-1">
              <v-col cols="2">
                <p class="labelField">Legal Surname</p>
              </v-col>
              <v-col cols="5">
                <StudentDetailsCheckBoxWithOutputText :name="STUDENT_MERGE_DETAILS_FIELDS.LEGAL_LAST_NAME" tab-index="21"
                                                      :model="mergedStudent.legalLastName?mergedStudent.legalLastName:''"
                                                      colspan="11" @update="handleCheckBoxChanged"
                                                      :disabled="fieldDisabled('legalLastName')"
                                                      v-if="!!mergedStudent.legalLastName"
                ></StudentDetailsCheckBoxWithOutputText>
              </v-col>
              <v-col cols="3">
                <v-text-field outlined dense maxlength="25"
                              :id="STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME"
                              class="true-pen-data"
                              :disabled="mergeSagaComplete"
                              tabindex="1" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME)"
                              :rules="validateLegalLastName()"
                              v-model="student.legalLastName"></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters class="mb-n1">
              <v-col cols="2">
                <p class="labelField">Legal Given</p>
              </v-col>
              <v-col cols="5">
                <StudentDetailsCheckBoxWithOutputText :name="STUDENT_MERGE_DETAILS_FIELDS.LEGAL_FIRST_NAME" tab-index="22"
                                                      :model="mergedStudent.legalFirstName?mergedStudent.legalFirstName:''"
                                                      colspan="11" @update="handleCheckBoxChanged"
                                                      :disabled="fieldDisabled('legalFirstName')"
                                                      v-if="!!mergedStudent.legalFirstName"
                ></StudentDetailsCheckBoxWithOutputText>
              </v-col>
              <v-col cols="3">
                <v-text-field outlined dense maxlength="25"
                              :id="STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME"
                              class="true-pen-data"
                              :disabled="mergeSagaComplete"
                              tabindex="2" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME)"
                              v-model="student.legalFirstName"></v-text-field>
              </v-col>

            </v-row>
            <v-row no-gutters class="mb-n1">
              <v-col cols="2">
                <p class="labelField">Legal Middle</p>
              </v-col>
              <v-col cols="5">
                <StudentDetailsCheckBoxWithOutputText :name="STUDENT_MERGE_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES" tab-index="23"
                                                      :model="mergedStudent.legalMiddleNames?mergedStudent.legalMiddleNames:''"
                                                      colspan="11" @update="handleCheckBoxChanged"
                                                      :disabled="fieldDisabled('legalMiddleNames')"
                                                      v-if="!!mergedStudent.legalMiddleNames"
                ></StudentDetailsCheckBoxWithOutputText>
              </v-col>
              <v-col cols="3">
                <v-text-field outlined dense maxlength="25"
                              :id="STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES"
                              class="true-pen-data"
                              :disabled="mergeSagaComplete"
                              tabindex="3" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES)"
                              v-model="student.legalMiddleNames"></v-text-field>
              </v-col>

            </v-row>
            <v-row no-gutters class="mb-n1">
              <v-col cols="2">
                <p class="labelField">Usual Surname</p>
              </v-col>
              <v-col cols="5">
                <StudentDetailsCheckBoxWithOutputText :name="STUDENT_MERGE_DETAILS_FIELDS.USUAL_LAST_NAME" tab-index="24"
                                                      :model="mergedStudent.usualLastName?mergedStudent.usualLastName:''"
                                                      colspan="11" @update="handleCheckBoxChanged"
                                                      :disabled="fieldDisabled('usualLastName')"
                                                      v-if="!!mergedStudent.usualLastName"
                ></StudentDetailsCheckBoxWithOutputText>
              </v-col>
              <v-col cols="3">
                <v-text-field outlined dense maxlength="25"
                              :id="STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME"
                              class="true-pen-data"
                              :disabled="mergeSagaComplete"
                              tabindex="4" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME)"
                              v-model="student.usualLastName"></v-text-field>
              </v-col>

            </v-row>
            <v-row no-gutters class="mb-n1">
              <v-col cols="2">
                <p class="labelField">Usual Given</p>
              </v-col>
              <v-col cols="5">
                <StudentDetailsCheckBoxWithOutputText :name="STUDENT_MERGE_DETAILS_FIELDS.USUAL_FIRST_NAME" tab-index="25"
                                                      :model="mergedStudent.usualFirstName?mergedStudent.usualFirstName:''"
                                                      colspan="11" @update="handleCheckBoxChanged"
                                                      :disabled="fieldDisabled('usualFirstName')"
                                                      v-if="!!mergedStudent.usualFirstName"
                ></StudentDetailsCheckBoxWithOutputText>
              </v-col>
              <v-col cols="3">
                <v-text-field outlined dense maxlength="25"
                              :id="STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME"
                              class="true-pen-data"
                              :disabled="mergeSagaComplete"
                              tabindex="5" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME)"
                              v-model="student.usualFirstName"></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters class="mb-n1">
              <v-col cols="2">
                <p class="labelField">Usual Middle</p>
              </v-col>
              <v-col cols="5">
                <StudentDetailsCheckBoxWithOutputText :name="STUDENT_MERGE_DETAILS_FIELDS.USUAL_MIDDLE_NAMES" tab-index="26"
                                                      :model="mergedStudent.usualMiddleNames?mergedStudent.usualMiddleNames:''"
                                                      colspan="11" @update="handleCheckBoxChanged"
                                                      :disabled="fieldDisabled('usualMiddleNames')"
                                                      v-if="!!mergedStudent.usualMiddleNames"
                ></StudentDetailsCheckBoxWithOutputText>
              </v-col>
              <v-col cols="3">
                <v-text-field outlined dense maxlength="25"
                              :id="STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES"
                              class="true-pen-data"
                              :disabled="mergeSagaComplete"
                              tabindex="6" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES)"
                              v-model="student.usualMiddleNames"></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters class="mb-n1">
              <v-col cols="2">
                <p class="labelField">Gender</p>
              </v-col>
              <v-col cols="5">
                <StudentDetailsCheckBoxWithOutputText :name="STUDENT_MERGE_DETAILS_FIELDS.GENDER_CODE" tab-index="27"
                                                      :model="mergedStudent.genderCode?mergedStudent.genderCode:''"
                                                      colspan="11" @update="handleCheckBoxChanged"
                                                      :disabled="fieldDisabled('genderCode')"
                                                      v-if="!!mergedStudent.genderCode"
                ></StudentDetailsCheckBoxWithOutputText>
              </v-col>
              <v-col cols="1">
                <v-text-field outlined dense maxlength="1"
                              :id="STUDENT_DETAILS_FIELDS.GENDER_CODE"
                              class="true-pen-data"
                              :disabled="mergeSagaComplete"
                              tabindex="7"
                              :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.GENDER_CODE)"
                              :rules="validateGender()"
                              v-model="student.genderCode"/>
              </v-col>
            </v-row>
            <v-row no-gutters class="mb-n1">
              <v-col cols="2">
                <p class="labelField">Date of Birth</p>
              </v-col>
              <v-col cols="5">
                <StudentDetailsCheckBoxWithOutputText :name="STUDENT_MERGE_DETAILS_FIELDS.DOB" tab-index="28"
                                                      :model="mergedStudent.dob?formatDob(mergedStudent.dob, 'uuuu-MM-dd', 'uuuu/MM/dd'):''"
                                                      colspan="11" @update="handleCheckBoxChanged"
                                                      :disabled="fieldDisabled('dob', isSameDate)"
                                                      v-if="!!mergedStudent.dob"
                ></StudentDetailsCheckBoxWithOutputText>
              </v-col>
              <v-col cols="2">
                <FormattedTextField
                    tabindex="8"
                    v-model="shortDOB"
                    :id='STUDENT_DETAILS_FIELDS.DOB'
                    class="true-pen-data"
                    :disabled="mergeSagaComplete"
                    :filled="false"
                    :clearable="false"
                    :rules="validateDOB()"
                    :format="formatDob"
                    maxlength="8"
                ></FormattedTextField>
              </v-col>
            </v-row>
            <v-row no-gutters class="mb-n1">
              <v-col cols="2">
                <p class="labelField">Mincode</p>
              </v-col>
              <v-col cols="5">
                <StudentDetailsCheckBoxWithOutputText :name="STUDENT_MERGE_DETAILS_FIELDS.MINCODE" tab-index="29"
                                                      :model="mergedStudent.mincode?mergedStudent.mincode:''"
                                                      colspan="11" @update="handleCheckBoxChanged"
                                                      :disabled="fieldDisabled('mincode')"
                                                      v-if="!!mergedStudent.mincode"
                ></StudentDetailsCheckBoxWithOutputText>
              </v-col>
              <v-col cols="2">
                <FormattedTextField
                    tabindex="9"
                    v-model="student.mincode"
                    :id='STUDENT_DETAILS_FIELDS.MINCODE'
                    class="true-pen-data"
                    :disabled="mergeSagaComplete"
                    :filled="false"
                    :clearable="false"
                    :async-messages="mincodeErrors"
                    :format="formatMincode"
                    :rules="validateMincode()"
                    maxlength="8"
                ></FormattedTextField>
              </v-col>
            </v-row>
            <v-row no-gutters class="mb-n1">
              <v-col cols="2">
                <p class="labelField">Local ID</p>
              </v-col>
              <v-col cols="5">
                <StudentDetailsCheckBoxWithOutputText :name="STUDENT_MERGE_DETAILS_FIELDS.LOCAL_ID" tab-index="30"
                                                      :model="mergedStudent.localID?mergedStudent.localID:''"
                                                      colspan="11" @update="handleCheckBoxChanged"
                                                      :disabled="fieldDisabled('localID')"
                                                      v-if="!!mergedStudent.localID"
                ></StudentDetailsCheckBoxWithOutputText>
              </v-col>
              <v-col cols="2">
                <v-text-field outlined dense maxlength="10"
                              :id="STUDENT_DETAILS_FIELDS.LOCAL_ID"
                              class="true-pen-data"
                              :disabled="mergeSagaComplete"
                              tabindex="10"
                              v-model="student.localID"/>
              </v-col>

            </v-row>
            <v-row no-gutters class="mb-n1">
              <v-col cols="2">
                <p class="labelField">Postal Code</p>
              </v-col>
              <v-col cols="5">
                <StudentDetailsCheckBoxWithOutputText :name="STUDENT_MERGE_DETAILS_FIELDS.POSTAL_CODE" tab-index="31"
                                                      :model="mergedStudent.postalCode?formatPostalCode(mergedStudent.postalCode):''"
                                                      colspan="11" @update="handleCheckBoxChanged"
                                                      :disabled="fieldDisabled('postalCode')"
                                                      v-if="!!mergedStudent.postalCode"
                ></StudentDetailsCheckBoxWithOutputText>
              </v-col>
              <v-col cols="2">
                <FormattedTextField
                    tabindex="11"
                    :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.POSTAL_CODE)"
                    v-model="student.postalCode"
                    :id='STUDENT_DETAILS_FIELDS.POSTAL_CODE'
                    class="true-pen-data"
                    :disabled="mergeSagaComplete"
                    :filled="false"
                    :clearable="false"
                    :format="formatPostalCode"
                    maxlength="7"
                ></FormattedTextField>
              </v-col>

            </v-row>
            <v-row no-gutters class="mb-n1">
              <v-col cols="2">
                <p class="labelField">Memo</p>
              </v-col>
              <v-col cols="4" class="mt-n1">
                <StudentDetailsCheckBoxWithOutputText maxlength="4000" :name="STUDENT_DETAILS_FIELDS.MEMO"
                                                      tab-index="32"
                                                      :model="mergedStudent.memo?mergedStudent.memo:''"
                                                      colspan="11" @update="handleCheckBoxChanged"
                                                      :disabled="fieldDisabled('memo')"
                                                      v-if="!!mergedStudent.memo"
                                                      :is-text-area="true"
                ></StudentDetailsCheckBoxWithOutputText>
              </v-col>
              <v-col offset="1" cols="4">
                <v-textarea
                    tabindex="12"
                    v-model="student.memo"
                    :id='STUDENT_DETAILS_FIELDS.MEMO'
                    :disabled="mergeSagaComplete"
                    class="memoscroll true-pen-data"
                    color="#000000"
                    maxlength="4000"
                    dense
                    rows="3"
                    no-resize
                    outlined
                    ref="memoTextarea"
                    @input="replaceMemoMacro"
                ></v-textarea>
                <MacroMenu
                  padding="pt-1"
                  margin="ml-0"
                  :macros="mergeMacros"
                  small
                  @select="insertMacroText"
                  :disabled="mergeSagaComplete"
                />
              </v-col>

            </v-row>
          </v-col>
        </v-row>
        <v-divider/>
        <v-row>
          <v-col cols="12">
            <v-card-actions style="float: right;">
              <PrimaryButton id="compareModalCancelBtn" text="Cancel" secondary @click.native=closeStudentsMergeModal></PrimaryButton>
              <PrimaryButton
                :disabled="!hasAnyEdits() || !validForm || isProcessing || mergeSagaComplete || isAMergedStudent"
                @click.native="performMerge()" text="Merge"></PrimaryButton>
            </v-card-actions>
          </v-col>
        </v-row>
      </v-container>
      <ConfirmationDialog ref="confirmationDialog">
        <template v-slot:message>
          <v-col class="my-n6">
            <v-row class="mb-5">
              Merging these records will break any twinned connections.
            </v-row>

            <v-row class="demographics-data">
              Merged To Demographics:
            </v-row>
            <v-row class="demographics-data">
              <strong>{{legalName}}</strong>
            </v-row>
            <v-row class="demographics-data">
              <strong>{{formatDob(shortDOB)}}</strong>
            </v-row>
            <v-row class="demographics-data">
              <strong>{{student.genderCode}}</strong>
            </v-row>
          </v-col>
        </template>
      </ConfirmationDialog>
    </v-form>
  </v-card>
</template>

<script>
import {formatDob, formatMincode, formatPen, formatPostalCode} from '@/utils/format';
import { mapState } from 'pinia';
import {
  REQUEST_TYPES,
  Routes,
  STUDENT_CODES,
  STUDENT_DETAILS_FIELDS,
  STUDENT_MERGE_DETAILS_FIELDS
} from '@/utils/constants';
import FormattedTextField from '@/components/util/FormattedTextField.vue';
import StudentDetailsCheckBoxWithOutputText from '@/components/penreg/student/StudentDetailsCheckBoxWithOutputText.vue';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import {isValidDob, isValidMincode, isValidPostalCode} from '@/utils/validation';
import alertMixin from '@/mixins/alertMixin';
import schoolMixin from '@/mixins/schoolMixin';
import servicesSagaMixin from '@/mixins/servicesSagaMixin';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';
import router from '@/router';
import ApiService from '@/common/apiService';
import staleStudentRecordMixin from '@/mixins/staleStudentRecordMixin';
import {deepCloneObject} from '@/utils/common';
import MacroMenu from '@/components/common/MacroMenu.vue';
import {replaceMacro, insertMacro} from '@/utils/macro';
import {notificationsStore} from '@/store/modules/notifications';
import {studentStore} from '@/store/modules/student';

export default {
  name: 'MergeStudentsCommon',
  mixins: [alertMixin, schoolMixin, servicesSagaMixin, staleStudentRecordMixin],
  props: {
    mergeStudentsModalOpen: {
      type: Boolean,
      required: true
    },
    mergedToStudentID: {
      type: String,
      required: true
    },
    mergedFromStudentID: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
  },
  components: {
    PrimaryButton,
    FormattedTextField,
    StudentDetailsCheckBoxWithOutputText,
    ConfirmationDialog,
    MacroMenu
  },
  watch: {
    notification(val) {
      if (val) {
        const notificationData = val;
        if (this.sagaId && this.sagaId === notificationData.sagaId && notificationData && notificationData.studentID && notificationData.studentID === this.mergedToStudent.studentID && notificationData.sagaStatus === 'COMPLETED') {
          if (notificationData.sagaName === 'PEN_SERVICES_STUDENT_MERGE_COMPLETE_SAGA') {
            this.notifyMergeSagaCompleteMessage();
          }
        } else if (notificationData.eventType === 'UPDATE_STUDENT' && notificationData.eventOutcome === 'STUDENT_UPDATED' && notificationData.eventPayload) {
          this.showWarningAndDisableActionIfUpdatedStudentMatched(notificationData);
        }
      }
    },
  },
  created() {
    this.genderCodes = this.genders ? this.genders.map(a => a.genderCode) : [];
    this.$store.dispatch('student/getCodes');
    this.$store.dispatch('student/getMacros');
  },
  async mounted() {

    const params = {
      params: {
        studentIDs: `${this.mergedToStudentID},${this.mergedFromStudentID}`
      }
    };
    try {
      this.isLoading = true;
      const students = await ApiService.apiAxios.get(Routes.student.GET_ALL_STUDENTS_BY_IDS, params);
      this.student = students.data.find(student => student.studentID === this.mergedToStudentID);
      this.studentBackup = deepCloneObject(this.student);
      this.checkedFields = _.mapValues(this.student, () => false);
      this.mergedStudent = students.data.find(student => student.studentID === this.mergedFromStudentID);
      this.isAMergedStudent = this.student?.statusCode === 'M' || this.mergedStudent?.statusCode === 'M';
      this.populateDOB(true);
    } catch (e) {
      console.error(e);
      this.setFailureAlert('Failed to Load student details, please try again later.');
    } finally {
      this.isLoading = false;
    }

  },
  data() {
    return {
      validForm: false,
      studentForm: null,
      student: {},
      studentBackup: null,
      mergedStudent: {},
      shortDOB: null,
      REQUEST_TYPES: REQUEST_TYPES,
      STUDENT_DETAILS_FIELDS: STUDENT_DETAILS_FIELDS,
      STUDENT_MERGE_DETAILS_FIELDS,
      STUDENT_CODES: STUDENT_CODES,
      genderCodes: [],
      isStudentUpdated: false,
      isLoading: false,
      isAMergedStudent: false,
      checkedFields: {},
    };
  },
  computed: {
    ...mapState(notificationsStore, ['notification']),
    ...mapState(studentStore, ['mergeMacros', 'genders']),
    legalName() {
      return `${this.student.legalLastName || ''}, ${this.student.legalFirstName || ''}, ${this.student.legalMiddleNames || ''}`.replace(/(, )+$/g, ',');
    }
  },
  methods: {
    formatPen,
    formatDob,
    formatMincode,
    formatPostalCode,
    openStudentDetails(studentID) {
      const route = router.resolve({name: REQUEST_TYPES.student.label, params: {studentID: studentID}});
      window.open(route.href, '_blank');
    },
    upperCaseInput(fieldName) {
      if (this.student[fieldName]) {
        this.student[fieldName] = this.student[fieldName].toUpperCase();
      }
    },
    hasEdits(key) {
      let studentCopy = this.student[key];
      let studentOriginal = this.mergedToPen[key];
      studentCopy = (studentCopy === null || studentCopy === undefined) ? '' : studentCopy;
      studentOriginal = (studentOriginal === null || studentOriginal === undefined) ? '' : studentOriginal;
      return studentCopy !== studentOriginal;
    },
    hasAnyEdits() {
      return JSON.stringify(this.student) !== JSON.stringify(this.mergedToPen);
    },
    validateLegalLastName() {
      if (this.student) {
        if (!this.student.legalLastName || this.student.legalLastName.length < 2) {
          return ['Legal Surname is required and must be more than one character.'];
        }
      }
      return [];
    },
    getGenderCodes() {
      if (this.genders && this.genderCodes.length === 0) {
        this.genderCodes = this.genders.map(a => a.genderCode);
      }
      return this.genderCodes;
    },
    validateGender() {
      if (this.student) {
        if (!this.student.genderCode) {
          this.genderError = true;
          return ['Gender is required.'];
        } else {
          if (this.getGenderCodes().includes(this.student.genderCode)) {
            this.genderError = false;
            return [];
          }
        }
      }

      this.genderError = true;
      return [
        'Invalid Gender Code'
      ];
    },
    validateDOB() {
      if (this.student) {
        if (!this.shortDOB) {
          this.dobError = true;
          this.populateDOB();
          return ['Required'];
        } else {
          if (isValidDob(this.shortDOB, 'uuuuMMdd')) {
            this.dobError = false;
            this.populateDOB();
            return [];
          }
        }
      }
      this.dobError = true;
      return [
        'Invalid Date of Birth'
      ];
    },
    populateDOB(initialLoad) {
      if (initialLoad) {
        this.shortDOB = this.student.dob.replace(/[^0-9]/g, '');
      } else {
        this.student.dob = this.shortDOB ? this.formatDob(this.shortDOB, 'uuuuMMdd', 'uuuu/MM/dd') : '';
      }
    },
    isSameDate(date1, date2) {
      const dateStr1 = date1.replace(/[^0-9]/g, '');
      const dateStr2 = date2.replace(/[^0-9]/g, '');
      return dateStr1 === dateStr2;
    },
    // Asynchronous validator returns an array of boolean or string that would be provided for :rules prop of input field
    validateMincode() {
      return [v => {
        if (this.isValidFormattedMincode(v)) { // skip when no input or the formatted text is set for view
          return true;
        }
        this.schoolLabel = '';
        if (this.student) {
          if (this.student.mincode) {
            if (!isValidMincode(this.student.mincode)) { // format error
              this.mincodeError = true;
              return this.mincodeHint;
            }
            if (this.student.mincode.length !== 8) { // length error
              this.mincodeError = true;
              return this.mincodeHint + this.mincodeAdditionalHint;
            }
            this.getSchoolName(this.student.mincode);
          }
        }
        return true;
      }];
    },
    validatePostalCode() {
      if (this.student.postalCode && !isValidPostalCode(this.student.postalCode)) {
        return ['Invalid Postal Code.'];
      }
    },
    handleCheckBoxChanged({key, value: checked}) {
      if (key) {
        this.checkedFields[key] = checked;
        let fieldValue = checked ? this.mergedStudent[key] : this.studentBackup[key];
        if (key === 'mincode' && this.isValidFormattedMincode(fieldValue)) {
          fieldValue = fieldValue.replace(/[^0-9]/g, '');
        }
        if (key === 'postalCode' && fieldValue.length === 7) {
          fieldValue = fieldValue.replace(' ', '');
        }
        this.student[key] = fieldValue;
        if (key === 'dob') {
          this.populateDOB(true);
        }
      }
    },
    async performMerge() {
      if (this.isStudentUpdated) {
        const warningMessage = this.getMessageForStudent(this.student?.studentID) || this.getMessageForStudent(this.mergedStudent?.studentID);
        this.setWarningAlert(warningMessage);
        return;
      }
      let result = await this.$refs.confirmationDialog.open('Are you sure you want to merge PENs?', null,
        {color: '#fff', width: 520, closeIcon: true, dark: false, rejectText: 'No'});
      if (!result) {
        return;
      }

      window.scrollTo(0, 0);

      this.mergedToStudent = this.student;
      this.mergedFromStudent = this.mergedStudent;
      await this.executeMerge();
    },
    showWarningAndDisableActionIfUpdatedStudentMatched(notificationData) {
      try {
        const student = JSON.parse(notificationData.eventPayload);
        if (student?.pen && (student?.pen === this.student?.pen || student?.pen === this.mergedStudent?.pen) && !this.isProcessing) { // show only when it is in a diff tab or diff user.
          this.isStudentUpdated = true;
          const warningMessage = `Student details for ${student.pen} is updated by ${student.updateUser}, Please refresh the page.`;
          this.setWarningAlert(warningMessage);
          const studentID = student.studentID;
          this.addStaleDataToMap({studentID, warningMessage});
        }
      } catch (e) {
        console.error(e);
      }
    },
    closeStudentsMergeModal() {
      this.$emit('mergeStudentsModalOpenEmit', false);
    },
    insertMacroText(macroText) {
      this.student.memo = insertMacro(macroText, this.student.memo, this.$refs.memoTextarea.$refs.input);
    },
    replaceMemoMacro() {
      this.student.memo = replaceMacro(this.student.memo, this.mergeMacros);
    },
    fieldDisabled(fieldName, equalityCompare) {
      const isSameValue = equalityCompare ? equalityCompare(this.student[fieldName], this.mergedStudent[fieldName]) && equalityCompare(this.student[fieldName], this.studentBackup[fieldName]) :
        this.student[fieldName] === this.mergedStudent[fieldName] && this.student[fieldName] === this.studentBackup[fieldName];
      return (isSameValue && !this.checkedFields[fieldName]) || this.mergeSagaComplete;
    }
  }
};
</script>

<style scoped>

.penLabel {
  font-size: 1.125em;
  font-weight: bolder;
}

.penLinkLabel {
  font-size: 1.125em;
  font-weight: bolder;
  color: #1976d2;
  text-decoration: underline;
}

.memoscroll.v-textarea >>> .v-input__control > .v-input__slot > .v-text-field__slot > #memo{
  margin-bottom: 0px;
  margin-top: 0px;
  margin-right: 0px;
}

.memoscroll.v-textarea >>> .v-text-field__details {
  display: none;
}

.demographics-data {
  font-size: 1rem;
}

.true-pen-data.v-input >>> textarea,
.true-pen-data.v-input >>> input{
  color: #000 !important;
  font-weight: bold;
}
</style>
