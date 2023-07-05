<template>
  <v-row justify="center">
    <v-dialog
      v-model="createNewPenDialog"
      max-width="75%"
    >
      <v-card>
        <v-card-title class="px-0 pb-0 pt-5">
          <v-list-item>
            <v-list-item class="pt-0 pl-2">
              <slot name="headLine">
                <v-list-item-title class="headline">
                  Create New PEN
                </v-list-item-title>
              </slot>
            </v-list-item>
            <v-list-item-media class="my-0">
              <v-btn
                id="closeCreateNewPenModalBtn"
                text
                icon
                @click="createNewPenDialog=false"
              >
                <v-icon
                  large
                  color="#38598A"
                >
                  mdi-close
                </v-icon>
              </v-btn>
            </v-list-item-media>
          </v-list-item>
        </v-card-title>
        <v-spacer />
        <v-card-text>
          <v-form
            ref="createNewPenForm"
            v-model="isValidForm"
          >
            <v-row>
              <v-col cols="12">
                <v-row
                  density="compact"
                  no-gutters
                >
                  <v-col cols="3">
                    <strong>Legal Surname</strong>
                  </v-col>
                  <v-spacer />
                  <v-col cols="3">
                    <strong>Legal Given</strong>
                  </v-col>
                  <v-spacer />
                  <v-col cols="3">
                    <strong>Legal Middle</strong>
                  </v-col>
                  <v-spacer />
                </v-row>
                <v-row density="compact">
                  <v-col cols="3">
                    <v-text-field
                      id="createNewPenFormLegalLastName"
                      v-model="student.legalLastName"
                      outlined
                      density="compact"
                      filled
                      readonly
                      required
                      tabindex="1"
                      maxlength="25"
                      :rules="validateNameFields(STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME)"
                      :error-messages="err.legalLastNameError"
                    />
                  </v-col>
                  <v-spacer />
                  <v-col cols="3">
                    <v-text-field
                      id="createNewPenFormLegalFirstName"
                      v-model="student.legalFirstName"
                      outlined
                      density="compact"
                      filled
                      readonly
                      required
                      tabindex="2"
                      maxlength="25"
                      :rules="validateNameFields(STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME)"
                      :error-messages="err.legalFirstNameError"
                    />
                  </v-col>
                  <v-spacer />
                  <v-col cols="3">
                    <v-text-field
                      id="createNewPenFormLegalMiddleNames"
                      v-model="student.legalMiddleNames"
                      outlined
                      density="compact"
                      filled
                      tabindex="3"
                      :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES)"
                      :rules="validateNameFields(STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES)"
                      clearable
                      maxlength="25"
                      :error-messages="err.legalMiddleNamesError"
                      @input="clearError('legalMiddleNamesError')"
                    />
                  </v-col>
                  <v-spacer />
                </v-row>
                <v-row
                  density="compact"
                  no-gutters
                >
                  <v-col cols="3">
                    <strong>Usual Surname </strong>
                  </v-col>
                  <v-spacer />
                  <v-col cols="3">
                    <strong>Usual Given</strong>
                  </v-col>
                  <v-spacer />
                  <v-col cols="3">
                    <strong>Usual Middle</strong>
                  </v-col>
                  <v-spacer />
                </v-row>
                <v-row density="compact">
                  <v-col cols="3">
                    <v-text-field
                      id="createNewPenFormUsualLastName"
                      v-model="student.usualLastName"
                      outlined
                      density="compact"
                      filled
                      tabindex="4"
                      :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME)"
                      :rules="validateNameFields(STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME)"
                      clearable
                      maxlength="25"
                      :error-messages="err.usualLastNameError"
                      @input="clearError('usualLastNameError')"
                    />
                  </v-col>
                  <v-spacer />
                  <v-col cols="3">
                    <v-text-field
                      id="createNewPenFormUsualFirstName"
                      v-model="student.usualFirstName"
                      outlined
                      density="compact"
                      filled
                      tabindex="5"
                      :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME)"
                      :rules="validateNameFields(STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME)"
                      clearable
                      maxlength="25"
                      :error-messages="err.usualFirstNameError"
                      @input="clearError('usualFirstNameError')"
                    />
                  </v-col>
                  <v-spacer />
                  <v-col cols="3">
                    <v-text-field
                      id="createNewPenFormUsualMiddleNames"
                      v-model="student.usualMiddleNames"
                      outlined
                      density="compact"
                      filled
                      tabindex="6"
                      :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES)"
                      :rules="validateNameFields(STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES)"
                      clearable
                      maxlength="25"
                      :error-messages="err.usualMiddleNamesError"
                      @input="clearError('usualMiddleNamesError')"
                    />
                  </v-col>
                  <v-spacer />
                </v-row>
                <v-row
                  density="compact"
                  no-gutters
                >
                  <v-col cols="3">
                    <strong>Gender</strong>
                  </v-col>
                  <v-spacer />
                  <v-col cols="3">
                    <strong>Birth Date
                      <v-btn
                        icon
                        x-small
                        title="YYYYMMDD"
                      >
                        <v-icon color="#2196f3">
                          info
                        </v-icon>
                      </v-btn>
                    </strong>
                  </v-col>
                  <v-spacer />
                  <v-col cols="3">
                    <strong>Local ID</strong>
                  </v-col>
                  <v-spacer />
                </v-row>
                <v-row density="compact">
                  <v-col cols="3">
                    <v-text-field
                      id="createNewPenFormGender"
                      v-model="student.genderCode"
                      outlined
                      density="compact"
                      filled
                      readonly
                      maxlength="1"
                      tabindex="7"
                    />
                  </v-col>
                  <v-spacer />
                  <v-col cols="3">
                    <v-text-field
                      id="createNewPenFormDOB"
                      v-model="student.dob"
                      readonly
                      outlined
                      density="compact"
                      filled
                      :error-messages="err.birthDateError"
                      tabindex="8"
                    />
                  </v-col>
                  <v-spacer />
                  <v-col cols="3">
                    <v-text-field
                      id="createNewPenFormLocalID"
                      v-model="student.localID"
                      outlined
                      density="compact"
                      filled
                      tabindex="9"
                      clearable
                      maxlength="12"
                    />
                  </v-col>
                  <v-spacer />
                </v-row>
              </v-col>
            </v-row>
          </v-form>
          <v-divider class="subheader-divider" />
        </v-card-text>

        <v-card-actions class="mr-4 pb-6">
          <v-spacer />
          <slot
            name="actions"
            :create-new-pen-loading="isLoading"
            :is-form-valid="isFormValid"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import ApiService from '../../common/apiService';
