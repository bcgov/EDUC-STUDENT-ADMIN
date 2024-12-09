<template>
  <v-card>
    <v-card-title id="viewAddStudentRegistrationCardTitle" class="sheetHeader pt-1 pb-1">
      <v-row no-gutters>
        <v-col class="d-flex justify-start"> Add Assessment Registration</v-col>
        <v-col class="d-flex justify-end">
          <v-btn
              id="cancel"
              color="white"
              text="Close"
              size="30"
              icon="mdi-close"
              variant="tonal"
              @click="cancel"
          />
        </v-col>
      </v-row>
    </v-card-title>

    <v-card-text class="mt-0 mb-6">
      <v-row v-if="isLoading()">
        <v-col class="d-flex justify-center">
          <Spinner :flat="true" style="margin-bottom: 15.5rem" />
        </v-col>
      </v-row>
      <div v-else ref="topDiv">
        <v-col class="pt-0" cols="12">
          <v-form ref="addRegistrationForm" v-model="addStudentRegistrationFormValid">
            <v-row>
              <v-col cols="6">
                <v-select
                    id="Session"
                    v-model="selectedSessionID"
                    variant="underlined"
                    :items="sessionSearchNames"
                    label="Session"
                    item-title="sessionCodeName"
                    item-value="sessionCodeValue"
                    :disabled="!!this.sessionID"
                    :rules="[rules.required()]"
                    @update:model-value="refreshAssessmentTypes($event)"
                />
                <v-autocomplete
                    id="AssessmentCourse"
                    v-model="newStudentDetail.assessmentID"
                    variant="underlined"
                    :items="assessmentTypeSearchNames"
                    label="Assessment/Course"
                    item-title="assessmentCodeName"
                    item-value="assessmentCodeValue"
                    autocomplete="off"
                    :color="getFieldColor()"
                    :rules="[rules.required()]"
                    :disabled="!sessionID && !selectedSessionID"
                    @update:model-value="syncAssessmentValue($event)"
                />
                <v-autocomplete
                    id="AssessmentCenter"
                    v-model="newStudentDetail.assessmentCenterID"
                    variant="underlined"
                    :items="assessmentCenterSearchNames"
                    label="Assessment Center"
                    :clearable="true"
                    item-title="schoolCodeName"
                    item-value="schoolCodeValue"
                    autocomplete="off"
                    density="compact"
                    :color="getFieldColor()"
                    :rules="[rules.required()]"
                />
                <v-text-field
                    id="PEN"
                    v-model="newStudentDetail.pen"
                    label="Personal Education Number (PEN)"
                    variant="underlined"
                    :maxlength="25"
                    density="compact"
                    :rules="[rules.required()]"
                />
                <v-text-field
                    id="LocalID"
                    v-model="newStudentDetail.localID"
                    label="Local ID"
                    variant="underlined"
                    :maxlength="25"
                    density="compact"
                    :rules="[rules.required()]"
                />
                <v-text-field
                    id="SurName"
                    v-model="newStudentDetail.surName"
                    label="Student's Legal Last Name"
                    variant="underlined"
                    density="compact"
                    :rules="[rules.required()]"
                />
                <v-text-field
                    id="GivenName"
                    v-model="newStudentDetail.givenName"
                    label="Student's Legal First Name"
                    variant="underlined"
                    density="compact"
                    :rules="[rules.required()]"
                />
                <v-autocomplete
                    id="School"
                    v-model="newStudentDetail.schoolID"
                    variant="underlined"
                    :items="schoolSearchNames"
                    label="School"
                    item-title="schoolCodeName"
                    item-value="schoolCodeValue"
                    autocomplete="off"
                    :color="getFieldColor()"
                    :rules="[rules.required()]"
                />
                <v-autocomplete
                    id="SpecialCase"
                    v-model="newStudentDetail.provincialSpecialCaseName"
                    label="Special Case"
                    variant="underlined"
                    :items="specialCaseSearchNames"
                    item-title="specialCaseCodeName"
                    item-value="specialCaseCodeValue"
                    :color="getFieldColor()"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-col>
      </div>
      <v-row cols="24" class="justify-end">
        <v-btn
            id="saveRecord"
            color="#003366"
            text="Save"
            :disabled="!addStudentRegistrationFormValid"
            @click="saveStudentRegistration"
        />
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>

import {setFailureAlert, setSuccessAlert,} from '@/components/composable/alertComposable';
import { sortBy } from 'lodash';
import { mapState } from 'pinia';
import moment from 'moment';
import ConfirmationDialog from "@/components/util/ConfirmationDialog.vue";
import Spinner from "@/components/common/Spinner.vue";
import * as Rules from "@/utils/institute/formRules.js";
import {appStore} from "@/store/modules/app";
import {easStore} from "@/store/modules/eas"
import {Routes} from "@/utils/constants";

