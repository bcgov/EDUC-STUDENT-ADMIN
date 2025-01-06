<template>
  <v-row class="mt-0" :class="functionType !== 'add' ? 'mb-12' : 'mb-2'">
    <v-col class="pt-0">
      <v-row v-if="isLoading()">
        <v-col class="d-flex justify-center">
          <Spinner
              :flat="true"
              style="margin-bottom: 15.5rem"
          />
        </v-col>
      </v-row>
      <div
          v-else
          ref="topDiv"
      >
        <v-row class="mt-n4">
          <v-col :cols="hasError ? 6 : 12">
            <v-form
                ref="registrationDetailsForm"
                v-model="studentRegistrationDetailsFormValid"
            >
              <v-autocomplete
                  id="Session"
                  v-model="assessmentStudentDetail.sessionID"
                  variant="underlined"
                  :items="sessionSearchNames"
                  label="Session"
                  :clearable="editPermitted"
                  item-title="sessionCodeName"
                  item-value="sessionCodeValue"
                  autocomplete="off"
                  :color="getFieldColor(editPermitted)"
                  :readonly="!editPermitted"
                  :class="!editPermitted ? 'readonly-text' : 'fieldtext'"
                  :rules="[rules.required()]"
                  @update:model-value="refreshAssessmentTypes($event)"
              />
              <v-autocomplete
                  id="AssessmentCourse"
                  v-model="assessmentStudentDetail.assessmentTypeName_desc"
                  variant="underlined"
                  :items="assessmentTypeSearchNames"
                  label="Assessment Course"
                  :clearable="editPermitted"
                  item-title="assessmentCodeName"
                  item-value="assessmentCodeValue"
                  autocomplete="off"
                  :color="getFieldColor(editPermitted)"
                  :readonly="!editPermitted"
                  :class="!editPermitted ? 'readonly-text' : 'fieldtext'"
                  :rules="[rules.required()]"
                  @update:model-value="syncAssessmentValue($event)"
              />
              <v-autocomplete
                  id="AssessmentCenter"
                  v-model="assessmentStudentDetail.assessmentCenterID"
                  variant="underlined"
                  :items="assessmentCenterSearchNames"
                  label="Assessment Center"
                  :clearable="editPermitted"
                  item-title="schoolCodeName"
                  item-value="schoolCodeValue"
                  autocomplete="off"
                  density="compact"
                  :color="getFieldColor(editPermitted)"
                  :readonly="!editPermitted"
                  :class="editPermitted ? 'fieldtext' : 'readonly-text'"
              />
              <v-text-field
                  id="PEN"
                  v-model="assessmentStudentDetail.pen"
                  label="Personal Education Number (PEN)"
                  variant="underlined"
                  :maxlength="25"
                  density="compact"
                  :readonly="true"
                  :class="['readonly-text']"
              />
              <v-text-field
                  id="LocalID"
                  v-model="assessmentStudentDetail.localID"
                  label="Local ID"
                  variant="underlined"
                  :maxlength="25"
                  density="compact"
                  :readonly="true"
                  :class="['readonly-text']"
              />
              <v-text-field
                  id="SurName"
                  v-model="assessmentStudentDetail.surName"
                  label="SurName"
                  variant="underlined"
                  density="compact"
                  :readonly="true"
                  :class="['readonly-text']"
              />
              <v-text-field
                  id="GivenName"
                  v-model="assessmentStudentDetail.givenName"
                  label="Given Name"
                  variant="underlined"
                  :maxlength="25"
                  density="compact"
                  :readonly="true"
                  :class="['readonly-text']"
              />
              <v-text-field
                  id="School"
                  v-model="assessmentStudentDetail.schoolName_desc"
                  label="School"
                  variant="underlined"
                  :maxlength="25"
                  density="compact"
                  :readonly="true"
                  :class="['readonly-text']"
              />
              <v-text-field
                  id="AttemptNumber"
                  v-model="assessmentStudentDetail.numberOfAttempts"
                  label="Attempt Number"
                  variant="underlined"
                  :readonly="true"
                  density="compact"
                  :class="['readonly-text']"
              />
              <v-autocomplete
                  id="ProficiencyScore"
                  v-model="assessmentStudentDetail.proficiencyScore"
                  variant="underlined"
                  :items="proficiencyScoreSearchNames"
                  label="Proficiency Score"
                  :readonly="!editPermitted || assessmentStudentDetail.provincialSpecialCaseCode === 'A'"
                  :clearable="editPermitted"
                  :class="editPermitted ? 'fieldtext': 'readonly-text'"
                  item-title="proficiencyScoreCodeName"
                  item-value="proficiencyScoreCodeValue"
                  autocomplete="off"
                  density="compact"
                  :color="getFieldColor(editPermitted)"
                  @update:model-value="setupSpecialCaseCodes($event)"
              />
              <v-autocomplete
                  id="SpecialCase"
                  v-model="assessmentStudentDetail.provincialSpecialCaseCode"
                  variant="underlined"
                  :items="specialCaseSearchNames"
                  label="Special Case"
                  :readonly="!editPermitted"
                  :clearable="editPermitted"
                  :class="editPermitted ? 'fieldtext': 'readonly-text'"
                  item-title="specialCaseCodeName"
                  item-value="specialCaseCodeValue"
                  autocomplete="off"
                  density="compact"
                  :color="getFieldColor(editPermitted)"
              />
            </v-form>
          </v-col>
          <v-col cols="12" md="6" v-if="assessmentStudentDetail?.assessmentStudentValidationIssues?.length > 0">
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
                        v-for="(issue, index) in assessmentStudentDetail.assessmentStudentValidationIssues"
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
      <v-row
          :class="functionType !== 'add' ? 'footer' : ''"
          no-gutters
      >
        <v-col class="d-flex justify-end mr-3 mt-3">
          <v-btn
              v-if="editPermitted && !assessmentStudentDetailCopy.provincialSpecialCaseCode && !assessmentStudentDetail.proficiencyScore"
              id="removeRecord"
              color="#003366"
              large-icon
              prepend-icon="mdi-delete"
              text="Remove"
              variant="outlined"
              class="mr-1"
              :disabled="!studentRegistrationDetailsFormValid"
              @click="deleteStudentRegistration"
          />
          <v-btn
              v-if="editPermitted"
              id="saveRecord"
              color="#003366"
              text="Validate & Save"
              class="mr-1"
              :disabled="!studentRegistrationDetailsFormValid"
              @click="saveStudentRegistration"
          />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
  <ConfirmationDialog ref="confirmRemoveStudentRegistration">
    <template #message>
      <p>Are you sure you want to remove this student registration from the session?</p>
    </template>
  </ConfirmationDialog>
