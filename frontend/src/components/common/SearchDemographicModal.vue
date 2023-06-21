<template>
  <v-row justify="center">
    <v-dialog v-model="searchDemographicDialog"
              max-width="55%"
    >

      <v-card>
        <v-card-title class="px-0 pb-0 pt-5">
          <v-list-item>
            <v-list-item-content class="pt-0 pl-2">
              <slot name="headLine">
                <v-list-item-title class="headline">
                  Modify Query
                </v-list-item-title>
                <v-list-item-subtitle><em>Modifying the search parameters will not change the request.</em></v-list-item-subtitle>
              </slot>
            </v-list-item-content>
            <v-list-item-icon class="my-0">
              <v-btn id="closeSearchDemographicModalBtn" text icon @click="searchDemographicDialog=false">
                <v-icon large color="#38598A">mdi-close</v-icon>
              </v-btn>
            </v-list-item-icon>
          </v-list-item>
        </v-card-title>
        <v-spacer/>
        <v-card-text>
          <v-form ref="searchDemographicModalForm" v-model="isValidForm">
            <v-row dense no-gutters class="py-3">
              <v-col cols="4">
                <v-row dense no-gutters>
                  <strong>Legal Surname</strong>
                </v-row>
                <v-row dense no-gutters>
                  <v-col cols="11">
                    <v-text-field id="searchDemogModalLegalLastNameTxtField" outlined dense filled
                                  :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME)"
                                  :rules="validateLegalLastName()"
                                  :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME)"
                                  required tabindex="1"
                                  clearable
                                  v-model="student.legalLastName"></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="4">
                <v-row dense no-gutters>
                  <strong>Legal Given</strong>
                </v-row>
                <v-row dense no-gutters>
                  <v-col cols="11">
                    <v-text-field outlined dense filled
                                  id="searchDemogModalLegalFirstNameTxtField"
                                  :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME)"
                                  :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME)"
                                  tabindex="2"
                                  clearable
                                  v-model="student.legalFirstName"></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
              <v-col v-if="!hiddenFields.includes(STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES)" cols="4">
                <v-row dense no-gutters>
                  <strong>Legal Middle</strong>
                </v-row>
                <v-row dense no-gutters>
                  <v-col cols="11">
                    <v-text-field outlined dense filled
                                  id="searchDemogModalLegalMiddleNameTxtField"
                                  :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES)"
                                  tabindex="3" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES)"
                                  clearable
                                  v-model="student.legalMiddleNames"></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
              <v-col v-if="!hiddenFields.includes(STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME)" cols="4">
                <v-row dense no-gutters>
                  <strong>Usual Surname</strong>
                </v-row>
                <v-row dense no-gutters>
                  <v-col cols="11">
                    <v-text-field outlined dense filled
                                  id="searchDemogModalUsualLastNameTxtField"
                                  :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME)"
                                  tabindex="4" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME)"
                                  clearable
                                  v-model="student.usualLastName"></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
              <v-col v-if="!hiddenFields.includes(STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME)" cols="4">
                <v-row dense no-gutters>
                  <strong>Usual Given</strong>
                </v-row>
                <v-row dense no-gutters>
                  <v-col cols="11">
                    <v-text-field outlined dense filled
                                  id="searchDemogModalUsualFirstNameTxtField"
                                  :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME)"
                                  tabindex="5" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME)"
                                  clearable
                                  v-model="student.usualFirstName"></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
              <v-col v-if="!hiddenFields.includes(STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES)" cols="4">
                <v-row dense no-gutters>
                  <strong>Usual Middle</strong>
                </v-row>
                <v-row dense no-gutters>
                  <v-col cols="11">
                    <v-text-field outlined dense filled
                                  id="searchDemogModalUsualMiddleNameTxtField"
                                  :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES)"
                                  tabindex="6" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES)"
                                  clearable
                                  v-model="student.usualMiddleNames"></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="4">
                <v-row dense no-gutters>
                  <strong>Gender</strong>
                </v-row>
                <v-row dense no-gutters>
                  <v-col cols="11">
                    <v-text-field outlined dense filled
                                  id="searchDemogModalGenderTxtField"
                                  :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.GENDER_CODE)"
                                  :rules="validateGender()" maxlength="1"
                                  tabindex="7" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.GENDER_CODE)"
                                  clearable
                                  v-model="student.genderCode"></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="4">
                <v-row dense no-gutters>
                  <strong>Birth Date</strong>
                  <v-btn icon x-small title="YYYYMMDD">
                    <v-icon color="#2196f3">
                      info
                    </v-icon>
                  </v-btn>
                </v-row>
                <v-row dense no-gutters>
                  <v-col cols="11">
                    <FormattedTextField
                            id="searchDemogModalDobTxtField"
                            :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.DOB)"
                            :rules="validateDOB()" maxlength="8"
                            tabindex="8"
                            :format="formatDob"
                            v-model="student.dob"></FormattedTextField>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="4">
                <v-row dense no-gutters>
                  <strong>Grade</strong>
                </v-row>
                <v-row dense no-gutters>
                  <v-col cols="11">
                    <v-text-field outlined dense filled
                                  id="searchDemogModalGradeTxtField"
                                  :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.GRADE_CODE)"
                                  :rules="validateGradeCode()" maxlength="2"
                                  tabindex="9" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.GRADE_CODE)"
                                  clearable
                                  v-model="student.gradeCode"></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
              <v-col v-if="!hiddenFields.includes(STUDENT_DETAILS_FIELDS.POSTAL_CODE)" cols="4">
                <v-row dense no-gutters>
                  <strong>Postal Code</strong>
                </v-row>
                <v-row dense no-gutters>
                  <v-col cols="11">
                    <FormattedTextField
                            id="searchDemogModalPostalCodeTxtField"
                            :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.POSTAL_CODE)"
                            maxlength="7"
                            tabindex="10" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.POSTAL_CODE)"
                            :format="formatPostalCode"
                            v-model="student.postalCode">
                    </FormattedTextField>
                  </v-col>
                </v-row>
              </v-col>
              <v-col v-if="!hiddenFields.includes(STUDENT_DETAILS_FIELDS.MINCODE)" cols="4">
                <v-row dense no-gutters>
                  <strong>Mincode</strong>
                </v-row>
                <v-row dense no-gutters>
                  <v-col cols="11">
                    <FormattedTextField
                            id="searchDemogModalMincodeTxtField"
                            :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.MINCODE)"
                            :rules="validateMincode()" maxlength="8"
                            :async-messages="mincodeErrors"
                            tabindex="11"
                            :format="formatMincode"
                            v-model="student.mincode"></FormattedTextField>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-form>
          <v-divider class="subheader-divider"/>
        </v-card-text>

        <v-card-actions class="mr-4 pb-6">
          <v-spacer/>
          <slot name="actions" :isFormValid="isFormValid">
          </slot>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import {STUDENT_DETAILS_FIELDS} from '@/utils/constants';
