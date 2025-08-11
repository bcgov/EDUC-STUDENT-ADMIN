<template>
  <div v-if="loading">
    <v-row>
      <v-col class="d-flex justify-center">
        <v-progress-circular
          :size="70"
          :width="7"
          color="primary"
          indeterminate
        />
      </v-col>
    </v-row>
  </div>
  <div v-else>
    <v-row>
      <v-col
        cols="12"
        class="d-flex justify-end mb-n8"
      >
        <v-chip
          v-if="challengeReportsSessionStatus === 'PRELIM'"
          color="warning"
        >
          Preliminary - Updates due by {{ activePeriod.finalDateForChanges }}
        </v-chip>
        <v-chip
          v-else-if="challengeReportsSessionStatus === 'FINALIZED'"
          color="success"
        >
          Final - Data as of {{ activePeriod.finalCompletionDate }}
        </v-chip>
        <v-chip v-else>
          Preliminary Phase Not Started
        </v-chip>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <h3 class="subHeading pb-1">
          Challenge Report Description
        </h3>
        <p>The Funding Report for Course Challenges includes students that were eligible for funding and received a passing grade when challenging a course during the school year.</p>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <h3 class="subHeading pb-3">
          Reporting Parameters
        </h3>
        <p><b>School Year:</b> {{ schoolYear }}</p>
        <p style="font-style: italic; color: dimgrey">
          Used to determine which course sessions to use when looking for challenges.
        </p>
        <p class="mt-3">
          <b>Student Data Collections:</b> {{ sdcCollections }}
        </p>
        <p style="font-style: italic; color: dimgrey">
          Used to determine funding eligibility for students who sucessfully completed course challenges.
        </p>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="9">
        <h3 class="subHeading pb-1">
          District Notification Email
        </h3>
        <p>
          Enter the following details to automatically populate the <v-menu
            location="bottom"
          >
            <template #activator="{ props }">
              <a
                v-bind="props"
                @click="toggleMoreInfoTooltip"
              >
                Preliminary
              </a>
            </template>
            <v-card
              style="max-width: 30em;"
              border="sm"
              class="pa-2"
            >
              <div>
                Hello,
              </div><br>
              <div>
                The Preliminary Funding Report for Course Challenges for <b>*SCHOOL_YEAR*</b> is now available for your district to download through the Education Data Exchange. This report lists all students who, according to our records, successfully completed a course challenge during the <b>*SCHOOL_YEAR*</b> school year.
              </div><br>

              <div>For the <b>*SCHOOL_YEAR*</b> school year, each successful course challenge will be funded at a rate of <b>*FUNDING_RATE*</b>. Once confirmed, the funding will be disbursed to your district by the ministry’s Financial Management Division following the funding recalculation in December. It will be included in a subsequent bi-monthly electronic funds transfer.</div><br>

              <div>Please review the report carefully to ensure the information matches your district’s records. If there are discrepancies, submit corrections via the EDX Upload Graduation Data File process or a GRAD Change Form by <b>*DEADLINE_FOR_COURSE_UPDATES*</b></div><br>

              <div>If you have any questions, please contact the Student Certification Unit at: student.certification@gov.bc.ca.</div><br>

              <div>Regards,</div>
              <div><b>Student Certification Unit</b></div>
              <div>Ministry of Education and Child Care</div>
            </v-card>
          </v-menu> and <v-menu
            location="bottom"
          >
            <template #activator="{ props }">
              <a
                v-bind="props"
                @click="toggleMoreInfoTooltip"
              >
                Final
              </a>
            </template>
            <v-card
              style="max-width: 30em;"
              border="sm"
              class="pa-2"
            >
              <div>
                Hello,
              </div><br>
              <div>
                The Final Funding Report for Course Challenges <b>*SCHOOL_YEAR*</b> is now available for your district to download through the Education Data Exchange (EDX). This report lists all students who, according to our records, successfully completed a course challenge during the <b>*SCHOOL_YEAR*</b> school year.
              </div><br>

              <div>For the <b>*SCHOOL_YEAR*</b> school year, each successful course challenge will be funded at a rate of <b>*FUNDING_RATE*</b>. This funding will be disbursed to your district by the ministry’s Financial Management Division following the funding recalculation in December. It will be included in a subsequent bi-monthly electronic funds transfer.</div><br>

              <div>If you have any questions, please contact the Student Certification Unit at: student.certification@gov.bc.ca.</div><br>
              
              <div>Regards,</div>
              <div><b>Student Certification Unit</b></div>
              <div>Ministry of Education and Child Care</div>
            </v-card>
          </v-menu> Phase notification emails to districts.
        </p>
        <p class="mt-3">
          <b>Funding Rate:</b> Current rate, obtained from the Financial Team (e.g., $279.00 - 1/32 of Basic Allocation).
        </p>
        <p class="mt-3 mb-3">
          <b>Deadline for Course Updates:</b> Final date for submissions or corrections (e.g., November 15, YYYY).
        </p>
      </v-col>
    </v-row>
    <v-form
      ref="detailsForm"
      v-model="isFormValid"
    >
      <v-row>
        <v-col cols="4">
          <v-text-field
            id="schoolFill"
            v-model="fundingRate"
            color="#000000"
            density="compact"
            :rules="[rules.required()]"
            variant="outlined"
            tabindex="-1"
            :disabled="challengeReportsSessionStatus === 'FINALIZED'"
            label="Funding Rate Details"
          />
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="mt-2"
      >
        <v-col cols="4">
          <DatePicker
            id="newSchoolOpenDateTextField"
            v-model="finalDateForChanges"
            label="Final Date for Course Updates"
            :rules="[rules.required()]"
            model-type="yyyy/MM/dd"
            density="compact"
            variant="outlined"
            :disabled="challengeReportsSessionStatus === 'FINALIZED'"
            @update:model-value="validateForm"
          />
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="mt-2"
      >
        <v-col
          cols="4"
          class="d-flex justify-end"
        >
          <PrimaryButton
            id="saveButton"
            icon-left
            width="6em"
            text="Save"
            :disabled="!isFormValid || !hasChanges || challengeReportsSessionStatus === 'FINALIZED'"
            @click-action="updateSessionValues"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="9">
          <h3 class="subHeading pb-1">
            Preliminary Phase
          </h3>
          <p>Starting the Preliminary Phase will send the Preliminary Email (using the parameters above) to Enrolment Data Collection administrators, informing them their Funding Report for Course Challenges is now available to review.</p>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="4">
          <PrimaryButton
            id="startPrelimButton"
            icon-left
            icon="mdi-check"
            width="17em"
            text="Start Preliminary Phase"
            :disabled="!hasRequiredFields() || challengeReportsSessionStatus !== 'NT_STARTED'"
            @click-action="updateChallengeReportsPhase"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="9">
          <h3 class="subHeading pb-1">
            Final Phase
          </h3>
          <p>Finalizing the Challenge Report Data will</p>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="9">
          <ul>
            <li>
              Send the Final Email (using the parameters above) to all Enrolment Data Collection administrators informing them their Funding Report for Course Challenges has been finalized.
            </li>
            <li>
              Notify the Financial Management Division (<b>EDUC.FundingAndAllocationUnit@gov.bc.ca</b>) and the Independent Schools Group (<b>faa.is@gov.bc.ca</b>) that the challenge report is available for download.
            </li>
          </ul>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="4">
          <PrimaryButton
            id="startFinalPhaseButton"
            icon-left
            icon="mdi-check"
            width="22em"
            text="Finalize Challenge Report Data"
            :disabled="!hasRequiredFields() || challengeReportsSessionStatus !== 'PRELIM'"
            @click-action="updateChallengeReportsPhase"
          />
        </v-col>
      </v-row>
    </v-form>
  </div>
  <ConfirmationDialog ref="confirmStartOfPrelimStage">
    <template #message>
      <p>Please confirm that you would like to start the preliminary phase for the Challenge Report Data. The action cannot be undone.</p>
    </template>
  </ConfirmationDialog>
  <ConfirmationDialog ref="confirmStartOfFinalStage">
    <template #message>
      <p>Please confirm that you would like to finalize the Challenge Report Data. Once finalized, the action cannot be undone.</p>
    </template>
  </ConfirmationDialog>
