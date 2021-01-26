<template>
  <v-form id="mergeStudentForm"
          v-model="validForm" class="fill-height">
  <v-container fluid class="fill-height ma-0 pa-2 studentDetail">
    <v-row>
      <AlertMessage v-model="alert" :alertMessage="alertMessage" :alertType="alertType"></AlertMessage>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-row no-gutters class="mb-2">
          <v-col offset="2" cols="2">
            <p class="mincodeLabel">{{formatMincode(student.pen)}}</p>
          </v-col>
          <v-col offset="2" cols="2">
            <p class="mincodeLabel">{{formatMincode(mergedStudent.pen)}}</p>
          </v-col>
        </v-row>
        <v-divider/>
        <v-progress-linear
            indeterminate
            color="blue"
            :active="isProcessing"
        ></v-progress-linear>
        <v-row no-gutters class="mt-4 py-1">
          <v-col cols="2">
            <p class="labelField">Legal Surname</p>
          </v-col>
          <v-col cols="3">
            <v-text-field outlined dense max-length="255"
                          :id="STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME"
                          tabindex="1" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME)"
                          :rules="validateLegalLastName()"
                          v-model="student.legalLastName"></v-text-field>
          </v-col>
          <v-col offset="1" cols="3">
            <StudentDetailsCheckBoxWithOutputText :name="STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME" tab-index="21"
                                                  :model="mergedStudent.legalLastName?mergedStudent.legalLastName:''"
                                                  colspan="6" @update="handleCheckBoxChanged"
                                                  :disabled="student.legalLastName === mergedStudent.legalLastName"
            ></StudentDetailsCheckBoxWithOutputText>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="2">
            <p class="labelField">Legal Given</p>
          </v-col>
          <v-col cols="3">
            <v-text-field outlined dense max-length="255"
                          :id="STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME"
                          tabindex="2" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME)"
                          v-model="student.legalFirstName"></v-text-field>
          </v-col>
          <v-col offset="1" cols="3">
            <StudentDetailsCheckBoxWithOutputText :name="STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME" tab-index="22"
                                                  :model="mergedStudent.legalFirstName?mergedStudent.legalFirstName:''"
                                                  colspan="6" @update="handleCheckBoxChanged"
                                                  :disabled="student.legalFirstName === mergedStudent.legalFirstName"
            ></StudentDetailsCheckBoxWithOutputText>
          </v-col>
        </v-row>
        <v-row no-gutters class="py-1">
          <v-col cols="2">
            <p class="labelField">Legal Middle</p>
          </v-col>
          <v-col cols="3">
            <v-text-field outlined dense max-length="255"
                          :id="STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES"
                          tabindex="3" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES)"
                          v-model="student.legalMiddleNames"></v-text-field>
          </v-col>
          <v-col offset="1" cols="3">
            <StudentDetailsCheckBoxWithOutputText :name="STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES" tab-index="23"
                                                  :model="mergedStudent.legalMiddleNames?mergedStudent.legalMiddleNames:''"
                                                  colspan="6" @update="handleCheckBoxChanged"
                                                  :disabled="student.legalMiddleNames === mergedStudent.legalMiddleNames"
            ></StudentDetailsCheckBoxWithOutputText>
          </v-col>
        </v-row>
        <v-row no-gutters class="py-1">
          <v-col cols="2">
            <p class="labelField">Usual Surname</p>
          </v-col>
          <v-col cols="3">
            <v-text-field outlined dense max-length="255"
                          :id="STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME"
                          tabindex="4" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME)"
                          v-model="student.usualLastName"></v-text-field>
          </v-col>
          <v-col offset="1" cols="3">
            <StudentDetailsCheckBoxWithOutputText :name="STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME" tab-index="24"
                                                  :model="mergedStudent.usualLastName?mergedStudent.usualLastName:''"
                                                  colspan="6" @update="handleCheckBoxChanged"
                                                  :disabled="student.usualLastName === mergedStudent.usualLastName"
            ></StudentDetailsCheckBoxWithOutputText>
          </v-col>
        </v-row>
        <v-row no-gutters class="py-1">
          <v-col cols="2">
            <p class="labelField">Usual Given</p>
          </v-col>
          <v-col cols="3">
            <v-text-field outlined dense max-length="255"
                          :id="STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME"
                          tabindex="5" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME)"
                          v-model="student.usualFirstName"></v-text-field>
          </v-col>
          <v-col offset="1" cols="3">
            <StudentDetailsCheckBoxWithOutputText :name="STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME" tab-index="25"
                                                  :model="mergedStudent.usualFirstName?mergedStudent.usualFirstName:''"
                                                  colspan="6" @update="handleCheckBoxChanged"
                                                  :disabled="student.usualFirstName === mergedStudent.usualFirstName"
            ></StudentDetailsCheckBoxWithOutputText>
          </v-col>
        </v-row>
        <v-row no-gutters class="py-1">
          <v-col cols="2">
            <p class="labelField">Usual Middle</p>
          </v-col>
          <v-col cols="3">
            <v-text-field outlined dense max-length="255"
                          :id="STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES"
                          tabindex="6" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES)"
                          v-model="student.usualMiddleNames"></v-text-field>
          </v-col>
          <v-col offset="1" cols="3">
            <StudentDetailsCheckBoxWithOutputText :name="STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES" tab-index="26"
                                                  :model="mergedStudent.usualMiddleNames?mergedStudent.usualMiddleNames:''"
                                                  colspan="6" @update="handleCheckBoxChanged"
                                                  :disabled="student.usualMiddleNames === mergedStudent.usualMiddleNames"
            ></StudentDetailsCheckBoxWithOutputText>
          </v-col>
        </v-row>
        <v-row no-gutters class="py-1">
          <v-col cols="2">
            <p class="labelField">Gender</p>
          </v-col>
          <v-col cols="2">
            <v-text-field outlined dense maxlength="1"
                          :id="STUDENT_DETAILS_FIELDS.GENDER_CODE"
                          tabindex="7"
                          :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.GENDER_CODE)"
                          :rules="validateGender()"
                          v-model="student.genderCode" />
          </v-col>
          <v-col offset="2" cols="3">
            <StudentDetailsCheckBoxWithOutputText :name="STUDENT_DETAILS_FIELDS.GENDER_CODE" tab-index="27"
                                                  :model="mergedStudent.genderCode?mergedStudent.genderCode:''"
                                                  colspan="1" @update="handleCheckBoxChanged"
                                                  :disabled="student.genderCode === mergedStudent.genderCode"
            ></StudentDetailsCheckBoxWithOutputText>
          </v-col>
        </v-row>
        <v-row no-gutters class="py-1">
          <v-col cols="2">
            <p class="labelField">Date of Birth</p>
          </v-col>
          <v-col cols="2">
            <FormattedTextField
                tabindex="8"
                v-model="shortDOB"
                :id='STUDENT_DETAILS_FIELDS.DOB'
                :filled="false"
                :clearable="false"
                :rules="validateDOB()"
                :format="formatDob"
                maxlength="8"
            ></FormattedTextField>
          </v-col>
          <v-col offset="2" cols="3">
            <StudentDetailsCheckBoxWithOutputText :name="STUDENT_DETAILS_FIELDS.DOB" tab-index="28"
                                                  :model="mergedStudent.dob?formatDob(mergedStudent.dob, 'uuuu-MM-dd', 'uuuu/MM/dd'):''"
                                                  colspan="6" @update="handleCheckBoxChanged"
                                                  :disabled="student.dob === mergedStudent.dob"
            ></StudentDetailsCheckBoxWithOutputText>
          </v-col>
        </v-row>
        <v-row no-gutters class="py-1">
          <v-col cols="2">
            <p class="labelField">Mincode</p>
          </v-col>
          <v-col cols="2">
            <FormattedTextField
                tabindex="9"
                v-model="student.mincode"
                :id='STUDENT_DETAILS_FIELDS.MINCODE'
                :filled="false"
                :clearable="false"
                :async-messages="mincodeErrors"
                :format="formatMincode"
                :rules="validateMincode()"
                maxlength="8"
            ></FormattedTextField>
          </v-col>
          <v-col offset="2" cols="3">
            <StudentDetailsCheckBoxWithOutputText :name="STUDENT_DETAILS_FIELDS.MINCODE" tab-index="29"
                                                  :model="mergedStudent.mincode?formatMincode(mergedStudent.mincode):''"
                                                  colspan="6" @update="handleCheckBoxChanged"
                                                  :disabled="student.mincode === mergedStudent.mincode"
            ></StudentDetailsCheckBoxWithOutputText>
          </v-col>
        </v-row>
        <v-row no-gutters class="py-1">
          <v-col cols="2">
            <p class="labelField">Local ID</p>
          </v-col>
          <v-col cols="2">
            <v-text-field outlined dense maxlength="10"
                          :id="STUDENT_DETAILS_FIELDS.LOCAL_ID"
                          tabindex="10"
                          v-model="student.localID" />
          </v-col>
          <v-col offset="2" cols="3">
            <StudentDetailsCheckBoxWithOutputText :name="STUDENT_DETAILS_FIELDS.LOCAL_ID" tab-index="30"
                                                  :model="mergedStudent.localID?mergedStudent.localID:''"
                                                  colspan="6" @update="handleCheckBoxChanged"
                                                  :disabled="student.localID === mergedStudent.localID"
            ></StudentDetailsCheckBoxWithOutputText>
          </v-col>
        </v-row>
        <v-row no-gutters class="py-1">
          <v-col cols="2">
            <p class="labelField">Postal Code</p>
          </v-col>
          <v-col cols="2">
            <FormattedTextField
                tabindex="11"
                :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.POSTAL_CODE)"
                v-model="student.postalCode"
                :id='STUDENT_DETAILS_FIELDS.POSTAL_CODE'
                :filled="false"
                :clearable="false"
                :format="formatPostalCode"
                :rules="validatePostalCode()"
                maxlength="6"
            ></FormattedTextField>
          </v-col>
          <v-col offset="2" cols="3">
            <StudentDetailsCheckBoxWithOutputText :name="STUDENT_DETAILS_FIELDS.POSTAL_CODE" tab-index="31"
                                                  :model="mergedStudent.postalCode?formatPostalCode(mergedStudent.postalCode):''"
                                                  colspan="6" @update="handleCheckBoxChanged"
                                                  :disabled="student.postalCode === mergedStudent.postalCode"
            ></StudentDetailsCheckBoxWithOutputText>
          </v-col>
        </v-row>
        <v-row no-gutters class="py-1">
          <v-col cols="2">
            <p class="labelField">Memo</p>
          </v-col>
          <v-col cols="3">
            <v-textarea
                tabindex="12"
                v-model="student.memo"
                :id='STUDENT_DETAILS_FIELDS.MEMO'
                class="bolder customBorder"
                color="#000000"
                maxlength="4000"
                dense
                rows="3"
                no-resize
                outlined
            ></v-textarea>
          </v-col>
          <v-col offset="1" cols="3">
            <StudentDetailsCheckBoxWithOutputText maxlength="4000" :name="STUDENT_DETAILS_FIELDS.MEMO" tab-index="32"
                                            :model="mergedStudent.memo?mergedStudent.memo:''"
                                            colspan="11" @update="handleCheckBoxChanged"
                                            :disabled="student.memo === mergedStudent.memo"
                                            :is-text-area="true"
            ></StudentDetailsCheckBoxWithOutputText>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-progress-linear
        indeterminate
        color="blue"
        :active="isProcessing"
    ></v-progress-linear>
    <v-divider />
    <v-row>
      <v-col cols="12">
        <v-card-actions style="float: right;">
          <PrimaryButton :disabled="!hasAnyEdits() || !validForm || isProcessing" @click.native="performMerge()" text="Merge"></PrimaryButton>
        </v-card-actions>
      </v-col>
    </v-row>
  </v-container>
  <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
  </v-form>