</template>

<script>
import ApiService from '@/common/apiService';
import { Routes } from '@/utils/constants';
import ConfirmationDialog from '../../../util/ConfirmationDialog.vue';
import * as Rules from '@/utils/institute/formRules';
import Spinner from '../../../common/Spinner.vue';
import {
  setFailureAlert,
  setSuccessAlert,
} from '../../../composable/alertComposable';
import { sortBy, cloneDeep } from 'lodash';
import { appStore } from '@/store/modules/app';
import { authStore } from '@/store/modules/auth';
import { mapState } from 'pinia';
import {easStore} from '@/store/modules/eas';
import { PROFICIENCY_SCORE_RANGE_FILTER } from '@/utils/eas/StudentRegistrationTableConfiguration.js';
import { PERMISSION, hasRequiredPermission } from '@/utils/constants/Permission';
import moment from 'moment';

export default {
  name: 'EditStudentRegistration',
  components: {
    ConfirmationDialog,
    Spinner
  },
  props: {   
    selectedAssessmentStudentId: {
      type: String,
      required: true,
      default: null,
    }, 
    schoolYearSessions: {
      type: Object,
      required: true,
      default: null,
    },
    saveEvent: {
      type: Boolean,
      required: false,
      default: false,
    },
    removeEvent: {
      type: Boolean,
      required: false,
      default: false,
    },    
    functionType: {
      type: String,
      required: false,
      default: null
    },
  },
  emits: ['form-validity','reset-student-registration-parent', 'reset-student-registration-pagination'],
  data() {
    return {
      rules: Rules,
      sessionSearchNames: [],
      assessmentTypeSearchNames: [],
      assessmentCenterSearchNames: [],
      specialCaseSearchNames: [],
      proficiencyScoreSearchNames: [],
      selectedAssessmentStudentID: null,
      studentRegistrationDetailsFormValid: false,
      assessmentStudentDetailCopy: {},
      assessmentStudentDetail: {},
      loadingCount: 0,
      editPermitted: false,
      hasError: false
    };
  },
  computed: {
    ...mapState(appStore, [ 'activeSchools']),
    ...mapState(easStore, ['specialCaseCodes']),
    ...mapState(authStore, ['userInfo']),

  },
  watch: {
    selectedAssessmentStudentId: {
      handler(value) {
        this.setupAssessmentSessions();  
        this.getAssessmentStudentDetail(value);        
      },
      immediate: true
    },
    saveEvent: {
      handler(value) {
        if (value) {
          this.$nextTick().then(this.validateForm);
          this.saveStudentRegistration();
        }
      },
    },
    removeEvent: {
      handler(value) {
        if (value) {
          this.deleteStudentRegistration();
        }
      },
    },    
    studentRegistrationDetailsFormValid: {
      handler() {
        this.$emit('form-validity', this.studentRegistrationDetailsFormValid);
      }
    },
  },  
  created() {
    authStore()
      .getUserInfo()
      .then(() => {
        appStore()
          .getInstituteCodes()
          .then(() => {
            this.setupSchoolList();
            this.loading = false;
          });
        easStore()
          .getSpecialCaseCodes()
          .then(() => {           
            this.loading = false;
          });
      });    
    this.setupProficiencyScore();
    this.checkEditPermission();
  },
  methods: {
    isLoading(){
      return this.loadingCount > 0;
    },
    setupSchoolList() {
      this.schoolSearchNames = [];
      this.activeSchools.forEach((school) => {
        this.schoolSearchNames.push({
          schoolCodeName: school.schoolName + ' - ' + school.mincode,
          schoolCodeValue: school.schoolID
        });
      });
      this.assessmentCenterSearchNames = sortBy(this.schoolSearchNames, ['schoolCodeName']);
    },
    setupAssessmentSessions() {
      this.sessionSearchNames = [];
      this.schoolYearSessions?.forEach((session) => {
        this.sessionSearchNames.push({
          sessionCourseMonth: parseInt(session.courseMonth),
          sessionCourseYear: parseInt(session.courseYear),
          sessionCodeName: this.formatMonth(session.courseMonth) + ' ' + session.courseYear,
          sessionCodeValue: session.sessionID
        });
      });
      this.sessionSearchNames = sortBy(this.sessionSearchNames, ['sessionCourseYear','sessionCourseMonth']); 
    },
    setupSpecialCaseCodes($event) {
      this.specialCaseSearchNames = [];
      if($event && Number($event) >0 && this.assessmentStudentDetail.provincialSpecialCaseCode === 'A') {
        return;
      }
      Object.keys(this.specialCaseCodes).forEach(key => {
        if(!(this.assessmentStudentDetail.proficiencyScore && key === 'A')) {
          this.specialCaseSearchNames.push({
            specialCaseCodeName: this.specialCaseCodes[key],
            specialCaseCodeValue: key
          });
        }
      });
      this.specialCaseSearchNames = sortBy(this.specialCaseSearchNames, ['specialCaseCodeName']); 
    },    
    setupProficiencyScore() {
      PROFICIENCY_SCORE_RANGE_FILTER.filterOptions.forEach(entry => {
        this.proficiencyScoreSearchNames.push({
          proficiencyScoreCodeName: entry.id,
          proficiencyScoreCodeValue: entry.value
        });
      });
    },
    refreshAssessmentTypes($event) {
      let session = this.schoolYearSessions.find(session => session.sessionID === $event);
      this.assessmentTypeSearchNames = [];
      let assessmentID = null;
      session?.assessments.forEach((assessment) => {
        if(assessment.assessmentTypeName === this.assessmentStudentDetail.assessmentTypeName_desc) {
          assessmentID = assessment.assessmentID;
        }
        this.assessmentTypeSearchNames.push({
          assessmentCodeName: assessment.assessmentTypeName,
          assessmentCodeValue: assessment.assessmentTypeName,
          displayOrder: assessment.displayOrder
        });
      });            
      this.assessmentTypeSearchNames = sortBy(this.assessmentTypeSearchNames, ['displayOrder']); 
      if(assessmentID && this.assessmentStudentDetail.sessionID) {
        this.assessmentStudentDetail.assessmentID = assessmentID;         
      } else {
        this.assessmentStudentDetail.assessmentID = null;
        this.assessmentStudentDetail.assessmentTypeName_desc = null;        
      }
      this.validateForm();
    },
    syncAssessmentValue($event) {      
      let session = this.schoolYearSessions.find(session => session.sessionID === this.assessmentStudentDetail.sessionID);
      let assessment = session?.assessments.find(assessment => assessment.assessmentTypeName === $event);
      if(assessment && this.assessmentStudentDetail.sessionID) {
        this.assessmentStudentDetail.assessmentID =  assessment.assessmentID;
      } else {        
        this.assessmentStudentDetail.assessmentID = null;
        this.assessmentStudentDetail.assessmentTypeName_desc = null;
      }
    },
    getAssessmentStudentDetail(assessmentStudentID) {
      this.loadingCount += 1;
      this.selectedAssessmentStudentID=assessmentStudentID;
      ApiService.apiAxios.get(`${Routes.eas.ASSESSMENT_STUDENTS}/${assessmentStudentID}`)
        .then(response => {
          this.assessmentStudentDetail = response.data;
          this.assessmentStudentDetailCopy = cloneDeep(this.assessmentStudentDetail);
          this.refreshAssessmentTypes(this.assessmentStudentDetail.sessionID);
          this.setupSpecialCaseCodes();     
        }).catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get student registration details. Please try again later.');
        }).finally(() => {
          this.loadingCount -= 1;
          if (!this.isLoading()) {
            this.$nextTick().then(this.validateForm);
          }          
        });
    },
    checkEditPermission() {
      this.editPermitted = this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_EAS_STUDENT_PERMISSION);
    },    
    saveStudentRegistration() {
      this.loadingCount += 1;
      const putAssessmentStudentDetail = Object.fromEntries(
        Object.entries(this.assessmentStudentDetail).filter(([key]) => !key.endsWith('_desc'))
      );
      ApiService.apiAxios
        .put(
          `${Routes.eas.ASSESSMENT_STUDENTS}/`+this.selectedAssessmentStudentID, 
          putAssessmentStudentDetail
        )
        .then((res) => {
          this.assessmentStudentDetail.assessmentStudentValidationIssues = res.data.assessmentStudentValidationIssues;
          if(this.assessmentStudentDetail.assessmentStudentValidationIssues){
            this.hasError = true;
          } else if(!this.assessmentStudentDetail.assessmentStudentValidationIssues) {
            this.hasError = false;
            setSuccessAlert('Success! The student registration details have been updated.');
            this.$emit('reset-student-registration-pagination');
            this.$emit('reset-student-registration-parent');
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
    },
    deleteStudentRegistration() {
      const confirmation = this.$refs.confirmRemoveStudentRegistration.open('Confirm Removal of Student Registration', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Remove', rejectText: 'Cancel'});
      confirmation.then((result) => {
        if (result) {
          this.loadingCount += 1;
          ApiService.apiAxios.delete(`${Routes.eas.ASSESSMENT_STUDENTS}/`+this.selectedAssessmentStudentID)
            .then(() => {
              setSuccessAlert('Success! The student registration details have been deleted.');
              this.$emit('reset-student-registration-pagination');
            }).catch((error) => {
              console.error(error);
              setFailureAlert(
                error?.response?.data?.message
                  ? error?.response?.data?.message
                  : 'An error occurred while trying to delete student registration details. Please try again later.'
              );
            }).finally(() => {
              this.loadingCount -= 1;
              this.$emit('reset-student-registration-parent');
            });
        }
      });
    },
    validateForm() {
      this.$refs?.registrationDetailsForm?.validate();
    },
    formatMonth(month) {
      return moment(month, 'MM').format('MMMM');
    },
    getFieldColor(editPermitted) {
      return editPermitted ? '#003366' : '#7f7f7f' ;
    },    
    hasRequiredPermission
  },
};
</script>
<style>
.readonly-text {
  color: #7f7f7f;
}

</style>
