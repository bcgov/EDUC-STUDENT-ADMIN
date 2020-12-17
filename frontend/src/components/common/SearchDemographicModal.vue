<template>
  <v-row justify="center">
    <v-dialog v-model="searchDemographicDialog"
              max-width="75%"
              persistent
    >

      <v-card>
        <v-list-item>
          <v-list-item-content class="pt-4 pl-2">
            <slot name="headLine">
              <v-list-item-title class="headline">
                Modify search
              </v-list-item-title>
              <v-list-item-subtitle><em>Modifying the search parameters will not change the request.</em></v-list-item-subtitle>
            </slot>
          </v-list-item-content>
          <v-list-item-icon>
            <v-btn id="closeSearchDemographicModalBtn" text icon @click="$emit('closeDialog')">
              <v-icon large color="#38598A">mdi-close</v-icon>
            </v-btn>
          </v-list-item-icon>
        </v-list-item>
        <v-spacer/>
        <v-card-text>
          <v-form ref="searchDemographicModalForm" v-model="isValidForm">
            <v-row>
              <v-col cols="12">
                <v-row dense no-gutters>
                  <v-col cols="3"><Strong>Legal Surname</Strong></v-col>
                  <v-spacer/>
                  <v-col cols="3"><strong>Legal Given</strong></v-col>
                  <v-spacer/>
                  <v-col cols="3"><strong>Legal Middle</strong></v-col>
                  <v-spacer/>
                </v-row>
                <v-row dense>
                  <v-col cols="3">
                    <v-text-field id="searchDemogModalLegalLastNameTxtField" outlined dense filled
                                  :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME)"
                                  :rules="validateLegalLastName()"
                                  :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME)"
                                  required tabindex="1"
                                  clearable
                                  v-model="student.legalLastName"></v-text-field>
                  </v-col>
                  <v-spacer/>
                  <v-col cols="3">
                    <v-text-field outlined dense filled
                                  id="searchDemogModalLegalFirstNameTxtField"
                                  :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME)"
                                  :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME)"
                                  tabindex="2"
                                  clearable
                                  v-model="student.legalFirstName"></v-text-field>
                  </v-col>
                  <v-spacer/>
                  <v-col cols="3">
                    <v-text-field outlined dense filled
                                  id="searchDemogModalLegalMiddleNameTxtField"
                                  :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES)"
                                  tabindex="3" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES)"
                                  clearable
                                  v-model="student.legalMiddleNames"></v-text-field>
                  </v-col>
                  <v-spacer/>
                </v-row>
                <v-row dense no-gutters>
                  <v-col cols="3"><Strong>Usual Surname </Strong></v-col>
                  <v-spacer/>
                  <v-col cols="3"><strong>Usual Given</strong></v-col>
                  <v-spacer/>
                  <v-col cols="3"><strong>Usual Middle</strong></v-col>
                  <v-spacer/>
                </v-row>
                <v-row dense>
                  <v-col cols="3">
                    <v-text-field outlined dense filled
                                  id="searchDemogModalUsualLastNameTxtField"
                                  :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME)"
                                  tabindex="4" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME)"
                                  clearable
                                  v-model="student.usualLastName"></v-text-field>
                  </v-col>
                  <v-spacer/>
                  <v-col cols="3">
                    <v-text-field outlined dense filled
                                  id="searchDemogModalUsualFirstNameTxtField"
                                  :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME)"
                                  tabindex="5" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME)"
                                  clearable
                                  v-model="student.usualFirstName"></v-text-field>
                  </v-col>
                  <v-spacer/>
                  <v-col cols="3">
                    <v-text-field outlined dense filled
                                  id="searchDemogModalUsualMiddleNameTxtField"
                                  :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES)"
                                  tabindex="6" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES)"
                                  clearable
                                  v-model="student.usualMiddleNames"></v-text-field>
                  </v-col>
                  <v-spacer/>
                </v-row>
                <v-row dense no-gutters>
                  <v-col cols="3"><Strong>Gender</Strong></v-col>
                  <v-spacer/>
                  <v-col cols="3"><strong>Birth Date
                    <v-btn icon class="" title="YYYYMMDD">
                      <v-icon color="#2196f3">
                        info
                      </v-icon>
                    </v-btn>
                  </strong></v-col>
                  <v-spacer/>
                  <v-col cols="3"><strong>Grade</strong></v-col>
                  <v-spacer/>
                </v-row>
                <v-row dense>
                  <v-col cols="3">
                    <v-text-field outlined dense filled
                                  id="searchDemogModalGenderTxtField"
                                  :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.GENDER_CODE)"
                                  :rules="validateGender()" maxlength="1"
                                  tabindex="7" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.GENDER_CODE)"
                                  clearable
                                  v-model="student.genderCode"></v-text-field>
                  </v-col>
                  <v-spacer/>
                  <v-col cols="3">
                    <v-text-field outlined dense filled
                                  id="searchDemogModalDobTxtField"
                                  :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.DOB)"
                                  :rules="validateDOB()" maxlength="10"
                                  clearable
                                  tabindex="8"
                                  v-model="dobLabel"></v-text-field>
                  </v-col>
                  <v-spacer/>
                  <v-col cols="3">
                    <v-text-field outlined dense filled
                                  id="searchDemogModalGradeTxtField"
                                  :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.GRADE_CODE)"
                                  :rules="validateGradeCode()" maxlength="2"
                                  tabindex="9" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.GRADE_CODE)"
                                  clearable
                                  v-model="student.gradeCode"></v-text-field>
                  </v-col>
                  <v-spacer/>
                </v-row>
                <v-row dense no-gutters>
                  <v-col cols="3"><Strong>Postal Code</Strong></v-col>
                  <v-spacer/>
                  <v-col  v-if="!isMincodeHidden" cols="3"><strong>Mincode</strong></v-col>
                  <v-spacer/>
                  <v-col cols="3"></v-col>
                  <v-spacer/>
                </v-row>
                <v-row dense>
                  <v-col cols="3">
                    <v-text-field outlined dense filled
                                  id="searchDemogModalPostalCodeTxtField"
                                  :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.POSTAL_CODE)"
                                  :rules="validatePostalCode()" maxlength="6"
                                  tabindex="10" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.POSTAL_CODE)"
                                  clearable
                                  v-model="student.postalCode"></v-text-field>
                  </v-col>
                  <v-spacer/>
                  <v-col v-if="!isMincodeHidden" cols="3">
                    <v-text-field outlined dense filled
                                  id="searchDemogModalMincodeTxtField"
                                  :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.MINCODE)"
                                  :rules="validateMincode()" maxlength="8" minlength="8"
                                  clearable
                                  tabindex="11"
                                  v-model="student.mincode"></v-text-field>
                  </v-col>
                  <v-spacer/>
                  <v-col cols="3"></v-col>
                  <v-spacer/>
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
import {isValidMinCode, isValidPostalCode, isValidDOBAndAfter1900} from '@/utils/validation';
import {mapGetters} from 'vuex';
import {formatDob} from '@/utils/format';

