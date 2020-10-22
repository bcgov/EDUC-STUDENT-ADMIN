<template>
  <v-container fluid class="fill-height px-0 mb-4">

    <div style="width: 100%" :overlay=false>
      <div class="sticky full-width px-8">
        <v-row>
          <AlertMessage v-model="alert" :alertMessage="alertMessage" :alertType="alertType"></AlertMessage>
        </v-row>
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
              <v-col cols="1">Mincode</v-col>
              <v-col cols="2">Legal Surname</v-col>
              <v-col cols="2">Legal Given</v-col>
              <v-col cols="2">Legal Middle</v-col>
              <v-col cols="1">DC</v-col>
              <v-col cols="1">Gen</v-col>
              <v-col cols="1">Birth Date</v-col>
              <v-col cols="1"></v-col>
            </v-row>
            <v-row dense class="mb-2">
              <v-col cols="1"></v-col>
              <v-col cols="1"><span :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.MINCODE)?'font-weight-bold':'']"
                                    style="word-wrap: break-word;font-size: medium">{{
                  formatMinCode(student.mincode)
                }}</span></v-col>
              <v-col cols="2"><span
                  :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME)?'font-weight-bold':'']"
                  style="word-wrap: break-word;font-size: medium">{{ student.legalLastName }}</span>
              </v-col>
              <v-col cols="2"><span
                  :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME)?'font-weight-bold':'']"
                  style="word-wrap: break-word;font-size: medium">{{ student.legalFirstName }}</span>
              </v-col>
              <v-col cols="2"><span
                  :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES)?'font-weight-bold':'']"
                  style="word-wrap: break-word;font-size: medium">{{ student.legalMiddleNames }}</span>
              </v-col>
              <v-col cols="1"><span
                  :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.STATUS_CODE)?'font-weight-bold':'']"
                  style="word-wrap: break-word;font-size: medium">{{
                  student.status
                }}</span></v-col>
              <v-col cols="1"><span
                  :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.GENDER_CODE)?'font-weight-bold':'']"
                  style="word-wrap: break-word;font-size: medium">{{
                  student.genderCode
                }}</span></v-col>
              <v-col cols="2"><span :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.DOB)?'font-weight-bold':'']"
                                    style="word-wrap: break-word;font-size: medium">{{
                  student.dob
                }}</span></v-col>
            </v-row>
            <v-row dense no-gutters class="mb-2">
              <v-col cols="1"></v-col>
              <v-col cols="1">Local ID</v-col>
              <v-col cols="2">Usual Surname</v-col>
              <v-col cols="2">Usual Given</v-col>
              <v-col cols="2">Usual Middle</v-col>
              <v-col cols="2">Postal Code</v-col>
              <v-col cols="1">Grade</v-col>
              <v-col cols="1"></v-col>
            </v-row>
            <v-row dense>
              <v-col cols="1"></v-col>
              <v-col cols="1"><span style="word-wrap: break-word;font-size: medium">{{
                  student.localID
                }}</span></v-col>
              <v-col cols="2"><span
                  :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME)?'font-weight-bold':'']"
                  style="word-wrap: break-word;font-size: medium">{{ student.usualLastName }}</span>
              </v-col>
              <v-col cols="2"><span
                  :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME)?'font-weight-bold':'']"
                  style="word-wrap: break-word;font-size: medium">{{ student.usualFirstName }}</span>
              </v-col>
              <v-col cols="2"><span
                  :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES)?'font-weight-bold':'']"
                  style="word-wrap: break-word;font-size: medium">{{ student.usualMiddleNames }}</span>
              </v-col>
              <v-col cols="2"><span
                  :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.POSTAL_CODE)?'font-weight-bold':'']"
                  style="word-wrap: break-word;font-size: medium">{{
                  student.postalCode
                }}</span></v-col>
              <v-col cols="2"><span
                  :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.GRADE_CODE)?'font-weight-bold':'']"
                  style="word-wrap: break-word;font-size: medium">{{
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
                                :is-pen-link="false"
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
import {STUDENT_DETAILS_FIELDS} from '@/utils/constants';
import AlertMessage from '../components/util/AlertMessage';

export default {
  name: 'CreateNewPEN',
  components: {
    PenMatchResultsTable,
    PrimaryButton,
    SearchDemographicModal,
    AlertMessage
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
      STUDENT_DETAILS_FIELDS: STUDENT_DETAILS_FIELDS,
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
    demogValueMatched(fieldName) {
      if(fieldName === STUDENT_DETAILS_FIELDS.DOB){
        const dob = this.student[fieldName]?.replace(/\D/g,'');
        return this.possibleMatches.filter(el => el[fieldName]?.replace(/\D/g,'') === dob).length > 0;
      }
      return this.possibleMatches.filter(el => el[fieldName] === this.student[fieldName]).length > 0;
    },
    async issueNewPen() {
      this.isLoadingMatches = true;
      const studentWithAssociations = {
        student:{
          ...this.student,
        }
      }
      // API expects DOB to be with - not /
      studentWithAssociations.student.dob = formatDob(this.student.dob, 'uuuu/MM/dd','uuuu-MM-dd');
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
        //localID: this.student.localID,
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