export default {
  name: 'AddStudentRegistration',
  components: {
    ConfirmationDialog,
    Spinner
  },
  props: {
    schoolYearSessions: {
      type: Object,
      required: true,
      default: null,
    },
    sessionID: {
      type: String,
      required: false,
      default: null
    },
    saveEvent: {
      type: Boolean,
      required: false,
      default: false,
    }
  },
  emits: ['form-validity','reload-student-registrations', 'close-new-student-registration'],
  data() {
    return {
      rules: Rules,
      sessionSearchNames: [],
      schoolSearchNames: [],
      assessmentTypeSearchNames: [],
      assessmentCenterSearchNames: [],
      specialCaseSearchNames: [],
      addStudentRegistrationFormValid: false,
      newStudentDetail: {
        assessmentID: null,
        schoolID: null,
        assessmentCenterID: null,
        givenName: null,
        surName: null,
        pen: null,
        localID: null,
        isElectronicExam: null,
        proficiencyScore: null,
        provincialSpecialCaseCode: null,
      },
      selectedSessionID: null,
      studentRegistrationValidationIssues: [],
      loadingCount: 0,
      isActive: false
    };
  },
  computed: {
    ...mapState(appStore, ['schoolMap', 'config']),
    ...mapState(easStore, ['specialCaseCodes']),
  },
  watch: {
    saveEvent: {
      handler(value) {
        if (value) {
          this.saveStudentRegistration();
        }
      },
    },
    addStudentRegistrationFormValid: {
      handler() {
        this.$emit('form-validity', this.addStudentRegistrationFormValid);
      }
    },
  },
  async beforeMount() {
    this.selected = {...this.initialFilterSelection};
    if (this.schoolMap.size === 0) {
      await appStore().getInstituteCodes();
    }
  },
  created() {
    this.setupSchoolList();
    this.setupSessions();
    this.setupSpecialCaseCodes();
    if(this.sessionID){
      this.selectedSessionID = this.sessionID;
      this.refreshAssessmentTypes(this.sessionID);
    }
  },
  methods: {
    isLoading(){
      return this.loadingCount > 0;
    },
    setupSchoolList() {
      this.schoolMap?.forEach((school) => {
        this.schoolSearchNames.push({
          schoolCodeName: school.schoolName + ' - ' + school.mincode,
          schoolCodeValue: school.schoolID
        });
      });
      this.assessmentCenterSearchNames = sortBy(this.schoolSearchNames, ['schoolCodeName']);
    },
    setupSessions() {
      let sessions = [];
      this.schoolYearSessions?.forEach((session) => {
        sessions.push({
          sessionCourseMonth: parseInt(session.courseMonth),
          sessionCourseYear: parseInt(session.courseYear),
          sessionCodeName: this.formatMonth(session.courseMonth) + ' ' + session.courseYear,
          sessionCodeValue: session.sessionID
        });
      });
      this.sessionSearchNames = sortBy(sessions, ['sessionCourseYear','sessionCourseMonth']);
    },
    setupSpecialCaseCodes() {
      let specialCases = [];
      Object.keys(this.specialCaseCodes).forEach(key => {
        specialCases.push({
          specialCaseCodeName: this.specialCaseCodes[key],
          specialCaseCodeValue: key
        });
      });
      this.specialCaseSearchNames = sortBy(specialCases, ['specialCaseCodeName']);
    },
    refreshAssessmentTypes($event) {
      let session = this.schoolYearSessions.find(session => session.sessionID === $event);
      let assessmentTypes = [];
      let assessmentID = null;
      session?.assessments.forEach((assessment) => {
        if(assessment.assessmentTypeName === this.newStudentDetail.assessmentTypeName_desc) {
          assessmentID = assessment.assessmentID;
        }
        assessmentTypes.push({
          assessmentCodeName: assessment.assessmentTypeName,
          assessmentCodeValue: assessment.assessmentTypeName,
          displayOrder: assessment.displayOrder
        });
      });
      this.assessmentTypeSearchNames = sortBy(assessmentTypes, ['displayOrder']);
      if(assessmentID) {
        this.newStudentDetail.assessmentID = assessmentID;
      } else {
        this.newStudentDetail.assessmentID = null;
        this.newStudentDetail.assessmentTypeName_desc = null;
      }
    },
    syncAssessmentValue($event) {
      let session = this.schoolYearSessions.find(session => session.sessionID === this.newStudentDetail.sessionID);
      let assessment = session?.assessments.find(assessment => assessment.assessmentTypeName === $event);
      if(assessment) {
        this.newStudentDetail.assessmentID = assessment.assessmentID;
      }
    },
    saveStudentRegistration() {
      this.loadingCount += 1;
      Routes.apiAxios
          .post(
              `${Routes.eas.ASSESSMENT_STUDENTS}`,
              this.newStudentDetail
          )
          .then(() => {
            setSuccessAlert('Success! The new student registration has been created.');
            this.$emit('reload-student-registrations');
          })
          .catch((error) => {
            console.error(error);
            setFailureAlert(
                error?.response?.data?.message
                    ? error?.response?.data?.message
                    : 'An error occurred while trying to update student registration details. Please try again later.'
            );
          })
          .finally(() => {
            this.loadingCount -= 1;
            this.$emit('close-new-student-registration');
          });
    },
    validateForm() {
      this.$refs?.addRegistrationForm?.validate();
    },
    formatMonth(month) {
      return moment(month, 'MM').format('MMMM');
    },
    getFieldColor() {
      return !this.isActive ? '#7f7f7f' : '#003366';
    },
    cancel() {
      this.$emit('close-new-student-registration');
    },
  },
};
</script>
<style>
.sheetHeader {
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}
.v-row {
  margin-bottom: 16px;
}
.v-col {
  padding: 0 8px;
}
</style>