export default {
  name: 'SearchDemographicModal.vue',
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
    isMincodeHidden:{
      type: Boolean,
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
      dobLabel: null,
    };
  },
  computed: {
    ...mapGetters('student', ['genders', 'demogCodeObjects', 'statusCodeObjects', 'gradeCodeObjects']),
  },
  watch: {
    dialog(newValue) {
      this.searchDemographicDialog = newValue;
    },
    studentData(newValue) {
      this.student = newValue;
      this.setDobLabel();
    }
  },
  methods: {
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
        this.$emit('closeDialog');
        this.$emit('updateStudent', this.student);
      }
    },
    validateMincode() {
      if (this.student.mincode) {
        if (!isValidMinCode(this.student.mincode) || this.student.mincode.length !== 8) {
          return ['Invalid mincode, should be exactly 8 digits.'];
        }
      }
    },
    validateDOB() {
      return [v => {
        this.setDob(v);
        if (!this.student.dob) {
          return 'Birth Date is Required.';
        }
        if (!isValidDOBAndAfter1900(this.student.dob,'uuuuMMdd')) {
          return 'Invalid Birth Date.';
        }
      }];
    },
    fillDOBSlashes() {
      if (this.student.dob) {
        if (this.student.dob.length === 4 || this.student.dob.length === 7) {
          this.student.dob += '/';
        }
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
    setDobLabel() {
      if (this.student.dob) {
        this.dobLabel = formatDob(this.student.dob, 'uuuuMMdd', 'uuuu/MM/dd');
      }
    },
    setDob(dobLabel) {
      if (dobLabel) {
        this.student.dob = dobLabel.replace(/[^0-9]/g, '');
      } else {
        this.student.dob = null;
      }
    },
  }
};
</script>

<style scoped>
.subheader-divider {
  border-width: 0.75ex 0 0 0;
}
</style>
