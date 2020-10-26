<template>
  <v-container fluid class="fill-height px-0 mb-4">

    <div style="width: 100%;" :overlay=false>
      <div class="sticky full-width px-8">
        <v-row>
          <v-col cols="12">
            <v-row>
              <AlertMessage v-model="alert" :alertMessage="alertMessage" :alertType="alertType"
                            :timeout-ms="5000"></AlertMessage>
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
                <v-row dense no-gutters>
                  <v-col cols="1" class="left-margin-first-column">Mincode</v-col>
                  <v-col cols="2" class="left-margin-second-column">Legal Surname</v-col>
                  <v-col cols="2" class="left-margin-third-column">Legal Given</v-col>
                  <v-col cols="2" class="left-margin-fourth-column">Legal Middle</v-col>
                  <v-col cols="2" class="left-margin-fifth-column">DC &nbsp; &nbsp; &nbsp; Gen</v-col>
                  <v-col cols="1" class="left-margin-sixth-column">Birth Date</v-col>
                  <v-col cols="1"></v-col>
                </v-row>
                <v-row dense class="mb-2">
                  <v-col cols="1" class="left-margin-first-column"><span
                      :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.MINCODE)?'font-weight-bold':'','display-demog-data','display-demog-data']"
                  >{{
                      formatMinCode(student.mincode)
                    }}</span></v-col>
                  <v-col cols="2" class="left-margin-second-column"><span
                      :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.LEGAL_LAST_NAME)?'font-weight-bold':'','display-demog-data']"
                  >{{ student.legalLastName }}</span>
                  </v-col>
                  <v-col cols="2" class="left-margin-third-column"><span
                      :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.LEGAL_FIRST_NAME)?'font-weight-bold':'','display-demog-data']"
                  >{{ student.legalFirstName }}</span>
                  </v-col>
                  <v-col cols="2" class="left-margin-fourth-column"><span
                      :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES)?'font-weight-bold':'','display-demog-data']"
                  >{{ student.legalMiddleNames }}</span>
                  </v-col>
                  <v-col cols="2" class="left-margin-fifth-column"><span
                      :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.STATUS_CODE)?'font-weight-bold':'','display-demog-data']"
                  >{{
                      student.status ? student.status : ''
                    }}</span> <span v-if="!student.status">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span>
                    <span v-else>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </span>
                    <span
                        :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.GENDER_CODE)?'font-weight-bold':'','display-demog-data']"
                    >{{
                        student.genderCode
                      }}</span>
                  </v-col>
                  <v-col cols="1" class="left-margin-sixth-column"><span
                      :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.DOB)?'font-weight-bold':'','display-demog-data']"
                  >{{
                      student.dob
                    }}</span></v-col>
                  <v-col cols="1"></v-col>
                </v-row>
                <v-row dense no-gutters class="mb-2">
                  <v-col cols="1" class="left-margin-first-column">Local ID</v-col>
                  <v-col cols="2" class="left-margin-second-column">Usual Surname</v-col>
                  <v-col cols="2" class="left-margin-third-column">Usual Given</v-col>
                  <v-col cols="2" class="left-margin-fourth-column">Usual Middle</v-col>
                  <v-col cols="2" class="left-margin-fifth-column">Postal Code</v-col>
                  <v-col cols="1" class="left-margin-sixth-column">Grade</v-col>
                  <v-col cols="1"></v-col>
                </v-row>
                <v-row dense>
                  <v-col cols="1" class="left-margin-first-column"><span
                      :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.LOCAL_ID)?'font-weight-bold':'','display-demog-data']">{{
                      student.localID
                    }}</span></v-col>
                  <v-col cols="2" class="left-margin-second-column"><span
                      :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME)?'font-weight-bold':'','display-demog-data']"
                  >{{ student.usualLastName }}</span>
                  </v-col>
                  <v-col cols="2" class="left-margin-third-column"><span
                      :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME)?'font-weight-bold':'','display-demog-data']"
                  >{{ student.usualFirstName }}</span>
                  </v-col>
                  <v-col cols="2" class="left-margin-fourth-column"><span
                      :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES)?'font-weight-bold':'','display-demog-data']"
                  >{{ student.usualMiddleNames }}</span>
                  </v-col>
                  <v-col cols="2" class="left-margin-fifth-column"><span
                      :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.POSTAL_CODE)?'font-weight-bold':'','display-demog-data']"
                  >{{
                      student.postalCode
                    }}</span></v-col>
                  <v-col cols="1" class="left-margin-sixth-column"><span
                      :class="[demogValueMatched(STUDENT_DETAILS_FIELDS.GRADE_CODE)?'font-weight-bold':'','display-demog-data']"
                  >{{
                      student.gradeCode
                    }}</span></v-col>
                  <v-col cols="1"></v-col>
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
                                    :is-refresh-required="false"
                                    :possible-match="possibleMatches"></PenMatchResultsTable>
            </v-row>
          </v-col>
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
    formatMinCode,
    demogValueMatched(fieldName) {
      if (fieldName === STUDENT_DETAILS_FIELDS.DOB) {
        const dob = this.student[fieldName]?.replace(/\D/g, '');
        return this.possibleMatches.filter(el => el[fieldName]?.replace(/\D/g, '') === dob).length > 0;
      } else if (fieldName === STUDENT_DETAILS_FIELDS.POSTAL_CODE) {
        const postalCode = this.student[fieldName]?.replace(' ', '');
        return this.possibleMatches.filter(el => el[fieldName]?.replace(' ', '') === postalCode).length > 0;
      }
      return this.possibleMatches.filter(el => el[fieldName] === this.student[fieldName]).length > 0;
    },
    async issueNewPen() {
      this.isLoadingMatches = true;
      const studentWithAssociations = {
        student: {
          ...this.student,
        }
      };
      // API expects DOB to be with - not /
      studentWithAssociations.student.dob = formatDob(this.student.dob, 'uuuu/MM/dd', 'uuuu-MM-dd');
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
      const penMatch = {
        surname: this.student.legalLastName,
        givenName: this.student.legalFirstName,
        middleName: this.student.legalMiddleNames,
        usualSurname: this.student.usualLastName,
        usualGiven: this.student.usualFirstName,
        usualMiddleName: this.student.usualMiddleNames,
        dob: this.student.dob,
        sex: this.student.genderCode,
        enrolledGradeCode: this.student.gradeCode,
        mincode: this.student.mincode,
        postal: this.student.postalCode
      };
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
            console.log(error.message);
            if (error.message && error.message.includes('401')) {
              this.$router.push('/session-expired');
            }
            this.requestFailed = true;
            this.isLoadingMatches = false;
            this.setFailureAlert('PEN Match API call failed, please try again.');
          });
    }
  }
};
</script>
<style scoped>

.display-demog-data {
  word-wrap: break-word;
  font-size: 0.875rem;
}

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


@media screen and (max-width: 1300px) {
  .left-margin-first-column {
    margin-left: 5em;
  }

  .left-margin-second-column {
    margin-left: 1.3em;
  }

  .left-margin-third-column {
    margin-left: 1em;
  }

  .left-margin-fourth-column {
    margin-left: 1.4em;
  }

  .left-margin-fifth-column {
    margin-left: -2em;
  }

  .left-margin-sixth-column {
    margin-left: -2.8em;
  }

}

@media screen and (min-width: 1301px) {
  .left-margin-first-column {
    margin-left: 5.2em;
  }

  .left-margin-second-column {
    margin-left: 1.8em;
  }

  .left-margin-third-column {
    margin-left: 1.5em;
  }

  .left-margin-fourth-column {
    margin-left: 1.8em;
  }

  .left-margin-fifth-column {
    margin-left: -1.6em;
  }

  .left-margin-sixth-column {
    margin-left: -5em;
  }
}

pre {
  font-family: inherit;
  font-size: inherit;
}
</style>
