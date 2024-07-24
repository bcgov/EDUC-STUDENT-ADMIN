<template>
  <v-row
    class="mt-0"
    :class="functionType !== 'add' ? 'mb-12' : 'mb-2'"
  >
    <v-col class="pt-0">
      <v-row v-if="isLoading()">
        <v-col class="d-flex justify-center">
          <Spinner
            :flat="true"
            style="margin-bottom: 80rem"
          />
        </v-col>
      </v-row>
      <div
        v-else
        ref="topDiv"
      >
        <v-row>
          <v-col class="pt-2 mb-1">
            <v-card
              v-if="functionType !== 'add'"
              variant="tonal"
              class="pa-2 mt-0"
            >
              <v-row no-gutters>
                <v-col cols="4">
                  <span id="eligible-fte-banner">
                    <b>Eligible FTE:</b> {{ sdcSchoolCollectionStudentDetailCopy?.fte }}
                    <a
                      v-if="showFundingEligibilityDetail"
                      style="text-decoration: underline"
                      @click="scrollToEligibility"
                    >(Details)</a>
                  </span>
                </v-col>
                <v-col cols="4">
                  <span id="graduatedFlag"><b>Graduated: </b>{{ sdcSchoolCollectionStudentDetailCopy?.isGraduated === 'true' ? 'Yes' : 'No' }}</span>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col cols="4">
                  <span>
                    <b>Assigned PEN: </b>
                    <span id="assignedPen">
                      {{ getAssignedPenDetails(sdcSchoolCollectionStudentDetailCopy.assignedPen, sdcSchoolCollectionStudentDetailCopy.studentPen, sdcSchoolCollectionStudentDetailCopy.penMatchResult).assignedPen }}
                    </span>
                    <v-tooltip content-class="customTooltip">
                      <template #activator="{ props: tooltipProps }">
                        <v-icon
                          v-bind="tooltipProps"
                          size="25"
                          color="#003366"
                          style="padding-left: .5rem;"
                        >
                          mdi-help-circle
                        </v-icon>
                      </template>
                      <span id="assignedPenTooltip">
                        {{ getAssignedPenDetails(sdcSchoolCollectionStudentDetailCopy.assignedPen, sdcSchoolCollectionStudentDetailCopy.studentPen, sdcSchoolCollectionStudentDetailCopy.penMatchResult).tooltip }}
                      </span>
                    </v-tooltip>
                  </span>
                </v-col>
                <v-col cols="4">
                  <span id="adultFlag"><b>Adult: </b>{{ sdcSchoolCollectionStudentDetailCopy?.isAdult === 'true' ? 'Yes' : 'No' }}</span>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            class="pt-0"
            cols="sdcSchoolCollectionStudentDetailCopy?.sdcSchoolCollectionStudentValidationIssues === undefined ? 12 : 6"
          >
            <v-form
              ref="studentDetailsForm"
              v-model="studentDetailsFormValid"
            >
              <v-row>
                <v-col cols="12">
                  <v-row>
                    <v-col>
                      <v-text-field
                        id="studentPen"
                        v-model="sdcSchoolCollectionStudentDetailCopy.studentPen"
                        label="Submitted PEN"
                        variant="underlined"
                        :maxlength="9"
                        :rules="penRules"
                        density="compact"
                        :disabled="isSchoolCollectionSubmitted()"
                      />
                    </v-col>
                    <v-col>
                      <v-text-field
                        id="localID"
                        v-model="sdcSchoolCollectionStudentDetailCopy.localID"
                        label="Local ID"
                        variant="underlined"
                        :maxlength="12"
                        density="compact"
                        :disabled="isSchoolCollectionSubmitted()"
                      />
                    </v-col>
                  </v-row>
                  <v-row class="mt-n4">
                    <v-col>
                      <DatePicker
                        id="dobPicker"
                        v-model="sdcSchoolCollectionStudentDetailCopy.dob"
                        label="Birthdate"
                        :rules="[rules.required()]"
                        model-type="yyyyMMdd"
                        density="compact"
                        :disabled="isSchoolCollectionSubmitted()"
                      />
                    </v-col>
                    <v-col>
                      <v-select
                        id="gender"
                        v-model="sdcSchoolCollectionStudentDetailCopy.gender"
                        :items="sdcCollection.genderCodes"
                        item-value="genderCode"
                        item-title="dropdownText"
                        label="Gender"
                        variant="underlined"
                        :rules="[rules.required()]"
                        density="compact"
                        :disabled="isSchoolCollectionSubmitted()"
                      />
                    </v-col>
                  </v-row>
                  <v-row class="mt-n4">
                    <v-col>
                      <v-text-field
                        id="legalLastName"
                        v-model="sdcSchoolCollectionStudentDetailCopy.legalLastName"
                        label="Legal Surname"
                        variant="underlined"
                        :rules="[rules.required()]"
                        :maxlength="25"
                        density="compact"
                        :disabled="isSchoolCollectionSubmitted()"
                      />
                    </v-col>
                    <v-col>
                      <v-text-field
                        id="usualLastName"
                        v-model="sdcSchoolCollectionStudentDetailCopy.usualLastName"
                        label="Usual Surname"
                        variant="underlined"
                        :maxlength="25"
                        density="compact"
                        :disabled="isSchoolCollectionSubmitted()"
                      />
                    </v-col>
                  </v-row>
                  <v-row class="mt-n4">
                    <v-col>
                      <v-text-field
                        id="legalFirstName"
                        v-model="sdcSchoolCollectionStudentDetailCopy.legalFirstName"
                        label="Legal Given"
                        variant="underlined"
                        :maxlength="25"
                        density="compact"
                        :disabled="isSchoolCollectionSubmitted()"
                      />
                    </v-col>
                    <v-col>
                      <v-text-field
                        id="usualFirstName"
                        v-model="sdcSchoolCollectionStudentDetailCopy.usualFirstName"
                        label="Usual Given"
                        variant="underlined"
                        :maxlength="25"
                        density="compact"
                        :disabled="isSchoolCollectionSubmitted()"
                      />
                    </v-col>
                  </v-row>
                  <v-row class="mt-n4">
                    <v-col>
                      <v-text-field
                        id="legalMiddleNames"
                        v-model="sdcSchoolCollectionStudentDetailCopy.legalMiddleNames"
                        label="Legal Middle"
                        variant="underlined"
                        :maxlength="25"
                        density="compact"
                        :disabled="isSchoolCollectionSubmitted()"
                      />
                    </v-col>
                    <v-col>
                      <v-text-field
                        id="usualMiddleNames"
                        v-model="sdcSchoolCollectionStudentDetailCopy.usualMiddleNames"
                        label="Usual Middle"
                        variant="underlined"
                        :maxlength="25"
                        density="compact"
                        :disabled="isSchoolCollectionSubmitted()"
                      />
                    </v-col>
                  </v-row>
                  <v-row class="mt-n4">
                    <v-col>
                      <v-select
                        id="enrolledGradeCode"
                        v-model="sdcSchoolCollectionStudentDetailCopy.enrolledGradeCode"
                        label="Grade"
                        variant="underlined"
                        :items="sdcCollection.enrolledGradeCodes"
                        item-value="enrolledGradeCode"
                        item-title="dropdownText"
                        :rules="[rules.required()]"
                        density="compact"
                        :disabled="isSchoolCollectionSubmitted()"
                      />
                    </v-col>
                    <v-col>
                      <v-select
                        id="schoolFundingCode"
                        v-model="sdcSchoolCollectionStudentDetailCopy.schoolFundingCode"
                        label="Funding Code"
                        variant="underlined"
                        :items="sdcCollection.schoolFundingCodes"
                        item-value="schoolFundingCode"
                        item-title="dropdownText"
                        density="compact"
                        :disabled="isSchoolCollectionSubmitted()"
                      />
                    </v-col>
                  </v-row>
                  <v-row class="mt-n4">
                    <v-col>
                      <v-autocomplete
                        id="numberOfCourses"
                        v-model="sdcSchoolCollectionStudentDetailCopy.numberOfCourses"
                        :items="courseOptions"
                        label="Number of Courses"
                        variant="underlined"
                        density="compact"
                        autocomplete="off"
                        :disabled="isSchoolCollectionSubmitted()"
                      />
                    </v-col>
                    <v-col>
                      <v-select
                        id="otherCourses"
                        v-model="sdcSchoolCollectionStudentDetailCopy.otherCourses"
                        label="Other Courses"
                        variant="underlined"
                        :items="sdcCollection.otherCoursesValidNumbers"
                        density="compact"
                        :disabled="isSchoolCollectionSubmitted()"
                      />
                    </v-col>
                  </v-row>
                  <v-row class="mt-n4">
                    <v-col>
                      <v-select
                        id="supportBlocks"
                        v-model="sdcSchoolCollectionStudentDetailCopy.supportBlocks"
                        label="Support Blocks"
                        variant="underlined"
                        :items="sdcCollection.supportBlocksValidNumbers"
                        density="compact"
                        :disabled="isSchoolCollectionSubmitted()"
                      />
                    </v-col>
                    <v-col>
                      <v-select
                        id="specialEducationCategoryCode"
                        v-model="sdcSchoolCollectionStudentDetailCopy.specialEducationCategoryCode"
                        label="Special Ed. Category"
                        variant="underlined"
                        :items="sdcCollection.specialEducationCodes"
                        item-value="specialEducationCategoryCode"
                        item-title="dropdownText"
                        density="compact"
                        :disabled="isSchoolCollectionSubmitted()"
                      />
                    </v-col>
                  </v-row>
                  <v-row class="mt-n4">
                    <v-col>
                      <v-select
                        id="nativeAncestryInd"
                        v-model="sdcSchoolCollectionStudentDetailCopy.nativeAncestryInd"
                        label="Indigenous Ancestry"
                        variant="underlined"
                        :items="sdcCollection.ancestryItems"
                        item-value="code"
                        item-title="dropdownText"
                        density="compact"
                        :rules="[rules.required()]"
                        :disabled="isSchoolCollectionSubmitted()"
                      />
                    </v-col>
                    <v-col>
                      <v-select
                        id="bandCode"
                        v-model="sdcSchoolCollectionStudentDetailCopy.bandCode"
                        label="Band of Residence"
                        variant="underlined"
                        :items="sdcCollection.bandCodes"
                        item-value="bandCode"
                        item-title="dropdownText"
                        density="compact"
                        :disabled="isSchoolCollectionSubmitted()"
                      />
                    </v-col>
                  </v-row>
                  <v-row class="mt-n4">
                    <v-col>
                      <v-select
                        id="homeLanguageSpokenCode"
                        v-model="sdcSchoolCollectionStudentDetailCopy.homeLanguageSpokenCode"
                        label="Home Language"
                        variant="underlined"
                        :items="sdcCollection.homeLanguageSpokenCodes"
                        item-value="homeLanguageSpokenCode"
                        item-title="dropdownText"
                        density="compact"
                        :disabled="isSchoolCollectionSubmitted()"
                      />
                    </v-col>
                    <v-col>
                      <v-text-field
                        id="postalCode"
                        v-model="sdcSchoolCollectionStudentDetailCopy.postalCode"
                        label="Postal Code"
                        variant="underlined"
                        :maxlength="6"
                        density="compact"
                        :disabled="isSchoolCollectionSubmitted()"
                      />
                    </v-col>
                  </v-row>
                  <v-row class="mt-n4">
                    <v-col>
                      <v-select
                        id="careerProgramCode"
                        v-model="sdcSchoolCollectionStudentDetailCopy.careerProgramCode"
                        label="Career Code"
                        variant="underlined"
                        :items="sdcCollection.careerProgramCodes"
                        item-value="careerProgramCode"
                        item-title="dropdownText"
                        density="compact"
                        :disabled="isSchoolCollectionSubmitted()"
                      />
                    </v-col>
                    <v-col>
                      <v-select
                        id="filteredEnrolledProgramCodes"
                        v-model="sdcSchoolCollectionStudentDetailCopy.filteredEnrolledProgramCodes"
                        label="Program Codes"
                        variant="underlined"
                        :items="sdcCollection.enrolledProgramCodes"
                        item-value="enrolledProgramCode"
                        item-title="dropdownText"
                        multiple
                        density="compact"
                        :rules="enrolledProgramRules"
                        :disabled="isSchoolCollectionSubmitted()"
                        @update:model-value="syncWithEnrolledProgramCodeOnUserInput"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-form>
          </v-col>
          <v-divider
            v-if="sdcSchoolCollectionStudentDetailCopy?.sdcSchoolCollectionStudentValidationIssues !== undefined"
            :thickness="1"
            inset
            color="#b3b0b0"
            class="border-opacity-75"
            vertical
          />
          <v-col v-if="sdcSchoolCollectionStudentDetailCopy?.sdcSchoolCollectionStudentValidationIssues?.length > 0">
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
              <v-col class="pl-0 pr-6 scroll">
                <v-timeline
                  v-if="sdcSchoolCollectionStudentDetailCopy.sdcSchoolCollectionStudentValidationIssues"
                  side="end"
                  density="compact"
                  style="margin-left: 1em"
                  align="start"
                  truncate-line="start"
                >
                  <v-timeline-item
                    v-for="(issue) in formatAndSortValidationIssues(sdcSchoolCollectionStudentDetailCopy.sdcSchoolCollectionStudentValidationIssues)"
                    :key="issue.sdcSchoolCollectionStudentValidationIssueID"
                    dot-color="white"
                    fill-dot
                    :icon-color="getIssueIconColor(issue.validationIssueSeverityCode)"
                    :icon="getIssueIcon(issue.validationIssueSeverityCode)"
                    size="large"
                    width="100%"
                  >
                    <v-row class="mt-n1">
                      <v-col>
                        <h3 :style="`color:` + getIssueIconColor(issue.validationIssueSeverityCode)">
                          {{ getValidationIssueSeverityCodeLabel(issue.validationIssueSeverityCode) }}
                        </h3>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <span> {{ getValidationIssueTypeCodesDescription(issue.validationIssueCode) }} </span>
                      </v-col>
                    </v-row>
                    <v-form
                      ref="form"
                      v-model="isValid"
                    >
                      <v-row>
                        <v-col>
                          <div
                            v-for="(field) in issue.validationIssueFieldCode"
                            :key="field"
                          >
                            <v-text-field
                              v-if="sdcFieldMappings[field]?.type === 'input'"
                              :id="`${sdcFieldMappings[field]?.key}ValidationTextInput`"
                              v-model:model-value="sdcSchoolCollectionStudentDetailCopy[sdcFieldMappings[field]?.key]"
                              :label="sdcFieldMappings[field]?.label"
                              :rules="sdcFieldMappings[field]?.options.rules"
                              :maxlength="sdcFieldMappings[field]?.options.maxlength"
                              density="compact"
                              variant="underlined"
                            />
                            <v-autocomplete
                              v-else-if="sdcFieldMappings[field]?.key === 'numberOfCourses'"
                              :id="`${sdcFieldMappings[field].key}ValidationDropdown`"
                              v-model="sdcSchoolCollectionStudentDetailCopy[sdcFieldMappings[field].key]"
                              :rules="sdcFieldMappings[field].options.rules"
                              :items="courseOptions"
                              item-title="dropdownText"
                              :label="sdcFieldMappings[field].label"
                              autocomplete="off"
                            />
                            <v-autocomplete
                              v-else-if="sdcFieldMappings[field]?.type === 'select'"
                              :id="`${sdcFieldMappings[field].key}ValidationDropdown`"
                              v-model="sdcSchoolCollectionStudentDetailCopy[sdcFieldMappings[field].key]"
                              :rules="sdcFieldMappings[field].options.rules"
                              :items="sdcCollection[sdcFieldMappings[field].options.items]"
                              :item-value="sdcFieldMappings[field].options.itemValue"
                              item-title="dropdownText"
                              :label="sdcFieldMappings[field].label"
                            />
                            <v-autocomplete
                              v-else-if="sdcFieldMappings[field]?.type === 'multiselect'"
                              :id="`${sdcFieldMappings[field].key}ValidationMultiSelect`"
                              v-model="sdcSchoolCollectionStudentDetailCopy[sdcFieldMappings[field].key]"
                              :rules="sdcFieldMappings[field].options.rules"
                              :items="sdcCollection[sdcFieldMappings[field].options.items]"
                              :item-value="sdcFieldMappings[field].options.itemValue"
                              item-title="dropdownText"
                              :label="sdcFieldMappings[field].label"
                              multiple
                              placeholder="No Program Codes"
                              :persistent-placeholder="true"
                              :selectable="() => sdcSchoolCollectionStudentDetailCopy[sdcFieldMappings[field].key].length < 8"
                              @update:model-value="syncWithEnrolledProgramCodeOnUserInput"
                            />
                            <div v-else-if="sdcFieldMappings[field]?.type === 'datePicker'">
                              <DatePicker
                                :id="`${sdcFieldMappings[field].key}DatePicker`"
                                v-model="sdcSchoolCollectionStudentDetailCopy[sdcFieldMappings[field].key]"
                                :label="sdcFieldMappings[field]?.label"
                                :rules="sdcFieldMappings[field].options.rules"
                                model-type="yyyyMMdd"
                              />
                            </div>
                          </div>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-timeline-item>
                </v-timeline>
              </v-col>
            </v-row>
          </v-col>
          <v-col v-else-if="sdcSchoolCollectionStudentDetailCopy?.sdcSchoolCollectionStudentValidationIssues?.length === 0">
            <v-alert
              :closable="true"
              type="success"
              variant="tonal"
              text="There are no errors or warnings on this student record."
            />
          </v-col>
        </v-row>
      </div>
      <div ref="eligibility" />
      <slot name="eligibility" />
      <v-row
        :class="functionType !== 'add' ? 'footer' : ''"
        no-gutters
      >
        <v-col class="d-flex justify-end mr-3 mt-3">
          <v-pagination
            v-if="functionType !== 'add' && selectedStudents.length !== 1"
            v-model="page"
            :length="selectedStudents.length"
            :total-visible="2"
            rounded="circle"
            class="mt-n3"
            @update:model-value="navigate"
          />
          <v-btn
            v-if="functionType !== 'add'"
            id="removeRecord"
            color="#003366"
            large-icon
            prepend-icon="mdi-delete"
            text="Remove"
            variant="outlined"
            class="mr-1"
            :disabled="isSchoolCollectionSubmitted() || isDistrictCollectionSubmitted()"
            @click="deleteStudent"
          />
          <v-btn
            id="saveRecord"
            color="#003366"
            text="Validate & Save"
            class="mr-1"
            :disabled="!studentDetailsFormValid || isSchoolCollectionSubmitted() || isDistrictCollectionSubmitted()"
            @click="save"
          />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
  <ConfirmationDialog ref="confirmRemoveStudent">
    <template #message>
      <p>Are you sure you want to remove this student from the collection?</p>
    </template>
  </ConfirmationDialog>