import {isValidMincode, isValidPostalCode, isValidDOBAndAfter1900} from '@/utils/validation';
import { mapState } from 'pinia';
import FormattedTextField from '../util/FormattedTextField.vue';
import {formatPostalCode, formatDob, formatMincode} from '@/utils/format';
import schoolMixin from '../../mixins/schoolMixin';
import {studentStore} from '@/store/modules/student';

export default {
  name: 'SearchDemographicModal',
  mixins: [schoolMixin],
  components: {FormattedTextField},
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    studentData: {
      type: Object,
      required: true,
    },
    isFieldReadOnly: {
      type: Function,
      required: true,
    },
    hiddenFields:{
      type: Array,
      required: true
    }
  },
  data() {
    return {
      searchDemographicDialog: false,
      persistent: false,
      isValidForm: false,
      STUDENT_DETAILS_FIELDS: STUDENT_DETAILS_FIELDS,
      student: this.studentData,
      genderCodes: [],
      gradeCodes: [],
    };
  },
  computed: {
    ...mapState(studentStore, ['genders', 'demogCodeObjects', 'statusCodeObjects', 'gradeCodeObjects']),
  },
  watch: {
    dialog(newValue) {
      this.searchDemographicDialog = newValue;
    },
    searchDemographicDialog(newValue) {
      if(!newValue && this.dialog) {
        this.$emit('closeDialog');
      }
    },
    studentData(newValue) {
      this.student = newValue;
    }
  },
  methods: {
    formatPostalCode,
    formatDob,
    formatMincode,
    upperCaseInput(fieldName) {
      if (this.student[fieldName]) {
        this.student[fieldName] = this.student[fieldName].toUpperCase();
      }
    },
    validateLegalLastName() {
      if (!this.student.legalLastName || this.student.legalLastName.length < 2) {
        return ['Legal Surname is required and must be more than one character.'];
      }
      return [];
    },
    validateGender() {
      if (!this.student.genderCode) {
        return ['Gender is required.'];
      } else {
        if (this.getGenderCodes().includes(this.student.genderCode)) {
          return [];
        }
      }
      return [
        'Invalid Gender Code'
      ];
    },
    isFormValid() {
      if (this.$refs.searchDemographicModalForm.validate()) {
        this.$emit('updateStudent', this.student);
      }
    },
    validateMincode() {
      return [v => {
        if (!v || this.isValidFormattedMincode(v)) { // skip when no input or the formatted text is set for view
          return true;
        }
        if (this.student.mincode) {
          if (!isValidMincode(this.student.mincode)) {
            return this.mincodeHint;
          }
          if (this.student.mincode.length !== 8) {
            return this.mincodeHint + this.mincodeAdditionalHint;
          }
          this.getSchoolName(this.student.mincode);
        }
        return true;
      }];
    },
    validateDOB() {
      if (!this.student.dob) {
        return ['Birth Date is Required.'];
      }
      if (!isValidDOBAndAfter1900(this.student.dob,'uuuuMMdd')) {
        return ['Invalid Birth Date.'];
      }
    },
    validateGradeCode() {
      if (this.student.gradeCode && !this.getGradeCodes().includes(this.student.gradeCode)) {
        return ['Invalid Grade Code.'];
      }
    },
    validatePostalCode() {
      if (this.student.postalCode && !isValidPostalCode(this.student.postalCode)) {
        return ['Invalid Postal Code.'];
      }
    },
    getGenderCodes() {
      if (this.genders && this.genderCodes.length === 0) {
        this.genderCodes = this.genders.map(a => a.genderCode);
      }
      return this.genderCodes;
    },
    getGradeCodes() {
      if (this.gradeCodeObjects && this.gradeCodes.length === 0) {
        this.gradeCodes = this.gradeCodeObjects.map(a => a.gradeCode);
      }
      return this.gradeCodes;
    },
  }
};
</script>

<style scoped>
.subheader-divider {
  border-width: 0.75ex 0 0 0;
}
</style>
