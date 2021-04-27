<template>
  <v-container fluid class="fill-height pa-0 mb-4">

    <div style="width: 100%;" :overlay=false>
      <div class="full-width">
        <v-row class="pt-0">
          <v-col cols="12 pt-0">
            <StudentDetailsInfoPanel
                    :student.sync="student"
                    key="info-panel"
                    :runPenMatch="runPenMatch"
                    :isCreatePen="true"
                    @validationRun="checkValidationResults">
              <template v-slot:headerPanel="{ openSearchDemographicsModal }">
                <v-row align="end" no-gutters justify="end" class="pb-6"
                       style="background-color:white;">

                  <PrimaryButton id="enter-data-search-action" :secondary="true"
                                 class="mx-3" :disabled="false"
                                 text="Enter Data & search" @click.native="[openSearchDemographicsModal(),isIssuePenDisabled = true]"></PrimaryButton>
                  <PrimaryButton id="issue-pen-action" class="mr-2" :disabled="isIssuePenDisabled" text="Issue new PEN"
                                 @click.native="issueNewPen()"></PrimaryButton>
                </v-row>
              </template>/
            </StudentDetailsInfoPanel>
            <v-row v-if="isLoadingMatches">
              <v-container fluid class="full-height">
                <article id="match-results-container" class="top-banner full-height">
                  <v-row align="center" justify="center">
                    <v-progress-circular
                        :size="70"
                        :width="7"
                        color="primary"
                        indeterminate
                    ></v-progress-circular>
                  </v-row>
                </article>
              </v-container>
            </v-row>
            <v-row v-if="showPossibleMatch && !hasValidationIssues" class="full-width">
              <PenMatchResultsTable :student="student" :is-comparison-required="false"
                                    :is-pen-link="false"
                                    :is-refresh-required="false"
                                    :is-match-un-match="false"
                                    :demogValidationResult="demogValidationResult"
                                    :possible-match="possibleMatches"></PenMatchResultsTable>
            </v-row>
          </v-col>
        </v-row>
      </div>
    </div>
  </v-container>
</template>

<script>
import alertMixin from '../mixins/alertMixin';
import PrimaryButton from './util/PrimaryButton';
import PenMatchResultsTable from '@/components/common/PenMatchResultsTable';
import ApiService from '../common/apiService';
import {Routes} from '@/utils/constants';
import { constructPenMatchObjectFromStudent, getPossibleMatches } from '@/utils/common';
import StudentDetailsInfoPanel from './common/StudentDetailsInfoPanel';

export default {
  name: 'CreateNewPEN',
  components: {
    StudentDetailsInfoPanel,
    PenMatchResultsTable,
    PrimaryButton
  },
  mixins: [alertMixin],
  data() {
    return {
      isLoadingMatches: false,
      showPossibleMatch: false,
      possibleMatches: [],
      isIssuePenDisabled: true,
      student: {},
      hasValidationIssues: false,
      demogValidationResult: []
    };
  },
  mounted() {
    this.isLoadingMatches = false;
    this.showPossibleMatch = false;
    this.$store.dispatch('penRequestBatch/getCodes');
  },
  methods: {
    async issueNewPen() {
      this.isLoadingMatches = true;
      const studentWithAssociations = {
        student: {
          ...this.student,
        }
      };
      // API expects DOB to be with - not /
      studentWithAssociations.student.dob = this.student.dob;
      studentWithAssociations.student.sexCode = this.student.genderCode; // sex code is mandatory in API.
      studentWithAssociations.student.emailVerified = 'N';
      studentWithAssociations.student.postalCode = this.student.postalCode ? this.student.postalCode.replaceAll(' ', '') : null;

      const studentTwins = this.possibleMatches.map(element => ({
        twinStudentID: element.studentID,
        studentTwinReasonCode: 'PENCREATE'
      }));
      if (studentTwins.length > 0) {
        studentWithAssociations.student.studentTwinAssociations = studentTwins;
      }
      ApiService.apiAxios.post(Routes.student.ROOT_ENDPOINT, studentWithAssociations)
        .then((result) => {
          this.$router.push(`/student/${result.data.studentID}`);
        })
        .catch((error) => {
          console.log(error);
          this.setFailureAlert('PEN could not be issued, please try again.');
        })
        .finally(() => {
          this.isLoadingMatches = false;
        });


    },
    async runPenMatch() {
      this.isLoadingMatches = true;
      this.showPossibleMatch = false;
      this.possibleMatches = [];
      try {
        const result = await getPossibleMatches(constructPenMatchObjectFromStudent(this.student));
        this.isIssuePenDisabled = false;
        this.showPossibleMatch = true;
        this.possibleMatches = result.data;
      } catch (error) {
        console.log(error);
        this.setFailureAlert('PEN Match API call failed, please try again.');
      } finally {
        this.isLoadingMatches = false;
      }
    },
    checkValidationResults(value) {
      this.hasValidationIssues = value.hasValidationError;
      this.demogValidationResult = value.validationIssues;
    }
  },
};
</script>
<style scoped>

.full-width {
  margin-left: -32px;
  margin-right: -32px;
}

pre {
  font-family: inherit;
  font-size: inherit;
}
</style>
