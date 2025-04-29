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
        <v-row class="d-flex">
          <v-col :cols = "hasError ? 6 : 12">
            <v-form ref="addRegistrationForm" v-model="addStudentRegistrationFormValid">
              <v-row>
                <v-col>
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
                      item-value="schoolID"
                      autocomplete="off"
                      density="compact"
                  />
                  <v-text-field
                      id="PEN"
                      v-model="newStudentDetail.pen"
                      label="Personal Education Number (PEN)"
                      variant="underlined"
                      :maxlength="25"
                      density="compact"
                      :rules="[rules.required(), rules.penIsValid()]"
                  />
                  <v-text-field
                      id="LocalID"
                      v-model="newStudentDetail.localID"
                      label="Local ID"
                      variant="underlined"
                      :maxlength="25"
                      density="compact"
                      :rules="[rules.required(), rules.number()]"
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
                      variant="underlined"
                      v-model="newStudentDetail.schoolID"
                      :items="schoolSearchNames"
                      label="School"
                      item-title="schoolCodeName"
                      item-value="schoolID"
                      autocomplete="off"
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
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-col>
          <v-col cols="12" md="6" v-if="newStudentDetail?.assessmentStudentValidationIssues?.length > 0">
            <v-row v-if="hasError">
              <v-col>
                <v-alert
                    type="warning"
                    variant="tonal"
                    text="Warning! Updates to student details will not be saved until all errors are fixed."
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col class="pl-0">
                <div class="timeline-container">
                <v-timeline
                    side="end"
                    density="compact"
                    style="margin-left: 1em"
                    align="start"
                    truncate-line="start"
                >
                  <v-timeline-item
                      v-for="(issue, index) in newStudentDetail.assessmentStudentValidationIssues"
                      :key="index"
                      dot-color="white"
                      fill-dot
                      icon-color="#d90606"
                      icon="mdi-alert-circle-outline"
                      size="large"
                      width="100%"
                  >
                    <v-row class="mt-n1">
                      <v-col>
                        <h3 class="validation-issue">
                          {{ issue.validationLabel }}
                        </h3>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <span> {{issue.validationMessage}}</span>
                      </v-col>
                    </v-row>
                  </v-timeline-item>
                </v-timeline>
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </div>
      <v-row cols="24" class="justify-end">
        <v-btn
            id="saveRecord"
            color="#003366"
            text="Validate & Save"
            :disabled="!addStudentRegistrationFormValid"
            @click="saveStudentRegistration"
        />
      </v-row>

    </v-card-text>
  </v-card>
</template>

<script>

import {setFailureAlert, setSuccessAlert} from '@/components/composable/alertComposable';
import { sortBy } from 'lodash';
import { mapState } from 'pinia';
import moment from 'moment';
import Spinner from '@/components/common/Spinner.vue';
import * as Rules from '@/utils/institute/formRules.js';
import {appStore} from '@/store/modules/app';
import {assessmentsStore} from '@/store/modules/assessments'
import {Routes} from '@/utils/constants';
import ApiService from '@/common/apiService';

export default {
  name: 'AddStudentRegistration',
  components: {
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
      hasError: false,
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
        assessmentStudentValidationIssues: []
      },
      selectedSessionID: null,
      studentRegistrationValidationIssues: [],
      loadingCount: 0,
      isActive: false
    };
  },
  computed: {
    ...mapState(appStore, ['activeSchools', 'config']),
    ...mapState(assessmentsStore, ['specialCaseCodes']),
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
    if (this.activeSchools.size === 0) {
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
      this.activeSchools?.forEach((school) => {
        this.schoolSearchNames.push({
          schoolCodeName: school.schoolName + ' - ' + school.mincode,
          schoolID: school.schoolID,
        });
      });
      this.assessmentCenterSearchNames = sortBy(this.schoolSearchNames, ['schoolCodeName']);
      this.schoolSearchNames = sortBy(this.schoolSearchNames, ['schoolCodeName']);
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
          assessmentCodeValue: assessment.assessmentID,
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
      const postAssessmentStudentDetail = Object.fromEntries(
          Object.entries(this.newStudentDetail).filter(([key]) => !key.endsWith('_desc'))
      );
      ApiService.apiAxios
          .post(
              `${Routes.assessments.ASSESSMENT_STUDENTS}`,
              postAssessmentStudentDetail
          )
          .then((res) => {
            this.newStudentDetail = res.data;
            if(this.newStudentDetail.assessmentStudentValidationIssues){
              this.hasError = true;
            } else if(!this.newStudentDetail.assessmentStudentValidationIssues) {
              this.hasError = false;
              setSuccessAlert('Success! The new student registration has been created.');
              this.$emit('close-new-student-registration');
            }
            this.loadingCount -= 1;
          })
          .catch((error) => {
            console.error(error);
            setFailureAlert(
                error?.response?.data?.message
                    ? error?.response?.data?.message
                    : 'An error occurred while trying to update student registration details. Please try again later.'
            );
          })

      this.loadingCount -= 1;
    },
    validateForm() {
      this.$refs?.addRegistrationForm?.validate();
    },
    formatMonth(month) {
      return moment(month, 'MM').format('MMMM');
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
.validation-issue{
  color: #d90606;
}

</style>