</template>
<script>

import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {SDC_VALIDATION_FIELD_MAPPINGS} from '../../../utils/sdc/sdcValidationFieldMappings';
import {cloneDeep} from 'lodash';
import {formatDob} from '@/utils/format';
import Spinner from '@/components/common/Spinner.vue';
import {setFailureAlert, setSuccessAlert, setWarningAlert} from '../../composable/alertComposable';
import {sdcCollectionStore} from '@/store/modules/sdcCollection';
import DatePicker from '@/components/util/DatePicker.vue';
import * as Rules from '../../../utils/institute/formRules';
import {isValidPEN, checkEnrolledProgramLength} from '../../../utils/validation';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';

export default {
  name: 'EditStudent',
  components: {
    ConfirmationDialog,
    Spinner,
    DatePicker,
  },
  props: {
    selectedStudents: {
      type: Array,
      required: true,
      default: null
    },
    showFundingEligibilityDetail:{
      type: Boolean,
      required: false,
      default: false
    },
    totalStudents: {
      type: Number,
      required: false,
      default: null
    },
    saveEvent: {
      type: Boolean,
      required: false,
      default: false
    },
    removeEvent: {
      type: Boolean,
      required: false,
      default: false
    },
    functionType: {
      type: String,
      required: false,
      default: null
    }
  },
  emits: ['next', 'show-issues', 'clear-filter', 'filter-pen', 'form-validity', 'reset-parent', 'student-object', 'close-success', 'reset-pagination'],
  data() {
    return {
      page: 1,
      penRules: [v => (!v || isValidPEN(v) || 'Must be a valid PEN')],
      sdcFieldMappings: SDC_VALIDATION_FIELD_MAPPINGS,
      sdcCollection: sdcCollectionStore(),
      selectedSdcStudentID: null,
      isValid: false,
      hasError: false,
      sdcSchoolCollectionStudentDetail: {},
      sdcSchoolCollectionStudentDetailCopy: {},
      loadingCount: 0,
      rules: Rules,
      studentDetailsFormValid:false,
      removeIndex: null,
      enrolledProgramRules: [v => checkEnrolledProgramLength(v) || 'Select a maximum of 8 Enrolled Programs'],
      courseOptions: []
    };
  },
  computed: {

  },
  watch: {
    selectedStudents: {
      handler(value) {
        if(value.length > 0) {
          this.getSdcSchoolCollectionStudentDetail(value[0]);
        }
      },
      immediate: true
    },
    saveEvent: {
      handler(value) {
        if(value) {
          this.save();
        }
      }
    },
    removeEvent: {
      handler(value) {
        if(value) {
          this.deleteStudent();
        }
      }
    },
    studentDetailsFormValid: {
      handler() {
        this.$emit('form-validity', this.studentDetailsFormValid);
      }
    },
    functionType: {
      handler(value) {
        if(value === 'add') {
          this.sdcSchoolCollectionStudentDetailCopy.sdcSchoolCollectionStudentStatusCode= 'LOADED';
          this.sdcSchoolCollectionStudentDetailCopy.sdcSchoolCollectionID= this.$route.params.schoolCollectionID;
          this.$nextTick().then(this.validateForm);
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.generateCourseOptions();
  },
  async created() {

  },
  methods: {
    generateCourseOptions() {
      for (let i = 0; i <= 30; i += 0.25) {
        this.courseOptions.push(i.toFixed(2).padStart(5, '0'));
      }
    },
    isSchoolCollectionSubmitted(){
      return this.sdcCollection?.schoolCollection?.sdcSchoolCollectionStatusCode === 'SUBMITTED';
    },
    isDistrictCollectionSubmitted(){
      return this.sdcCollection?.districtCollection?.sdcDistrictCollectionStatusCode === 'SUBMITTED';
    },
    next() {
      if(sdcCollectionStore().currentStepInCollectionProcess.isComplete) {
        this.$emit('next');
      } else {
        this.markStepAsComplete();
      }
    },
    clearFilter() {
      this.$emit('clear-filter');
    },
    navigate() {
      this.getSdcSchoolCollectionStudentDetail(this.selectedStudents[this.page - 1]);
    },
    isLoading(){
      return this.loadingCount > 0;
    },
    getSdcSchoolCollectionStudentDetail(sdcSchoolCollectionStudentID) {
      this.loadingCount += 1;
      this.selectedSdcStudentID=sdcSchoolCollectionStudentID;
      ApiService.apiAxios.get(`${Routes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${sdcSchoolCollectionStudentID}`)
        .then(response => {
          this.filterSdcSchoolCollectionStudentAndPopulateProperties(response.data);
        }).catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get student detail counts. Please try again later.');
        }).finally(() => {
          this.removeIndex = null;
          this.loadingCount -= 1;
          if (!this.isLoading()) {
            this.$nextTick().then(this.validateForm);
          }
          this.$emit('student-object', this.sdcSchoolCollectionStudentDetailCopy);
        });
    },
    save(){
      this.loadingCount += 1;
      this.hasError = false;

      if(this.sdcCollection?.schoolCollection?.sdcDistrictCollectionID){
        this.sdcSchoolCollectionStudentDetailCopy.sdcDistrictCollectionID = this.sdcCollection.schoolCollection.sdcDistrictCollectionID;
      }
      ApiService.apiAxios.post(`${Routes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}`, this.sdcSchoolCollectionStudentDetailCopy)
        .then((res) => {
          if (res.data.sdcSchoolCollectionStudentStatusCode === 'ERROR') {
            setWarningAlert('Warning! Updates to student details will not be saved until all errors are fixed.');
            this.filterSdcSchoolCollectionStudentAndPopulateProperties(res.data);
            this.hasError = true;
          } else {
            setSuccessAlert('Success! The student details have been updated.');
            if(this.functionType === 'add'){
              this.$emit('close-success', res.data);
            } else if((this.page < this.selectedStudents.length)  && res.data.sdcSchoolCollectionStudentValidationIssues?.length === 0){
              this.getSdcSchoolCollectionStudentDetail(this.selectedStudents[this.page++]);
            } else {
              this.getSdcSchoolCollectionStudentDetail(this.selectedSdcStudentID);
            }
          }
        }).catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to update student details. Please try again later.');
        }).finally(() => {
          this.loadingCount -= 1;
          this.$emit('reset-parent');
        });
    },
    scrollToEligibility() {
      const eligibility = this.$refs.eligibility;
      this.performScroll(eligibility);
    },
    performScroll(element){
      if (element) {
        element.scrollIntoView({behavior: 'smooth'});
      }
    },
    async deleteStudent(){
      const confirmation = await this.$refs.confirmRemoveStudent.open('Confirm Removal of Student', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Remove', rejectText: 'Cancel'});
      if (!confirmation) {
        return;
      }
      this.loadingCount += 1;
      this.hasError = false;
      ApiService.apiAxios.delete(`${Routes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.selectedSdcStudentID}`, this.sdcSchoolCollectionStudentDetailCopy)
        .then(() => {
          this.removeIndex = this.selectedStudents.findIndex(value => value === this.selectedSdcStudentID);
          this.selectedStudents.splice(this.removeIndex, 1);
          setSuccessAlert('Success! The student details have been deleted.');
          this.$emit('reset-pagination');
        }).catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to update student details. Please try again later.');
        }).finally(() => {
          this.loadingCount -= 1;
          this.$emit('reset-parent');
          if(this.selectedStudents.length > 0) {
            this.page = (this.page  === 1 ? 1 : this.page - 1);
            this.removeIndex === 0 ? this.getSdcSchoolCollectionStudentDetail(this.selectedStudents[0]) :this.getSdcSchoolCollectionStudentDetail(this.selectedStudents[this.removeIndex - 1]);
          }
          else {
            this.$emit('show-issues');
          }
        });
    },
    filterEnrolledProgramCodes(enrolledProgramCodes = []){
      if(enrolledProgramCodes) {
        return enrolledProgramCodes.filter((enrolledProgramCode, index) =>  {
          if(enrolledProgramCodes.indexOf(enrolledProgramCode) === index) {
            return sdcCollectionStore().enrolledProgramCodesMap.has(enrolledProgramCode);
          }
        });
      }
    },
    filterSdcSchoolCollectionStudentAndPopulateProperties(sdcSchoolCollectionStudent) {
      let filteredSdcSchoolCollectionStudent = {...sdcSchoolCollectionStudent, filteredEnrolledProgramCodes: this.filterEnrolledProgramCodes(sdcSchoolCollectionStudent.enrolledProgramCodes)};
      this.sdcSchoolCollectionStudentDetail = filteredSdcSchoolCollectionStudent;
      this.sdcSchoolCollectionStudentDetailCopy = cloneDeep(filteredSdcSchoolCollectionStudent);
      this.sdcSchoolCollectionStudentDetailCopy.enrolledProgramCodes = filteredSdcSchoolCollectionStudent.filteredEnrolledProgramCodes;
    },
    syncWithEnrolledProgramCodeOnUserInput(value){
      this.sdcSchoolCollectionStudentDetailCopy.enrolledProgramCodes = value;
    },
    getValidationIssueTypeCodesDescription(key){
      return sdcCollectionStore().validationIssueTypeCodesMap.get(key)?.message;
    },
    getValidationIssueSeverityCodeLabel(severityCode){
      if (severityCode === 'ERROR') {
        return 'Error';
      } else if (severityCode === 'INFO_WARNING') {
        return 'Info Warning';
      } else if (severityCode === 'FUNDING_WARNING') {
        return 'Funding Warning';
      }
    },
    fieldOrHyphen(field){
      return field || '-';
    },
    getLegalName(first, middle, last){
      if(first && middle){
        return last + ', ' + first + ' ' + middle;
      }else if(first){
        return last + ', ' + first;
      }else if(middle){
        return last + ', ' + middle;
      }else if(last){
        return last;
      }
      return '';
    },
    formatAndSortValidationIssues(validationIssues = []){
      let validationIssueMap = new Map();
      for (let issue of validationIssues) {
        if (!validationIssueMap.has(issue.validationIssueCode)) {
          validationIssueMap.set(issue.validationIssueCode, {...issue, validationIssueFieldCode: [issue.validationIssueFieldCode]});
        } else {
          let existingIssue = validationIssueMap.get(issue.validationIssueCode);
          existingIssue.validationIssueFieldCode.push(issue.validationIssueFieldCode);
          // Sort validationIssueFieldCode alphabetically
          existingIssue.validationIssueFieldCode.sort();
        }
      }

      const issuesArray = Array.from(validationIssueMap.values());
      issuesArray.sort((a, b) => {
        // Compare by severity code
        if (a.validationIssueSeverityCode !== b.validationIssueSeverityCode) {
          return a.validationIssueSeverityCode.localeCompare(b.validationIssueSeverityCode);
        }
        // If severity is the same, compare by validationIssueCode alphabetically
        return a.validationIssueCode.localeCompare(b.validationIssueCode);
      });

      return issuesArray;
    },
    getStudentStatus(student){
      let studentValidationIssueStatus = student.sdcSchoolCollectionStudentStatusCode;
      if(studentValidationIssueStatus === 'ERROR') {
        return 'ERROR';
      } else if(studentValidationIssueStatus === 'FUNDWARN') {
        return 'FUNDING_WARNING';
      } else if(studentValidationIssueStatus === 'INFOWARN') {
        return 'INFO_WARNING';
      }
    },
    getIssueIcon(issue){
      switch (issue) {
      case 'ERROR':
        return 'mdi-alert-circle-outline';
      case 'INFO_WARNING':
        return 'mdi-alert-circle-outline';
      case 'FUNDING_WARNING':
        return 'mdi-alert-outline';
      default:
        return '';
      }
    },
    getIssueIconColor(issue){
      switch (issue) {
      case 'ERROR':
        return '#d90606';
      case 'INFO_WARNING':
        return '#2196F3';
      case 'FUNDING_WARNING':
        return '#ff9800';
      default:
        return '';
      }
    },
    getAssignedPenDetails(assignedPen, studentPen, penMatchResult) {
      let result = {
        assignedPen: null,
        tooltip: ''
      };

      switch (penMatchResult) {
      case 'MATCH':
        result.assignedPen = assignedPen;
        if (studentPen && studentPen !== assignedPen) {
          result.tooltip = 'Differences between the Assigned PEN and Submitted PEN indicate an existing student file has been matched to the submitted details. The Assigned PEN will be used to prevent duplication.';
        } else if (!studentPen) {
          result.tooltip = 'No submitted PEN was provided. The submitted details has been matched to an existing student file and assigned a PEN. The Assigned PEN will be used to prevent duplication.';
        } else {
          result.tooltip = 'Same Assigned PEN and Submitted PEN indicate that the submitted details have been matched to an existing student file.';
        }
        break;
      case 'MULTI':
      case 'NEW':
        result.assignedPen = 'Under Review';
        result.tooltip = 'The submitted PEN and student details are similar to multiple student files. Upon file submission, this record will be sent to a PEN Coordinator for review to prevent duplication.';
        break;
      default:
        result.assignedPen = 'Waiting on fixes';
        result.tooltip = 'The submitted student details have errors or incomplete information. Confirm the submitted student name and date of birth.';
        break;
      }

      return result;
    },
    validateForm() {
      this.$refs?.studentDetailsForm?.validate();
    },
    formatDob
  }
};
</script>

