<template>
  <v-row justify="center">
    <v-dialog
      v-model="searchDemographicDialog"
      max-width="55%"
    >
      <v-card>
        <v-card-title class="px-0 pb-0 pt-5">
          <v-list-item>
            <v-list-item class="pt-0 pl-2">
              <v-row>
                <v-col cols="auto">
                  <v-list-item-title class="headline">
                    Modify Query
                  </v-list-item-title>
                  <v-list-item-subtitle><em>Modifying the search parameters will not change the request.</em>
                  </v-list-item-subtitle>
                </v-col>
                <v-col class="d-flex justify-end">
                  <v-btn
                    id="closeSearchDemographicModalBtn"
                    variant="flat"
                    size="small"
                    icon="mdi-close"
                    @click="searchDemographicDialog=false"
                  >
                  </v-btn>
                </v-col>
              </v-row>
            </v-list-item>
          </v-list-item>
        </v-card-title>
        <v-spacer/>
        <v-card-text>
          <v-form
            ref="searchDemographicModalForm"
            :model-value="isValidForm"
          >
            <v-row
              density="compact"
              no-gutters
              class="py-3"
            >
              <v-col cols="4">
                <v-row
                  density="compact"
                  no-gutters
                >
                  <strong>Legal Surname</strong>
                </v-row>
                <v-row
                  density="compact"
                  no-gutters
                >
                  <v-col cols="11">
                    <v-text-field
                      id="searchDemogModalLegalLastNameTxtField"
                      v-model="student.legalLastName"
                      variant="outlined"
                      density="compact"
                      maxlength="25"
                      :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME)"
                      :rules="validateLegalLastName()"
                      :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME)"
                      @update:model-value="validateForm"
                      required
                      tabindex="1"
                      clearable
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="4">
                <v-row
                  density="compact"
                  no-gutters
                >
                  <strong>Legal Given</strong>
                </v-row>
                <v-row
                  density="compact"
                  no-gutters
                >
                  <v-col cols="11">
                    <v-text-field
                      id="searchDemogModalLegalFirstNameTxtField"
                      v-model="student.legalFirstName"
                      maxlength="25"
                      variant="outlined"
                      density="compact"
                      filled
                      @update:model-value="validateForm"
                      :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME)"
                      :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME)"
                      tabindex="2"
                      clearable
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col
                v-if="!hiddenFields.includes(STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES)"
                cols="4"
              >
                <v-row
                  density="compact"
                  no-gutters
                >
                  <strong>Legal Middle</strong>
                </v-row>
                <v-row
                  density="compact"
                  no-gutters
                >
                  <v-col cols="11">
                    <v-text-field
                      id="searchDemogModalLegalMiddleNameTxtField"
                      v-model="student.legalMiddleNames"
                      variant="outlined"
                      maxlength="25"
                      density="compact"
                      @update:model-value="validateForm"
                      filled
                      :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES)"
                      tabindex="3"
                      :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES)"
                      clearable
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col
                v-if="!hiddenFields.includes(STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME)"
                cols="4"
              >
                <v-row
                  density="compact"
                  no-gutters
                >
                  <strong>Usual Surname</strong>
                </v-row>
                <v-row
                  density="compact"
                  no-gutters
                >
                  <v-col cols="11">
                    <v-text-field
                      id="searchDemogModalUsualLastNameTxtField"
                      v-model="student.usualLastName"
                      variant="outlined"
                      density="compact"
                      maxlength="25"
                      @update:model-value="validateForm"
                      filled
                      :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME)"
                      tabindex="4"
                      :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME)"
                      clearable
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col
                v-if="!hiddenFields.includes(STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME)"
                cols="4"
              >
                <v-row
                  density="compact"
                  no-gutters
                >
                  <strong>Usual Given</strong>
                </v-row>
                <v-row
                  density="compact"
                  no-gutters
                >
                  <v-col cols="11">
                    <v-text-field
                      id="searchDemogModalUsualFirstNameTxtField"
                      v-model="student.usualFirstName"
                      variant="outlined"
                      @update:model-value="validateForm"
                      density="compact"
                      maxlength="25"
                      filled
                      :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME)"
                      tabindex="5"
                      :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME)"
                      clearable
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col
                v-if="!hiddenFields.includes(STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES)"
                cols="4"
              >
                <v-row
                  density="compact"
                  no-gutters
                >
                  <strong>Usual Middle</strong>
                </v-row>
                <v-row
                  density="compact"
                  no-gutters
                >
                  <v-col cols="11">
                    <v-text-field
                      id="searchDemogModalUsualMiddleNameTxtField"
                      v-model="student.usualMiddleNames"
                      variant="outlined"
                      @update:model-value="validateForm"
                      density="compact"
                      maxlength="25"
                      filled
                      :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES)"
                      tabindex="6"
                      :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES)"
                      clearable
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="4">
                <v-row
                  density="compact"
                  no-gutters
                >
                  <strong>Gender</strong>
                </v-row>
                <v-row
                  density="compact"
                  no-gutters
                >
                  <v-col cols="11">
                    <v-text-field
                      id="searchDemogModalGenderTxtField"
                      v-model="student.genderCode"
                      variant="outlined"
                      density="compact"
                      @update:model-value="validateForm"
                      class="hoverField"
                      filled
                      :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.GENDER_CODE)"
                      :rules="validateGender()"
                      maxlength="1"
                      tabindex="7"
                      :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.GENDER_CODE)"
                      clearable
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="4">
                <v-row
                  density="compact"
                  no-gutters
                >
                  <strong>Birth Date (YYYYMMDD)</strong>
                </v-row>
                <v-row
                  density="compact"
                  no-gutters
                >
                  <v-col cols="11">
                    <FormattedTextField
                      id="searchDemogModalDobTxtField"
                      v-model="student.dob"
                      @update:model-value="validateForm"
                      :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.DOB)"
                      :rules="validateDOB()"
                      maxlength="8"
                      tabindex="8"
                      :format="formatDob"
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="4">
                <v-row
                  density="compact"
                  no-gutters
                >
                  <strong>Grade</strong>
                </v-row>
                <v-row
                  density="compact"
                  no-gutters
                >
                  <v-col cols="11">
                    <v-text-field
                      id="searchDemogModalGradeTxtField"
                      v-model="student.gradeCode"
                      variant="outlined"
                      density="compact"
                      @update:model-value="validateForm"
                      filled
                      :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.GRADE_CODE)"
                      :rules="validateGradeCode()"
                      maxlength="2"
                      tabindex="9"
                      :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.GRADE_CODE)"
                      clearable
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col
                v-if="!hiddenFields.includes(STUDENT_DETAILS_FIELDS.POSTAL_CODE)"
                cols="4"
              >
                <v-row
                  density="compact"
                  no-gutters
                >
                  <strong>Postal Code</strong>
                </v-row>
                <v-row
                  density="compact"
                  no-gutters
                >
                  <v-col cols="11">
                    <FormattedTextField
                      id="searchDemogModalPostalCodeTxtField"
                      v-model="student.postalCode"
                      :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.POSTAL_CODE)"
                      maxlength="7"
                      @update:model-value="validateForm"
                      tabindex="10"
                      :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.POSTAL_CODE)"
                      :format="formatPostalCode"
                    />
                  </v-col>
                </v-row>
              </v-col>
              <v-col
                v-if="!hiddenFields.includes(STUDENT_DETAILS_FIELDS.MINCODE)"
                cols="4"
              >
                <v-row
                  density="compact"
                  no-gutters
                >
                  <strong>Mincode</strong>
                </v-row>
                <v-row
                  density="compact"
                  no-gutters
                >
                  <v-col cols="11">
                    <FormattedTextField
                      id="searchDemogModalMincodeTxtField"
                      v-model="student.mincode"
                      :readonly="isFieldReadOnly(STUDENT_DETAILS_FIELDS.MINCODE)"
                      :rules="validateMincode()"
                      @update:model-value="validateForm"
                      maxlength="8"
                      :async-messages="mincodeErrors"
                      tabindex="11"
                      :format="formatMincode"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-form>
          <v-divider class="subheader-divider"/>
        </v-card-text>

        <v-card-actions class="mr-4 pb-6">
          <v-spacer/>
          <slot
            name="actions"
            :searchEnabled="isValidForm"
            :modifySearch="modifySearch"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import {STUDENT_DETAILS_FIELDS} from '@/utils/constants';
