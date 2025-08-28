<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <h3>Individual Student Reports</h3>
      </v-col>
    </v-row>
    <v-card
      class="mt-2"
      width="30em"
      border="sm"
    >
      <v-card-text
        style="color: gray;font-size: small"
        class="mt-n3"
      >
        Find assessment results for individual students using their PEN.
      </v-card-text>
      <v-form
        id="studentPENForm"
        v-model="studentPENIsValid"
      >
        <v-row class="pl-3">
          <v-col cols="8">
            <v-text-field
              id="studentPENField"
              ref="studentPENField"
              v-model="studentPENTranscript"
              placeholder="Enter PEN"
              :rules="penRules"
              variant="underlined"
            />
          </v-col>
          <v-col
            cols="4"
            class="mt-3"
          >
            <v-btn
              color="primary"
              :disabled="!studentPENIsValid"
              @click="searchStudentForGivenPEN()"
            >
              Search
            </v-btn>
          </v-col>
        </v-row>
        <div v-if="showPENSearchResultArea">
          <v-row class="pl-3 pb-3">
            <v-col
              style="font-weight: bold"
              cols="3"
            >
              Name:
            </v-col>
            <v-col cols="9">
              {{ studentForSearch.fullName }}
            </v-col>
            <v-col
              style="font-weight: bold"
              cols="3"
            >
              Local ID:
            </v-col>
            <v-col cols="9">
              {{ studentForSearch.localID }}
            </v-col>
            <v-col
              style="font-weight: bold"
              cols="3"
            >
              Birthdate:
            </v-col>
            <v-col cols="9">
              {{ studentForSearch.dob }}
            </v-col>
            <v-col
              style="font-weight: bold"
              cols="3"
            >
              Gender:
            </v-col>
            <v-col cols="9">
              {{ studentForSearch.gender }}
            </v-col>
            <v-col
              cols="12"
              class="mt-n2"
            >
              <DownloadLink
                label="Student Report"
                :download-action="downloadStudentReport"
              />
            </v-col>
          </v-row>
        </div>
      </v-form>
    </v-card>

    <v-row class="mt-2">
      <v-col>
        <h3>Provincial Level Session Reports</h3>
      </v-col>
    </v-row>
    <v-row
      class="mt-n6"
    >
      <v-col>
        <span
          style="color: gray;font-size: small"
        >
          Select a session below to find the reports available for download.
        </span>
      </v-col>
    </v-row>

    <v-row class="mt-n2">
      <v-col cols="4">
        <v-select
          id="selectedSession"
          v-model="selectedSessionID"
          variant="underlined"
          :items="sessions"
          label="Session"
          item-title="title"
          item-value="value"
          :rules="[rules.required()]"
          :clearable="true"
        />
      </v-col>
    </v-row>
    <v-row>
      <div :class="{ 'disabled-section': disableProvincialCondition }">
        <v-row
          no-gutters
          class="d-flex"
        >
          <v-card
            class="mt-2"
            width="4S0em"
            border="sm"
            style="border: 1px solid black;border-radius: 10px;"
          >
            <v-card-title style="font-size: medium;">
              <v-row>
                <v-col class="d-flex justify-start">
                  Other Reports
                </v-col>
              </v-row>
            </v-card-title>
            <v-row class="pl-3 pb-3">
              <v-col
                cols="12"
              >
                <DownloadLink
                  label="Yukon Assessment Counts for Invoice.csv"
                  :download-action="() => downloadYukonCountsReport()"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-row>
      </div>
      <div class="pl-2">
        <v-row
          no-gutters
          class="d-flex"
        >
          <v-card
            class="mt-2"
            width="40em"
            border="sm"
            style="border: 1px solid black;border-radius: 10px;"
          >
            <v-card-title style="font-size: medium;">
              <v-row>
                <v-col class="d-flex justify-start">
                  Data for Item Analysis
                </v-col>
              </v-row>
            </v-card-title>
            <v-row class="pl-3 pb-3">
              <v-col
                cols="6"
                class="d-flex flex-column"
              >
                <DownloadLink
                  label="NME10 for Item Analysis.csv"
                  :download-action="() => downloadReport('NME10')"
                />
                <DownloadLink
                  label="NMF10 for Item Analysis.csv"
                  :download-action="() => downloadReport('NMF10')"
                />
                <DownloadLink
                  label="LTE10 for Item Analysis.csv"
                  :download-action="() => downloadReport('LTE10')"
                />
                <DownloadLink
                  label="LTE12 for Item Analysis.csv"
                  :download-action="() => downloadReport('LTE12')"
                />
              </v-col>
              <v-col
                cols="6"
                class="d-flex flex-column"
              >
                <DownloadLink
                  label="LTP10 for Item Analysis.csv"
                  :download-action="() => downloadReport('LTP10')"
                />
                <DownloadLink
                  label="LTP12 for Item Analysis.csv"
                  :download-action="() => downloadReport('LTP12')"
                />
                <DownloadLink
                  label="LTF12 for Item Analysis.csv"
                  :download-action="() => downloadReport('LTF12')"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-row>
      </div>
    </v-row>
  </v-container>
</template>

