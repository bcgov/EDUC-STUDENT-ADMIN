<template>
  <v-container fluid class="fill-height px-0 mb-4">

    <div style="width: 100%" :overlay=false>
      <div class="sticky full-width px-8">
        <v-row align="end" no-gutters justify="end" class="pb-6"
               style="background-color:white;">
          <PrimaryButton id="enter-data-search-action" :secondary="true"
                         class="mx-3" :disabled="false"
                         text="Enter Data & search" @click.native="openSearchDemographicsModal"></PrimaryButton>
          <PrimaryButton id="issue-pen-action" class="mr-2" :disabled="isIssuePenDisabled" text="Issue new PEN"
                         @click.native="issueNewPen()"></PrimaryButton>
        </v-row>
        <v-divider class="subheader-divider"/>
        <v-row>
          <v-col cols="12">
            <v-row dense no-gutters class="mb-2">
              <v-col cols="1"></v-col>
              <v-col cols="1"><Strong>Mincode</Strong></v-col>
              <v-col cols="2"><Strong>Legal Surname</Strong></v-col>
              <v-col cols="2"><strong>Legal Given</strong></v-col>
              <v-col cols="2"><strong>Legal Middle</strong></v-col>
              <v-col cols="1"><Strong>DC</Strong></v-col>
              <v-col cols="1"><Strong>Gen</Strong></v-col>
              <v-col cols="1"><Strong>Birth Date</Strong></v-col>
              <v-col cols="1"></v-col>
            </v-row>
            <v-row dense class="mb-2">
              <v-col cols="1"></v-col>
              <v-col cols="1"><span style="word-wrap: break-word;font-size: smaller">{{
                  formatMinCode(student.mincode)
                }}</span></v-col>
              <v-col cols="2"><span
                  style="word-wrap: break-word;font-size: smaller">{{ student.legalLastName }}</span>
              </v-col>
              <v-col cols="2"><span
                  style="word-wrap: break-word;font-size: smaller">{{ student.legalFirstName }}</span>
              </v-col>
              <v-col cols="2"><span
                  style="word-wrap: break-word;font-size: smaller">{{ student.legalMiddleNames }}</span>
              </v-col>
              <v-col cols="1"><span style="word-wrap: break-word;font-size: smaller">{{
                  student.status
                }}</span></v-col>
              <v-col cols="1"><span style="word-wrap: break-word;font-size: smaller">{{
                  student.genderCode
                }}</span></v-col>
              <v-col cols="2"><span style="word-wrap: break-word;font-size: smaller">{{
                  student.dob
                }}</span></v-col>
            </v-row>
            <v-row dense no-gutters class="mb-2">
              <v-col cols="1"></v-col>
              <v-col cols="1"><Strong>Local ID</Strong></v-col>
              <v-col cols="2"><Strong>Usual Surname</Strong></v-col>
              <v-col cols="2"><strong>Usual Given</strong></v-col>
              <v-col cols="2"><strong>Usual Middle</strong></v-col>
              <v-col cols="2"><Strong>Postal Code</Strong></v-col>
              <v-col cols="1"><Strong>Grade</Strong></v-col>
              <v-col cols="1"></v-col>
            </v-row>
            <v-row dense>
              <v-col cols="1"></v-col>
              <v-col cols="1"><span style="word-wrap: break-word;font-size: smaller">{{
                  student.localID
                }}</span></v-col>
              <v-col cols="2"><span
                  style="word-wrap: break-word;font-size: smaller">{{ student.usualLastName }}</span>
              </v-col>
              <v-col cols="2"><span
                  style="word-wrap: break-word;font-size: smaller">{{ student.usualFirstName }}</span>
              </v-col>
              <v-col cols="2"><span
                  style="word-wrap: break-word;font-size: smaller">{{ student.usualMiddleNames }}</span>
              </v-col>
              <v-col cols="2"><span style="word-wrap: break-word;font-size: smaller">{{
                  student.postalCode
                }}</span></v-col>
              <v-col cols="2"><span style="word-wrap: break-word;font-size: smaller">{{
                  student.gradeCode
                }}</span></v-col>
            </v-row>
          </v-col>
        </v-row>

        <SearchDemographicModal @closeDialog="closeDialog" @updateStudent="updateStudent" :dialog="dialog"
                                :is-field-read-only="isFieldReadOnly"
                                :student-data="studentCopy"></SearchDemographicModal>
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
        <v-row v-if="showPossibleMatch">
          <PenMatchResultsTable :student="student" :is-comparison-required="false"
                                :is-refresh-required="false" :possible-match="possibleMatches"></PenMatchResultsTable>
        </v-row>
      </div>
    </div>
  </v-container>
