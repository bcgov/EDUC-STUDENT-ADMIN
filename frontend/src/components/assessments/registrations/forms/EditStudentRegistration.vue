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
        <v-col
          class="pt-0"
          cols="12"
        >
          <v-form
            ref="registrationDetailsForm"
            v-model="studentRegistrationDetailsFormValid"
          >
            <v-row>
              <v-col cols="12">
                <v-row class="mt-n4">
                  <v-col>                    
                    <v-autocomplete
                      id="Session"
                      v-model="assessmentStudentDetail.sessionID"
                      variant="underlined"                      
                      :items="sessionSearchNames"
                      label="Session"
                      :clearable="isSessionEditable"
                      item-title="sessionCodeName"
                      item-value="sessionCodeValue"
                      autocomplete="off"
                      :color="getFieldColor(isSessionEditable)"
                      :readonly="!isSessionEditable"
                      :class="!isSessionEditable ? 'readonly-text' : 'fieldtext'"
                      :rules="[rules.required()]"      
                      @update:model-value="refreshAssessmentTypes($event)"                
                    />
                  </v-col>               
                
                  <v-col cols="6">      
                    <v-autocomplete
                      id="AssessmentCourse"
                      v-model="assessmentStudentDetail.assessmentTypeName_desc"
                      variant="underlined"                      
                      :items="assessmentTypeSearchNames"
                      label="Assessment Course"
                      :clearable="isSessionEditable"
                      item-title="assessmentCodeName"
                      item-value="assessmentCodeValue"
                      autocomplete="off"
                      :color="getFieldColor(isSessionEditable)"
                      :readonly="!isSessionEditable"
                      :class="!isSessionEditable ? 'readonly-text' : 'fieldtext'"
                      :rules="[rules.required()]"       
                      @update:model-value="syncAssessmentValue($event)"            
                    />
                  </v-col>                  
                </v-row>
                <v-row class="mt-n4">
                  <v-col  cols="6">
                    <v-text-field
                      id="District"
                      v-model="assessmentStudentDetail.districtName_desc"
                      label="District"
                      variant="underlined"
                      :maxlength="25"
                      density="compact"
                      :readonly="true"
                      :class="['readonly-text']"
                    />
                  </v-col>    
                  <v-col>
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
                  </v-col>                  
                </v-row>
                <v-row class="mt-n4">
                  <v-col>                    
                    <v-autocomplete
                      id="AssessmentCenter"
                      v-model="assessmentStudentDetail.assessmentCenterID"
                      variant="underlined"                      
                      :items="assessmentCenterSearchNames"
                      label="Assessment Center Name or Number"
                      :clearable="isSessionEditable ? true: false"
                      item-title="schoolCodeName"
                      item-value="schoolCodeValue"
                      autocomplete="off"
                      density="compact"
                      :color="getFieldColor(isSessionEditable)"
                      :readonly="!isSessionEditable"
                      :class="!isSessionEditable ? 'readonly-text' : 'fieldtext'"
                    />
                  </v-col>   
                  <v-col>  
                    <v-autocomplete
                      id="SpecialCase"
                      v-model="assessmentStudentDetail.provincialSpecialCaseCode"
                      variant="underlined"                      
                      :items="specialCaseSearchNames"
                      label="Special Case"
                      :readonly="!isSessionEditable && !hasEditHistoryPermission()"
                      :clearable="!isSessionEditable && !hasEditHistoryPermission()? false : true"
                      :class="!isSessionEditable && !hasEditHistoryPermission()? 'readonly-text' : 'fieldtext'"
                      item-title="specialCaseCodeName"
                      item-value="specialCaseCodeValue"
                      autocomplete="off"
                      density="compact"                      
                      :color="getFieldColor(isSessionEditable || (!isActive && hasEditHistoryPermission()))"
                    />
                  </v-col>               
                </v-row>
                <v-row class="mt-n4">
                  <v-col>
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
                  </v-col>                  
            
                  <v-col>
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
                  </v-col>                  
                </v-row>
                <v-row class="mt-n4">
                  <v-col>
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
                  </v-col>                  
           
                  <v-col>
                    <v-text-field
                      id="SurName"
                      v-model="assessmentStudentDetail.surName"
                      label="SurName"                      
                      variant="underlined"
                      density="compact"
                      :readonly="true"
                      :class="['readonly-text']"
                    />
                  </v-col>                  
                </v-row>
                <v-row class="mt-n4">
                  <v-col>
                    <v-text-field
                      id="AttemptNumber"
                      v-model="assessmentStudentDetail.numberOfAttempts"
                      label="Attempt Number"
                      variant="underlined"
                      :readonly="true"
                      density="compact"
                      :class="['readonly-text']"
                    />
                  </v-col> 
                  <v-col>     
                    <v-autocomplete
                      id="ProficiencyScore"
                      v-model="assessmentStudentDetail.proficiencyScore"
                      variant="underlined"                      
                      :items="proficiencyScoreSearchNames"
                      label="Proficiency Score"
                      :readonly="isActive || !hasEditHistoryPermission()"
                      :clearable="isActive || !hasEditHistoryPermission()? false : true"
                      :class="isActive || !hasEditHistoryPermission()? 'readonly-text' : 'fieldtext'"
                      item-title="proficiencyScoreCodeName"
                      item-value="proficiencyScoreCodeValue"
                      autocomplete="off"
                      density="compact"
                      :color="getFieldColor((!isActive && hasEditHistoryPermission()))"
                      :rules="validateProficiencyScore()" 
                      @update:model-value="setupSpecialCaseCodes($event)"                      
                    />
                  </v-col>                 
                </v-row>   
              </v-col>
            </v-row>
          </v-form>
        </v-col>
      </div>
      <v-row         
        :class="functionType !== 'add' ? 'footer' : ''" 
        no-gutters 
      >
        <v-col class="d-flex justify-end mr-3 mt-3">
          <v-btn 
            v-if="isSessionEditable && !hasProficiencyScore()"
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
            v-if="isSessionEditable || hasEditHistoryPermission()"
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
import { sortBy } from 'lodash';
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
      assessmentStudentDetail: {},
      loadingCount: 0,
      isActive: false,
      isSessionEditable: false
    };
  },
  computed: {
    ...mapState(appStore, [ 'schoolMap', 'activeSchools']),
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
          this.deleteRegistration();
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
    this.setupProficienctScore();
  },
  methods: {
    isLoading(){
      return this.loadingCount > 0;
    },
    setupSchoolList() {
      this.schoolSearchNames = [];
      let schoolCollection = this.isActive ? this.activeSchools : this.schoolMap;
      schoolCollection?.forEach((school) => {
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
      if($event && Number($event) >0 && this.assessmentStudentDetail.provincialSpecialCaseCode === 'A') {
        return;
      }
      this.specialCaseSearchNames = [];
      Object.keys(this.specialCaseCodes).forEach(key => {
        if(!(this.hasProficiencyScore() && key === 'A')) {
          this.specialCaseSearchNames.push({
            specialCaseCodeName: this.specialCaseCodes[key],
            specialCaseCodeValue: key
          });
        }
      });
      this.specialCaseSearchNames = sortBy(this.specialCaseSearchNames, ['specialCaseCodeName']); 
    },    
    setupProficienctScore() {
      this.proficiencyScoreSearchNames = [];
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
    validateProficiencyScore() {
      if (this.assessmentStudentDetail) {
        if (this.assessmentStudentDetail.provincialSpecialCaseCode === 'A' && this.hasProficiencyScore()) {
          return ['Proficieny Score is not allowed'];
        }
      }
      return [];
    },  
    hasProficiencyScore() {
      return this.assessmentStudentDetail.proficiencyScore && Number(this.assessmentStudentDetail.proficiencyScore) > 0;
    }, 
    getAssessmentStudentDetail(assessmentStudentID) {
      this.loadingCount += 1;
      this.selectedAssessmentStudentID=assessmentStudentID;
      ApiService.apiAxios.get(`${Routes.eas.ASSESSMENT_STUDENTS}/${assessmentStudentID}`)
        .then(response => {
          this.assessmentStudentDetail = response.data;
          this.refreshAssessmentTypes(this.assessmentStudentDetail.sessionID);
          this.setupActiveFlag();
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
    setupActiveFlag() {
      this.isActive = this.schoolYearSessions.find(session => session.sessionID === this.assessmentStudentDetail.sessionID)?.isOpen;
      this.isSessionEditable = this.isActive;      
    },
    hasEditHistoryPermission() {
      return !this.isActive && this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_EAS_HISTORY_PERMISSION);
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
        .then(() => {
          setSuccessAlert('Success! The student registration details have been updated.');   
          this.$emit('reset-student-registration-pagination');
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
          this.$emit('reset-student-registration-parent');
        });
    },
    deleteStudentRegistration() {
      const confirmation = this.$refs.confirmRemoveStudentRegistration.open('Confirm Removal of Student Registration', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Remove', rejectText: 'Cancel'});
      if (!confirmation) {
        return;
      }
    },
    validateForm() {
      this.$refs?.registrationDetailsForm?.validate();
    },
    formatMonth(month) {
      return moment(month, 'MM').format('MMMM');
    },
    getFieldColor(active) {
      return active ? '#003366' : '#7f7f7f' ;
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