<script>
import { isValidPEN } from '../../../utils/validation';
import alertMixin from '@/mixins/alertMixin';
import { mapState } from 'pinia';
import {appStore} from '@/store/modules/app';
import DownloadLink from '../../common/DownloadLink.vue';
import ApiService from '@/common/apiService';
import { Routes } from '../../../utils/constants';
import { sortBy } from 'lodash';
import * as Rules from '../../../utils/institute/formRules';

export default {
  name: 'AssessmentReports',
  components: { DownloadLink },
  mixins: [alertMixin],
  props: {
    schoolYearSessions: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      isLoading: false,
      showPENSearchResultArea: false,
      studentForSearch: {},
      studentPENTranscript: null,
      studentPENIsValid: false,
      penRules: [v => !!v || 'Required', v => (!v || isValidPEN(v) || 'Invalid PEN')],
      isSearchingStudent: false,
      rules: Rules,
      schoolNameNumberFilter: null,
      schoolSearchNames: [],
      selectedSessionID: null,
      selectedSchoolLevelSessionID: null,
      sessions: [],
    };
  },
  watch: {
    schoolYearSessions: {
      handler(value) {
        if(value.length > 0) {
          this.setupAssessmentSessions();
        }
      },
      immediate: true
    }
  },
  computed: {
    ...mapState(appStore, ['schoolMap']),
    disableProvincialCondition() {
      return !this.selectedSessionID;
    },
    schoolIdentifierForReports() {
      return this.schoolNameNumberFilter;
    }
  },
  async created() {
    this.setupSchoolLists();
  },
  methods: {
    setupAssessmentSessions() {
      this.sessions = [];
      this.schoolYearSessions.forEach(session => {
        this.sessions.push({
          title: session.courseMonth + '/' + session.courseYear,
          value: session.sessionID,
        });
      });
      this.selectedSessionID = this.sessions[0].value;
    },
    setupSchoolLists() {
      this.schoolSearchNames = [];
      this.schoolMap?.forEach((school) => {
        let schoolCodeName = school.schoolName + ' - ' + school.mincode;
        this.schoolSearchNames.push({schoolCodeName: schoolCodeName, schoolCodeValue: school.schoolID});
      });
      this.schoolSearchNames = sortBy(this.schoolSearchNames, ['schoolCodeName']);
    },
    searchStudentForGivenPEN() {
      this.isSearchingStudent = true;
      ApiService.apiAxios.get(Routes.student.SEARCH_BY_PEN_URL, {
        params: {
          pen: this.studentPENTranscript
        }
      })
        .then(response => {
          this.studentForSearch = {
            pen: response.data.pen,
            studentID: response.data.studentID,
            fullName: response?.data?.legalFirstName + ' ' + (response?.data?.legalMiddleNames ?? '') + ' ' + response?.data?.legalLastName,
            localID: response.data.localID,
            gender: response.data.genderCode,
            dob: response.data.dob
          };
          this.showPENSearchResultArea = true;
          this.isSearchingStudent = false;
        })
        .catch(error => {
          console.log(error);
          if (error?.response?.data?.message) {
            this.setFailureAlert(error?.response?.data?.message);
          } else {
            this.setFailureAlert('PEN must be a valid.');
          }
        }).finally(() => {
          this.isSearchingStudent = false;
        });
    },
    async downloadStudentReport() {
      this.isLoading = true;
      try {
        const url = `${Routes.assessments.BASE_REPORTS_URL}/student/${this.studentForSearch.studentID}/ISR/download`;
        window.open(url);
      } catch (error) {
        console.error(error);
        this.setFailureAlert(
          error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to retrieve the student\'s report.'
        );
      } finally {
        this.isLoading = false;
      }
    },
    async downloadYukonCountsReport() {
      
    },
    async downloadReport(type) {
      try {
        let selection = this.schoolYearSessions.filter(session => session.sessionID === this.selectedSessionID);
        const url = `${Routes.assessments.BASE_URL}/${this.selectedSessionID}/report/${type}/download?sessionCode=${selection[0].courseYear}${selection[0].courseMonth}`;
        window.open(url);
      } catch (error) {
        console.error(error);
        this.setFailureAlert(
          error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to retrieve report.'
        );
      }
    },
    async downloadXamFile() {
      this.isLoading = true;
      try {
        const url = `${Routes.assessments.BASE_URL}/${this.selectedSchoolLevelSessionID}/${this.schoolIdentifierForReports}/xam/download`;
        window.open(url);
      } catch (error) {
        console.error(error);
        this.setFailureAlert(
          error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to retrieve your school\'s report.'
        );
      } finally {
        this.isLoading = false;
      }
    },
    async downloadGradProjections(){

    },
    async downloadSummaryDOAR() {

    }
  },
};
</script>

<style scoped>

h3 {
  color: #38598a;
}

button {
  color: #1976d2;
}

v-text-field {
  width: 4em;
}

ul {
  list-style-type: none;
  padding-top: 1em;
  padding-bottom: 2em;
}

li {
  padding-top: 1em;
}

p {
  padding-top: 1em;
  font-style: italic;
}

i {
  font-size: 1.25em;
}

.disabled-section {
  opacity: 0.5;
  pointer-events: none;
}

</style>