</template>

<script>
import alterMixin from '../mixins/alterMixin';
import PrimaryButton from './util/PrimaryButton';
import SearchDemographicModal from "@/components/common/SearchDemographicModal";
import PenMatchResultsTable from "@/components/common/PenMatchResultsTable";
import {mapGetters} from "vuex";
import ApiService from "../common/apiService";
import {Routes} from "@/utils/constants";
import {formatDob, formatMinCode} from '@/utils/format';

export default {
  name: 'CreateNewPEN',
  components: {
    PenMatchResultsTable,
    PrimaryButton,
    SearchDemographicModal
  },
  mixins: [alterMixin],
  data() {
    return {
      loading: true,
      dialog: false,
      isLoadingMatches: false,
      showPossibleMatch: false,
      possibleMatches: [],
      isIssuePenDisabled: true,
      student: {
        localID: '00000000'
      },
      studentCopy: {}
    };
  },
  mounted() {
    this.loading = false;
    this.isLoadingMatches = false;
    this.showPossibleMatch = false;
    this.dialog = false;
    this.$store.dispatch('student/getCodes');
  },
  computed: {
    ...mapGetters('student', ['genders', 'demogCodeObjects', 'statusCodeObjects', 'gradeCodeObjects']),
  },
  methods: {
    openSearchDemographicsModal() {
      this.dialog = true;
      this.isIssuePenDisabled = true;
    },
    closeDialog() {
      this.dialog = false;
    },
    isFieldReadOnly() {
      return false;
    },
    updateStudent(studentModified) {
      Object.assign(this.student, studentModified);
      this.runPenMatch();
    },
    formatMinCode(mincode) {
      return formatMinCode(mincode);
    },
    async issueNewPen() {
      this.isLoadingMatches = true;
      const studentWithAssociations = {
        ...this.student,
      }
      const studentTwins = this.possibleMatches.map(element => ({
        twinStudentID: element.studentID,
        studentTwinReasonCode: 'PENCREATE'
      }));
      if (studentTwins.length > 0) {
        studentWithAssociations.studentTwinAssociations = studentTwins;
      }
      ApiService.apiAxios.post(Routes.student.ROOT_ENDPOINT, studentWithAssociations)
          .then((result) => {
            this.$router.push(`/student/${result.data.studentID}`);
          })
          .catch((error) => {

          })
          .finally(() => {

          });


    },
    async runPenMatch() {
      this.isLoadingMatches = true;
      this.showPossibleMatch = false;
      const penMatch = {
        surname: this.student.legalLastName,
        givenName: this.student.legalFirstName,
        middleName: this.student.legalMiddleNames,
        usualSurname: this.student.usualLastName,
        usualGiven: this.student.usualFirstName,
        usualMiddleName: this.student.usualMiddleNames,
        dob: this.student.dob,//formatDob(this.student.dob,'uuuu-MM-dd','uuuu/MM/dd'),
        sex: this.student.genderCode,
        enrolledGradeCode: this.student.gradeCode,
        mincode: this.student.mincode,
        localID: this.student.localID,
        postal: this.student.postalCode
      }
      ApiService.apiAxios.post('api/penMatches/', penMatch)
          .then(response => {
            if (response.data && response.data.matchingRecords && response.data.matchingRecords.length > 0) {
              const studentIDs = response.data.matchingRecords.map((matchingRecord) => {
                return matchingRecord.studentID
              }).join();
              const params = {
                params: {
                  studentIDs: studentIDs
                }
              };
              ApiService.apiAxios.get(Routes.student.GET_ALL_STUDENTS_BY_IDS, params)
                  .then(result => {
                    this.isIssuePenDisabled = false;
                    this.showPossibleMatch = true;
                    this.possibleMatches = result.data;
                  })
                  .catch(error => {
                    console.log(error);
                    this.requestFailed = true;
                  })
                  .finally(() => {
                    this.isLoadingMatches = false;
                  })
            } else {
              this.isIssuePenDisabled = false;
              this.showPossibleMatch = true;
              this.possibleMatches = [];
              this.isLoadingMatches = false;
            }
          })
          .catch(error => {
            console.log(error);
            this.requestFailed = true;
            this.isLoadingMatches = false;
          });
    }
  }
};
</script>
<style scoped>

.subheader-divider {
  border-width: 0.50ex 0 0 0;
}

.full-width {
  margin-left: -32px;
  margin-right: -32px;
}

.sticky {
  position: sticky;
  top: 0;
  z-index: 6;
  background-color: white;
}

pre {
  font-family: inherit;
  font-size: inherit;
}
</style>