</template>
<script>
import {formatDate} from '@/utils/format';
import {mapState} from 'pinia';
import {authStore} from '@/store/modules/auth';
import DatePicker from '@/components/util/DatePicker.vue';
import * as Rules from '@/utils/institute/formRules';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {Year} from '@js-joda/core';
import {setFailureAlert, setSuccessAlert} from '@/components/composable/alertComposable';
import ConfirmationDialog from '@/components/util/ConfirmationDialog.vue';

export default {
  name: 'ChallengeReportsManagement',
  components: {ConfirmationDialog, PrimaryButton, DatePicker},
  data() {
    return {
      isFormValid: false,
      fundingRate: null,
      loading: true,
      schoolYear: null,
      sdcCollections: null,
      challengeReportsSessionStatus: null,
      finalDateForChanges: null,
      activePeriod: null,
      rules: Rules
    };
  },
  computed:{
    ...mapState(authStore, ['userInfo']),
    hasChanges() {
      return this.fundingRate !== this.activePeriod.fundingRate || this.finalDateForChanges !== this.activePeriod.finalDateForChanges;
    },
  },
  mounted() {
    this.getActiveChallengeReportPeriod();
    this.validateForm();
  },
  async created() {
    await this.validateForm();
  },
  methods: {
    async validateForm() {
      const isValid = await this.$refs.detailsForm?.validate();
      this.isFormValid = isValid?.valid;
    },
    formatDate,
    hasRequiredFields(){
      return this.activePeriod && this.activePeriod.fundingRate && this.activePeriod.finalDateForChanges;
    },
    async getActiveChallengeReportPeriod() {
      this.loading = true;
      ApiService.apiAxios.get(`${Routes.challengeReports.ACTIVE_PERIOD}`)
        .then((response) => {
          this.activePeriod = response.data;
          this.challengeReportsSessionStatus = this.activePeriod.challengeReportsSessionStatus;
          this.fundingRate = this.activePeriod.fundingRate;
          this.finalDateForChanges = this.activePeriod.finalDateForChanges;
          this.schoolYear = 'July 1,' + Year.of(this.activePeriod.schoolYear).minusYears(1) + ' to June 30,' + this.activePeriod.schoolYear ;
          this.sdcCollections = 'September ' + Year.of(this.activePeriod.schoolYear).minusYears(1) + ' and February ' + this.activePeriod.schoolYear ;
        })
        .catch((error) => {
          console.error(error);
          this.setFailureAlert(
            error?.response?.data?.message
              ? error?.response?.data?.message
              : 'An error occurred while trying to retrieve the status of Challenge Reports.'
          );
        }).finally(() => {
          this.loading = false;
        });
    },
    updateSessionValues() {
      this.loading = true;
      let payload = {};
      payload.fundingRate = this.fundingRate;
      payload.finalDateForChanges = formatDate(this.finalDateForChanges, 'uuuu/MM/dd', 'uuuu-MM-dd') + 'T00:00:00';

      ApiService.apiAxios.put(`${Routes.challengeReports.ACTIVE_PERIOD}`, payload)
        .then(response => {
          this.activePeriod = response.data;
          this.challengeReportsSessionStatus = this.activePeriod.challengeReportsSessionStatus;
          this.fundingRate = this.activePeriod.fundingRate;
          this.finalDateForChanges = this.activePeriod.finalDateForChanges;
          this.schoolYear = 'July 1,' + Year.of(this.activePeriod.schoolYear).minusYears(1) + ' to June 30,' + this.activePeriod.schoolYear ;
          setSuccessAlert('Success Updating Challenge Report details');
        })
        .catch(error => {
          setFailureAlert(error.response?.data?.message || error.message);
          console.error('Update Failed:', error);
        }).finally(() => {
          this.loading = false;
        });
    },
    async updateChallengeReportsPhase() {
      let confirmation;
      if(this.challengeReportsSessionStatus === 'NT_STARTED'){
        confirmation = await this.$refs.confirmStartOfPrelimStage.open('Confirm Preliminary Phase Update', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Yes', rejectText: 'No'});
      }else{
        confirmation = await this.$refs.confirmStartOfFinalStage.open('Confirm Final Phase Update', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Yes', rejectText: 'No'});
      }

      if (!confirmation) {
        return;
      }

      this.loading = true;

      ApiService.apiAxios.post(`${Routes.challengeReports.START_CHALLENGE_REPORT_PHASE}`)
        .then(() => {
          setSuccessAlert('Success updating challenge report phase, reloading challenge report session...');
          setTimeout(() => {
            this.getActiveChallengeReportPeriod();
          }, 3000);
        })
        .catch(error => {
          setFailureAlert(error.response?.data?.message || error.message);
          console.error('Update Failed:', error);
        });
    },
  }
};
</script>
<style scoped>
.subHeading {
  color: #38598a;
}
.header {
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

li {
  font-size: 14px;
  margin-left: 1em;
  list-style-type: initial;
}
</style>