import {STUDENT_DETAILS_FIELDS, Routes} from '@/utils/constants';
import {formatDob, formatPostalCode} from '@/utils/format';
import {getDemogValidationResults} from '@/utils/common';
import alertMixin from '@/mixins/alertMixin';
import {mapState} from 'pinia';
import {penRequestBatchStore} from '@/store/modules/penRequestBatch';
export default {
  name: 'CreateNewPenModal',
  mixins: [alertMixin],
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    studentData: {
      type: Object,
      required: true,
    },
  },
  watch: {
    dialog(newValue) {
      this.createNewPenDialog = newValue;
    },
    createNewPenDialog(newValue) {
      if(!newValue && this.dialog) {
        this.$emit('closeDialog');
      }
    },
    studentData(newValue) {
      this.student = newValue;
      //reset errors
      Object.keys(this.err).forEach(key => {
        this.err[key] = '';
      });
    }
  },
  computed: {
    ...mapState(penRequestBatchStore, ['prbValidationFieldCodes', 'prbValidationIssueTypeCodes']),
  },
  data() {
    return {
      createNewPenDialog: false,
      student: {},
      isValidForm: false,
      STUDENT_DETAILS_FIELDS: STUDENT_DETAILS_FIELDS,
      err: {
        usualMiddleNamesError: '',
        usualFirstNameError: '',
        usualLastNameError: '',
        legalMiddleNamesError: '',
        legalFirstNameError: '',
        legalLastNameError: '',
        birthDateError: '',
      },
      isLoading: false,
    };
  },
  methods: {
    formatPostalCode,
    formatDob,
    upperCaseInput(fieldName) {
      if (this.student[fieldName]) {
        this.student[fieldName] = this.student[fieldName].toUpperCase();
      }
    },
    async isFormValid() {
      if (this.$refs.createNewPenForm.validate()) {
        this.isLoading = true;
        try {
          const payload = {
            student: {
              ...this.student
            }
          };
          const result = await getDemogValidationResults(payload);
          const onlyErrors = result.filter(el => el.penRequestBatchValidationIssueSeverityCode === 'ERROR');
          let validationIssues = onlyErrors.map(y => {
            y.penRequestBatchValidationIssueTypeCode = this.prbValidationIssueTypeCodes.find(obj => obj.code === y.penRequestBatchValidationIssueTypeCode)?.description || y.penRequestBatchValidationIssueTypeCode;
            return y;
          });
          if (validationIssues?.length > 0) {
            this.err.legalLastNameError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'LEGALLAST')?.penRequestBatchValidationIssueTypeCode || '';
            this.err.legalFirstNameError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'LEGALFIRST')?.penRequestBatchValidationIssueTypeCode || '';
            this.err.legalMiddleNamesError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'LEGALMID')?.penRequestBatchValidationIssueTypeCode || '';
            this.err.usualFirstNameError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'USUALFIRST')?.penRequestBatchValidationIssueTypeCode || '';
            this.err.usualLastNameError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'USUALLAST')?.penRequestBatchValidationIssueTypeCode || '';
            this.err.usualMiddleNamesError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'USUALMID')?.penRequestBatchValidationIssueTypeCode || '';
            this.err.birthDateError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'BIRTHDATE')?.penRequestBatchValidationIssueTypeCode || '';
          } else {
            const studentResponse = await ApiService.apiAxios.post(Routes.student.ROOT_ENDPOINT, payload);
            await this.$router.push(`/student/${studentResponse.data.studentID}`);
          }
        } catch (e) {
          console.error(e);
          this.setFailureAlert('Pen Could not be created, Please retry later.');
        } finally {
          this.isLoading = false;
        }
      }
    },
    validateNameFields(fieldName) {
      if (this.student[fieldName]?.length > 25) {
        return ['Field value should be 25 characters max.'];
      } else if (this.student[fieldName]?.includes('*')) {
        return ['Field value should not contain wildcard(*).'];
      }
      return [];
    },
    clearError(errFieldName) {
      this.err[errFieldName] = '';
    }
  }
};
</script>

<style scoped>

</style>