<style scoped>
.containerSetup{
  padding-right: 0em !important;
  padding-left: 0em !important;
}

.border {
  border: 2px solid grey;
  border-radius: 5px;
  padding: 35px;
  margin-bottom: 2em;
}

.clear-message {
  color: darkgreen;
  background-color: rgb(227, 240, 217);
  padding: 0.4em;
}

.clear-message-error {
  color: #ff0000;
  background-color: rgba(255, 187, 185, 0.66);
  padding: 0.6em;
}

.inner-border {
  display: inline-block;
  min-width: 100%;
  border: 1px solid rgba(42, 45, 38, 0.38);
  border-radius: 5px;
  padding: 2em;
  margin-bottom: 2em;
}

@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 3em !important;
    padding-left: 3em !important;
  }
}

.footer-text {
  font-style: italic;
  color: grey;
}

.filter-text {
  font-style: italic;
  color: rgb(56, 89, 138);
}

.footer {
  background: white;
  position: fixed;
  bottom: 0;
  z-index: 20000;
  left: 0;
  right: 0;
  height: 60px;
}

.filter-text:hover {
  text-decoration: underline;
}

.success-message{
  vertical-align: sub;
}
</style>
<style scoped>
:global(.customTooltip) {
  max-width: 30rem !important;
}
</style>