import {isValidMincode, isValidPostalCode, isValidDOBAndAfter1900} from '@/utils/validation';
import {mapState} from 'pinia';
import FormattedTextField from '../util/FormattedTextField.vue';
import {formatPostalCode, formatDob, formatMincode} from '@/utils/format';
import schoolMixin from '../../mixins/schoolMixin';
import {studentStore} from '@/store/modules/student';

export default {
  name: 'SearchDemographicModal',
  components: {FormattedTextField},
  mixins: [schoolMixin],
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
    hiddenFields: {
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
      this.validateForm();
    },
    searchDemographicDialog(newValue) {
      if (!newValue && this.dialog) {
        this.$emit('closeDialog');
      }
    },
    studentData(newValue) {
      this.student = newValue;
    }
  },
  created(){
    this.validateForm();
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
    modifySearch() {
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
    async validateForm() {
      await this.$nextTick();
      if(this.$refs.searchDemographicModalForm){
        const isValid = await this.$refs.searchDemographicModalForm?.validate();
        this.isValidForm = isValid.valid;
      }
    },
    validateDOB() {
      if (!this.student.dob) {
        return ['Birth Date is Required.'];
      }
      if (!isValidDOBAndAfter1900(this.student.dob, 'uuuuMMdd')) {
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
    border-width: 0.2ex 0 0 0;
}

.headline{
    font-weight: bold;
    font-size: large;
}

:deep(.v-field:hover){
    background-color: #f2f2f2;
}

</style>
