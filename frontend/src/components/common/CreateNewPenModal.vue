<template>
  <v-row justify="center">
    <v-dialog v-model="createNewPenDialog"
              max-width="75%"
              persistent
    >
      <v-card>
        <v-list-item>
          <v-list-item-content class="pt-4 pl-2">
            <slot name="headLine">
              <v-list-item-title class="headline">
                Create New PEN
              </v-list-item-title>
            </slot>
          </v-list-item-content>
          <v-list-item-icon>
            <v-btn id="closeCreateNewPenModalBtn" text icon @click="$emit('closeDialog')">
              <v-icon large color="#38598A">mdi-close</v-icon>
            </v-btn>
          </v-list-item-icon>
        </v-list-item>
        <v-spacer/>
        <v-card-text>
          <v-form ref="createNewPenForm" v-model="isValidForm">
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
                    <v-text-field id="createNewPenFormLegalLastName" outlined dense filled readonly required
                                  tabindex="1" maxlength="25"
                                  :rules="validateNameFields(STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME)"
                                  v-model="student.legalLastName"></v-text-field>
                  </v-col>
                  <v-spacer/>
                  <v-col cols="3">
                    <v-text-field outlined dense filled
                                  id="createNewPenFormLegalFirstName"
                                  readonly required tabindex="2" maxlength="25"
                                  :rules="validateNameFields(STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME)"
                                  v-model="student.legalFirstName"></v-text-field>
                  </v-col>
                  <v-spacer/>
                  <v-col cols="3">
                    <v-text-field outlined dense filled
                                  id="createNewPenFormLegalMiddleNames"
                                  tabindex="3" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES)"
                                  :rules="validateNameFields(STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES)"
                                  clearable maxlength="25"
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
                                  id="createNewPenFormUsualLastName"
                                  tabindex="4" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME)"
                                  :rules="validateNameFields(STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME)"
                                  clearable maxlength="25"
                                  v-model="student.usualLastName"></v-text-field>
                  </v-col>
                  <v-spacer/>
                  <v-col cols="3">
                    <v-text-field outlined dense filled
                                  id="createNewPenFormUsualFirstName"
                                  tabindex="5" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME)"
                                  :rules="validateNameFields(STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME)"
                                  clearable maxlength="25"
                                  v-model="student.usualFirstName"></v-text-field>
                  </v-col>
                  <v-spacer/>
                  <v-col cols="3">
                    <v-text-field outlined dense filled
                                  id="createNewPenFormUsualMiddleNames"
                                  tabindex="6" :onkeyup="upperCaseInput(STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES)"
                                  :rules="validateNameFields(STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES)"
                                  clearable maxlength="25"
                                  v-model="student.usualMiddleNames"></v-text-field>
                  </v-col>
                  <v-spacer/>
                </v-row>
                <v-row dense no-gutters>
                  <v-col cols="3"><Strong>Gender</Strong></v-col>
                  <v-spacer/>
                  <v-col cols="3"><strong>Birth Date
                    <v-btn icon x-small title="YYYYMMDD">
                      <v-icon color="#2196f3">
                        info
                      </v-icon>
                    </v-btn>
                  </strong></v-col>
                  <v-spacer/>
                  <v-col cols="3"><strong></strong></v-col>
                  <v-spacer/>
                </v-row>
                <v-row dense>
                  <v-col cols="3">
                    <v-text-field outlined dense filled readonly
                                  id="createNewPenFormGender"
                                  maxlength="1"
                                  tabindex="7"
                                  v-model="student.genderCode"></v-text-field>
                  </v-col>
                  <v-spacer/>
                  <v-col cols="3">
                    <v-text-field
                      id="createNewPenFormDOB" readonly outlined dense filled
                      v-model="student.dob"></v-text-field>
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
import {formatDob, formatPostalCode} from '@/utils/format';

export default {
  name: 'CreateNewPenModal',
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
    studentData(newValue) {
      this.student = newValue;
    }
  },
  data() {
    return {
      createNewPenDialog: false,
      student: {},
      isValidForm: false,
      STUDENT_DETAILS_FIELDS: STUDENT_DETAILS_FIELDS,
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
    isFormValid() {
      if (this.$refs.createNewPenForm.validate()) {
        this.$emit('submitForm', this.student);
      }
    },
    validateNameFields(fieldName) {
      if (this.student[fieldName]?.length > 25) {
        return ['Field value should be 25 characters max.'];
      } else if (this.student[fieldName]?.includes('*')) {
        return ['Field value should not contain wildcard(*).'];
      }
      return [];
    }
  }
};
</script>

<style scoped>

</style>