</template>

<script>
import ApiService from '../../../common/apiService';
import {formatDob, formatMincode, formatPen, formatPostalCode} from '@/utils/format';
import {mapGetters} from 'vuex';
import {Routes, REQUEST_TYPES, STUDENT_DETAILS_FIELDS, STUDENT_CODES} from '@/utils/constants';
import FormattedTextField from '@/components/util/FormattedTextField';
import StudentDetailsCheckBoxWithOutputText from '@/components/penreg/student/StudentDetailsCheckBoxWithOutputText';
import PrimaryButton from '@/components/util/PrimaryButton';
import {isValidDob, isValidMincode, isValidPostalCode} from '@/utils/validation';
import alertMixin from '@/mixins/alertMixin';
import schoolMixin from '@/mixins/schoolMixin';
import AlertMessage from '@/components/util/AlertMessage';
import ConfirmationDialog from '@/components/util/ConfirmationDialog';

export default {
  name: 'MergeStudents',
  mixins: [alertMixin, schoolMixin],
  props: {
    mergedToPen: {
      type: Object,
      required: true
    },
    mergedFromPen: {
      type: Object,
      required: true
    },
  },
  components: {
    AlertMessage,
    PrimaryButton,
    FormattedTextField,
    StudentDetailsCheckBoxWithOutputText,
    ConfirmationDialog,
  },
  created() {
    this.genderCodes = this.genders ? this.genders.map(a => a.genderCode) : [];
    this.resetAlert();
  },
  mounted() {
    this.student = JSON.parse(JSON.stringify(this.mergedToPen));
    this.mergedStudent = JSON.parse(JSON.stringify(this.mergedFromPen));
    this.populateDOB(true);
  },
  watch: {
    notification(val) {
      if (val) {
        const notificationData = JSON.parse(val);
        if (notificationData && notificationData.studentID && notificationData.studentID === this.student.studentID && notificationData.sagaStatus === 'COMPLETED') {
          if (notificationData.sagaName === 'STUDENT_MERGE_COMPLETE_SAGA') {
            this.setSuccessAlert('Success! Merged has been completed');
            this.completeSagaInProgress = false;
          }
        }
      }
    },
  },
  data() {
    return {
      validForm: false,
      studentForm: null,
      student: {},
      mergedStudent: {},
      shortDOB: null,
      REQUEST_TYPES: REQUEST_TYPES,
      STUDENT_DETAILS_FIELDS:STUDENT_DETAILS_FIELDS,
      STUDENT_CODES: STUDENT_CODES,
      genderCodes: [],
      isProcessing: false,
      completeSagaInProgress: false,
    };
  },
  computed: {
    ...mapGetters('student', ['genders']),
    ...mapGetters('notifications', ['notification']),
  },
  methods: {
    formatPen,
    formatMincode,
    formatDob,
    formatPostalCode,
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
    validateLegalLastName(){
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
        this.student.dob = this.shortDOB? formatDob(this.shortDOB,'uuuuMMdd','uuuu-MM-dd') : '';
      }
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
    validateStudentStatuses() {
      if (this.student.status === 'M' || this.mergedStudent.status === 'M') {
        this.setFailureAlert('Error! PENs cannot be merged, as one of the PENs has a status of merged.');
        return false;
      }
      return true;
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
    handleCheckBoxChanged({key, value}) {
      if (key) {
        if (key === 'mincode' && this.isValidFormattedMincode(value)) {
          value = value.replace(/[^0-9]/g, '');
        }
        if (key === 'postalCode' && value.length === 7) {
          value = value.replace(' ', '');
        }
        this.student[`${key}`] = value;
        if (key === 'dob') {
          this.populateDOB(true);
        }
      }
    },
    async performMerge() {
      let result = await this.$refs.confirmationDialog.open('Are you sure you want to merge PENs?', 'Merging these records will break any twinned connections.',
        { color: '#fff', width: 520, closeIcon: true, dark: false, rejectText: 'No' });
      if (!result) {
        return;
      }

      window.scrollTo(0,0);

      // Status validation
      if (!this.validateStudentStatuses()) {
        return;
      }

      this.isProcessing = true;

      // Merge validation
      const hasAnyMergedFrom = await this.validateStudentHasAnyMergedFrom(this.mergedStudent.studentID);
      if (hasAnyMergedFrom) {
        this.isProcessing = false;
        return;
      }

      // Student Merge Complete Request
      this.alert = false;
      const mergeRequest = {...this.student,
        mergeStudentID: this.mergedStudent.id,
        studentMergeDirectionCode: 'FROM',
        studentMergeSourceCode: 'MI',
        requestStudentID: null
      };
      ApiService.apiAxios
        .post(Routes['penServices'].ROOT_ENDPOINT + '/' + mergeRequest.studentID + '/student-merge-complete', mergeRequest)
        .then(() => {
          this.setSuccessAlert('Your request to complete is accepted.');
          this.isProcessing = false;
          this.completeSagaInProgress = true;
        })
        .catch(error => {
          console.log(error);
          this.isProcessing = false;
          if (error.response.data && error.response.data.code && error.response.data.code === 409) {
            this.setFailureAlert('Another saga is in progress for this request, please try again later.');
          } else {
            this.setFailureAlert('Student Merge Request failed to update. Please navigate to the student search and merge again at compare in the list.');
          }
        });
    },
  }
};
</script>

<style scoped>

.mincodeLabel {
  font-size: 1.125em;
  font-weight: bolder;
}

</style>
