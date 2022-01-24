  <template>
  <v-container fluid class="fill-height pa-0 mb-4">

    <div style="width: 100%;" :overlay=false>
      <div class="full-width">
        <v-row class="pt-0">
          <v-col cols="12 pt-0">
            <v-progress-linear
                absolute
                top
                indeterminate
                color="blue"
                :active="loading"
            ></v-progress-linear>
            <div v-if="!loading && nomRollStudent" style="width: 100%;" :overlay=false>

              <StudentDetailsInfoPanel
                  :student.sync="modalStudent"
                  key="info-panel"
                  :runPenMatch="runPenMatch"
                  :studentDetailsCopy="nomRollStudentCopy"
                  :validationErrorFields="validationErrorFields"
                  :hiddenSearchFields="hiddenSearchFields"
                  :isFixableOrErrorStatus="isFixableOrErrorStatus"
                  :runDemogValidation="runDemogValidation"
              >                  
                <template v-slot:headerPanel="{ openSearchDemographicsModal }">
                  <v-row no-gutters
                         class="list-actions pt-4 pb-4 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3 d-flex align-center"
                         style="background-color:white;">
                    <span class="mr-4 batch-title">
                      <strong>{{ seqNumber }} of {{
                          totalNumber
                        }} filtered</strong>
                    </span>
                    <NomRollStudentStatusChip
                        :statusCode="nomRollStudent.status"
                    ></NomRollStudentStatusChip>
                    <v-spacer></v-spacer>
                    <PrimaryButton id="ignore-item-action" class="mx-2"
                                   :disabled="disableActionButtons"
                                   text="Ignore Record"
                                   @click.native="ignoreStudent"></PrimaryButton>
                    <PrimaryButton id="modify-search-action" :secondary="true" class="mx-2"
                                   :disabled="disableActionButtons" text="Modify search"
                                   @click.native="openSearchDemographicsModal"></PrimaryButton>
                  </v-row>
                  <v-row no-gutters class="py-2 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3" style="background-color:white;">
                    <span>
                      <strong>{{ mincode }} {{ nomRollStudent.schoolName }}</strong>
                    </span>
                    <v-spacer></v-spacer>
                    <span>
                      <span class="mr-3">Assigned PEN</span>
                      <span
                          :class="{'pen-placeholder': !nomRollStudent.assignedPEN}"><strong>{{
                          formatPen(nomRollStudent.assignedPEN)
                        }}</strong></span>
                    </span>
                  </v-row>
                </template>
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
              <v-row class="full-width" v-if="showPossibleMatch && !hasValidationIssues">
                <PenMatchResultsTable :student="modalStudent" :is-comparison-required="true"
                                      :is-pen-link="true"
                                      :is-refresh-required="true"
                                      :is-match-un-match="true"
                                      :disableMatchUnmatch="disableMatchUnmatch"
                                      :disableRefresh="disableRefresh"
                                      :demogValidationResult="demogValidationResult"
                                      :title="penMatchResultTitle"
                                      :showMatchButton="showMatchButton"
                                      :showUnmatchButton="showUnmatchButton"
                                      :grayoutPossibleMatches="grayoutPossibleMatches"
                                      @match-unmatch-student="matchUnmatchStudentToNomRollStudent"
                                      @refresh-match-results="refreshMatchResults"
                                      :possible-match="possibleMatches"></PenMatchResultsTable>
              </v-row>
            </div>
          </v-col>
        </v-row>
      </div>
      <ConfirmationDialog ref="confirmationDialog">
        <template v-slot:message>
          <v-col class="pt-0">
            <v-row class="mb-3">There is <strong>&nbsp;{{ demogValidationResult.length }}&nbsp;</strong> questionable
              {{ `error${demogValidationResult.length > 1 ? 's' : ''}` }} with this PEN request:
            </v-row>
            <v-row v-for="warning in demogValidationResult" :key="warning.description">
              <v-col class="pb-0">
                <v-row>
                  <strong>{{ warning.uiFieldName }}</strong>
                  <v-icon small color="#FCBA19" class="ml-2">
                    fa-exclamation-circle
                  </v-icon>
                </v-row>
                <v-row>{{ warning.description }}</v-row>
              </v-col>
            </v-row>
          </v-col>
        </template>
      </ConfirmationDialog>
      <ConfirmationDialog ref="confirmationDialogIgnore">
        <template v-slot:message>
        </template>
      </ConfirmationDialog>
    </div>
  </v-container>
</template>

<script>
import {mapMutations, mapState} from 'vuex';
import PrimaryButton from '../util/PrimaryButton';
import NomRollStudentStatusChip from './NomRollStudentStatusChip';
import ApiService from '../../common/apiService';
import StudentDetailsInfoPanel from '../common/StudentDetailsInfoPanel';
import {
  NOMINAL_ROLL_STUDENT_STATUS_CODES,
  Routes,
  SEARCH_CONDITION,
  SEARCH_FILTER_OPERATION,
  SEARCH_VALUE_TYPE,
  NOMINAL_ROLL_STUDENT_FIELDS_TO_STUDENT_DETAILS_FIELDS_MAPPER,
  STUDENT_DETAILS_FIELDS
} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';
import PenMatchResultsTable from '@/components/common/PenMatchResultsTable';
import {
  constructPenMatchObjectFromStudent,
  deepCloneObject,
  getMatchedRecordssWithDemographicsByStudent,
  getPossibleMatches,
} from '@/utils/common';
import {formatPen, formatDob, formatGrade} from '@/utils/format';
import ConfirmationDialog from '../util/ConfirmationDialog';
import router from '../../router';
import Mousetrap from 'mousetrap';

export default {
  name: 'NomRollStudentDetailsDisplay',
  components: {
    PrimaryButton,
    NomRollStudentStatusChip,
    PenMatchResultsTable,
    StudentDetailsInfoPanel,
    ConfirmationDialog,
  },
  mixins: [alertMixin],
  props: {
    nomRollStudentID: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      nomRollStudent: null,
      modalStudent: {
        mincode: '',
        legalLastName: '',
        legalFirstName: '',
        legalMiddleNames: '',
        dc: '',
        genderCode: '',
        dob: '',
        bestMatchPEN: '',
        localID: '',
        usualLastName: '',
        usualFirstName: '',
        usualMiddleNames: '',
        postalCode: '',
        gradeCode: '',
        assignedPEN: ''
      },
      loading: true,
      possibleMatches: [],
      isLoadingMatches: false,
      showPossibleMatch: false,
      nomRollStudentCopy: {},
      isMatchingToStudentRecord: false,
      hasValidationIssues: false,
      disabledButtonActionsForStudentStatuses: [
        NOMINAL_ROLL_STUDENT_STATUS_CODES.MATCHEDUSR,
        NOMINAL_ROLL_STUDENT_STATUS_CODES.MATCHEDSYS,
        NOMINAL_ROLL_STUDENT_STATUS_CODES.IGNORED
      ],
      demogValidationResult: [],
      isStudentDataUpdated: false, // make it true, if any of the student gets updated from possible match list
      hiddenSearchFields: [
        STUDENT_DETAILS_FIELDS.LEGAL_MIDDLE_NAMES, 
        STUDENT_DETAILS_FIELDS.USUAL_LAST_NAME, 
        STUDENT_DETAILS_FIELDS.USUAL_FIRST_NAME, 
        STUDENT_DETAILS_FIELDS.USUAL_MIDDLE_NAMES,
        STUDENT_DETAILS_FIELDS.POSTAL_CODE
      ],
      mincode: '',
      studentID: '',
      validationErrorFields: []
    };
  },
  watch: {
    notification(val) {
      let notificationData = val;
      if (!this.isMatchingToStudentRecord && notificationData.eventType === 'UPDATE_STUDENT' && notificationData.eventOutcome === 'STUDENT_UPDATED' && notificationData.eventPayload) {
        this.handleStudentUpdateEvent(notificationData);
      }
    },
    //nomRollStudentID changes when route changes, so reload details
    nomRollStudentID: {
      handler() {
        this.initializeDetails();
      }
    },
    modalStudent(val) {
      this.mincode = val.mincode;
      this.nomRollStudent.schoolNumber = this.fedProvSchoolCodes.find(obj => obj.provincialCode === val.mincode)?.federalCode || val.mincode;
      this.nomRollStudent.surname = val.legalLastName;
      this.nomRollStudent.givenNames = val.legalFirstName;
      this.nomRollStudent.gender = val.genderCode;
      this.nomRollStudent.birthDate = formatDob(val.dob, 'uuuuMMdd', 'uuuu-MM-dd');
      this.nomRollStudent.grade = val.gradeCode.replace(/^0/, '');
    }
  },
  computed: {
    ...mapState('setNavigation', ['selectedIDs']),
    ...mapState('notifications', ['notification']),
    ...mapState('nominalRoll', ['fedProvSchoolCodes']),
    disableRefresh() {
      return this.isMatchingToStudentRecord
          || NOMINAL_ROLL_STUDENT_STATUS_CODES.FIXABLE !== this.nomRollStudent?.status;
    },
    disableMatchUnmatch() {
      return this.isStudentDataUpdated || this.isMatchingToStudentRecord;
    },
    disableActionButtons() {
      return this.loading || this.isMatchingToStudentRecord
          || this.disabledButtonActionsForStudentStatuses.some(status => status === this.nomRollStudent?.status);
    },
    seqNumber() {
      return this.selectedIDs?.findIndex(obj => obj.nominalRollStudentID === this.nomRollStudentID) + 1;
    },
    totalNumber() {
      return this.selectedIDs?.length;
    },
    isFixableOrErrorStatus() {
      return NOMINAL_ROLL_STUDENT_STATUS_CODES.FIXABLE === this.nomRollStudent.status
      || NOMINAL_ROLL_STUDENT_STATUS_CODES.ERROR === this.nomRollStudent.status;
    },
    penMatchResultTitle() {
      if (this.nomRollStudent.status) {
        switch (this.nomRollStudent.status) {
        case NOMINAL_ROLL_STUDENT_STATUS_CODES.MATCHEDSYS:
        case NOMINAL_ROLL_STUDENT_STATUS_CODES.MATCHEDUSR:
          return 'Matched To';
        default:
          return `${this.possibleMatches.length || 0} Matches`;
        }
      } else {
        return `${this.possibleMatches.length || 0} Matches`;
      }
    },
  },
  created() {
    //Go back to Files page if refresh button is pressed
    if(Object.keys(this.selectedIDs).length > 0) {
      this.$store.dispatch('student/getCodes');
      this.initializeDetails();
    } else {
      router.push({name: 'nominal-roll-list'});
    }
  },
  beforeDestroy() {
    this.clearNavigation();
  },
  mounted() {
    Mousetrap.bind('ctrl+b', () => {
      router.push({name: 'nominal-roll'});
      return false;
    });
  },
  methods: {
    ...mapMutations('setNavigation', ['clearNavigation']),
    ...mapMutations('nominalRoll', ['setFedProvSchoolCodes']),
    formatPen,
    async initializeDetails() {
      this.demogValidationResult = []; // reset the validation results, on clicking next or previous
      this.loading = true;
      try {
        await this.retrieveNomRollStudentByID();
        this.possibleMatches = [];
        if ([NOMINAL_ROLL_STUDENT_STATUS_CODES.FIXABLE, NOMINAL_ROLL_STUDENT_STATUS_CODES.ERROR, NOMINAL_ROLL_STUDENT_STATUS_CODES.IGNORED]
          .some(status => status === this.nomRollStudent?.status)) {
          const hasValidationFailure = this.handleDemogValidationResult(this.nomRollStudent?.validationErrors);
          if (!hasValidationFailure) {
            await this.runPenMatch();
          }
        } else {
          await this.getMatchedRecordsForStudent();
        }
      } catch (error) {
        this.setFailureAlert('An error occurred while loading the Nominal Roll PEN Request. Please try again later.');
        console.log(error);
      }
      this.loading = false;
    },
    async retrieveNomRollStudentByID() {
      if(this.fedProvSchoolCodes.length === 0) {
        const codesResponse = await ApiService.getFedProvSchoolCodes();
        this.setFedProvSchoolCodes(codesResponse.data);
      }
      const response = await ApiService.apiAxios.get(`${Routes['nominalRoll'].ROOT_ENDPOINT}/${this.nomRollStudentID}`);
      if (response.data) {
        this.nomRollStudent = response.data;
        this.setModalStudentFromNomRollStudent(this.nomRollStudent);
        this.nomRollStudentCopy = deepCloneObject(this.modalStudent);
      } else {
        throw new Error('No NominalRollStudent data for nomRollStudentID:' + this.nomRollStudentID);
      }
    },
    async runPenMatch() {
      this.isLoadingMatches = true;
      this.showPossibleMatch = false;
      this.possibleMatches = [];
      try {
        const result = await getPossibleMatches(constructPenMatchObjectFromStudent(this.modalStudent));
        this.showPossibleMatch = true;
        this.possibleMatches = result.data ?? [];
        this.isStudentDataUpdated = false; // pen match result is refreshed now enable the table.
      } catch (error) {
        console.log(error);
        this.setFailureAlert('PEN Match API call failed, please try again.');
      } finally {
        this.isLoadingMatches = false;
      }
    },
    setModalStudentFromNomRollStudent(nomRollStudent) {
      this.mincode = this.fedProvSchoolCodes.find(obj => obj.federalCode === nomRollStudent.schoolNumber)?.provincialCode || nomRollStudent.schoolNumber;
      this.modalStudent.mincode = this.mincode;
      this.modalStudent.legalLastName = nomRollStudent.surname;
      this.modalStudent.legalFirstName = nomRollStudent.givenNames;
      this.modalStudent.genderCode = nomRollStudent.gender;
      this.modalStudent.dob = formatDob(nomRollStudent.birthDate, 'uuuu-MM-dd', 'uuuuMMdd');
      this.modalStudent.gradeCode = formatGrade(nomRollStudent.grade);
    },
    async confirmToProceed() {
      let result = true;
      if (this.demogValidationResult.length > 0) {
        result = await this.$refs.confirmationDialog.open('Are you sure you want to proceed?', null,
          {
            width: '680px',
            messagePadding: 'px-4 pt-1',
            color: '',
            dark: false,
            titleBold: true,
            closeIcon: true,
            divider: true,
            resolveText: 'Confirm'
          });
      }
      return result;
    },
    async confirmToProceedIgnore() {
      let result = true;
      result = await this.$refs.confirmationDialogIgnore.open('Are you sure you want to ignore this student record?', 'This cannot be reversed.',
        {
          width: '680px',
          messagePadding: 'px-4 pt-1',
          color: '',
          dark: false,
          titleBold: true,
          closeIcon: true,
          divider: true,
          resolveText: 'Confirm'
        });
      return result;
    },
    retrievePenRequestsWithSameAssignedPen(pen) {
      const params = {
        params: {
          pageNumber: 0,
          searchQueries: [{
            searchCriteriaList: [
              {key: 'processingYear', operation: SEARCH_FILTER_OPERATION.EQUAL, value: this.nomRollStudent.processingYear, valueType: SEARCH_VALUE_TYPE.STRING, condition: SEARCH_CONDITION.AND},
              {key: 'assignedPEN', operation: SEARCH_FILTER_OPERATION.EQUAL, value: pen, valueType: SEARCH_VALUE_TYPE.STRING, condition: SEARCH_CONDITION.AND}
            ],
          }],
        }
      };

      return ApiService.apiAxios
        .get(`${Routes['nominalRoll'].ROOT_ENDPOINT}/search`, params)
        .then(response => {
          return response.data?.content;
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while loading Nominal Roll PEN Requests. Please try again later.');
          console.log(error);
          throw error;
        });
    },
    /**
     * This method is ignore a student record.
     *
     * @returns {Promise<void>}
     */
    async ignoreStudent() {
      let payload;
      const result = await this.confirmToProceedIgnore();
      if (!result) {
        return;
      }

      payload = {
        ...this.nomRollStudentCopy,
        status: NOMINAL_ROLL_STUDENT_STATUS_CODES.IGNORED,
      };

      ApiService.apiAxios.put(`${Routes['nominalRoll'].ROOT_ENDPOINT}/${this.nomRollStudentID}`, payload)
        .then(response => {
          if (response.data) {
            this.setSuccessAlert('Success! The student record has been set to ignored.');
            this.initializeDetails();
          }
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while ignoring the student record. Please try again later.');
          console.log(error);
        })
        .finally(() => {
          this.isMatchingToStudentRecord = false;
        });
    },
    /**
     * This method is responsible to do match/unmatch of student to Pen Request.
     * filter the matched row from possible matches to mark them twin.
     *
     * @param student the matched/unmatched student
     * @param buttonText whether match or unmatch was clicked.
     * @returns {Promise<void>}
     */
    async matchUnmatchStudentToNomRollStudent(student, buttonText) {
      let operation;
      let payload;
      if ('Match' === buttonText) {
        const result = await this.confirmToProceed();
        if (!result) {
          return;
        }

        this.isMatchingToStudentRecord = true;
        try {
          const penRequests = await this.retrievePenRequestsWithSameAssignedPen(student.pen);
          if(penRequests?.length > 0) {
            this.setFailureAlert('This PEN already used.');
            this.isMatchingToStudentRecord = false;
            return;
          }
        } catch (error) {
          this.isMatchingToStudentRecord = false;
          return;
        }

        operation = 'match';
        payload = {
          ...this.nomRollStudentCopy,
          assignedPEN: student.pen,
          status: NOMINAL_ROLL_STUDENT_STATUS_CODES.MATCHEDUSR,
        };
      } else {
        operation = 'unmatch';
        payload = {
          assignedPEN: null,
          status: NOMINAL_ROLL_STUDENT_STATUS_CODES.FIXABLE,
        };
      }
      this.isMatchingToStudentRecord = true;
      
      ApiService.apiAxios.put(`${Routes['nominalRoll'].ROOT_ENDPOINT}/${this.nomRollStudentID}`, payload)
        .then(response => {
          if (response.data) {
            this.setSuccessAlert(`Success! The student has been ${operation}ed to PEN Request.`);
            this.initializeDetails();
          }
        })
        .catch(error => {
          this.setFailureAlert(`An error occurred while ${operation}ing student to PEN Request. Please try again later.`);
          console.log(error);
        })
        .finally(() => {
          this.isMatchingToStudentRecord = false;
        });
    },
    /**
     * this function returns stored possible matches from DB for a particular student, backed by PEN_MATCH_API,
     * and not from fresh run of  pen match algorithm.
     * @returns {Promise<void>}
     */
    async getMatchedRecordsForStudent() {
      this.isLoadingMatches = true;
      this.showPossibleMatch = false;
      this.possibleMatches = [];
      try {
        if (this.nomRollStudent?.assignedPEN) {
          const studentResult = await ApiService.apiAxios.get(Routes['student'].ROOT_ENDPOINT + '/', {params: {pen: this.nomRollStudent?.assignedPEN}});
          this.studentID = studentResult.data.studentID;
        }

        this.possibleMatches = await getMatchedRecordssWithDemographicsByStudent(this.studentID, true);
        this.showPossibleMatch = true;
      } catch (error) {
        console.log(error);
        this.setFailureAlert('PEN Match or Student API call failed, please try again.');
      } finally {
        this.isLoadingMatches = false;
      }

    },
    async refreshMatchResults() {
      await this.runPenMatch();
    },
    handleStudentUpdateEvent(notificationData) {
      try {
        const student = JSON.parse(notificationData.eventPayload);
        if (student?.pen && (this.possibleMatches?.some(el => el?.pen === student.pen))) {
          this.setWarningAlert(`Student details for ${student.pen}, present in possible matches is updated by ${student.updateUser}. Please select this record from pen request files again.`);
          this.isStudentDataUpdated = true;
        }
      } catch (e) {
        console.error(e);
      }
    },
    async runDemogValidation() {
      try {
        const payload = {
          ...this.nomRollStudent
        };
        const result = await ApiService.apiAxios.post(`${Routes['nominalRoll'].ROOT_ENDPOINT}/validate`, payload);
        return this.handleDemogValidationResult(result.data.validationErrors);
      } catch (error) {
        console.log(error);
        this.setFailureAlert('Demographics validation call failed, please try again.');
      }
    },
    handleDemogValidationResult(result) {
      this.demogValidationResult = Object.entries(result).map(([key, value]) => ({
        dataFieldName: NOMINAL_ROLL_STUDENT_FIELDS_TO_STUDENT_DETAILS_FIELDS_MAPPER[key]?.name || key,
        uiFieldName: NOMINAL_ROLL_STUDENT_FIELDS_TO_STUDENT_DETAILS_FIELDS_MAPPER[key]?.label || key,
        description: value
      }));
      this.validationErrorFields = this.demogValidationResult;

      if (!(this.nomRollStudent.status === NOMINAL_ROLL_STUDENT_STATUS_CODES.MATCHEDSYS
        || this.nomRollStudent.status === NOMINAL_ROLL_STUDENT_STATUS_CODES.MATCHEDUSR)) {
        this.hasValidationIssues = this.validationErrorFields?.length > 0;
        return this.hasValidationIssues;
      }else{
        this.demogValidationResult = [];
        this.hasValidationIssues = false;
        this.validationErrorFields = [];
        return false;
      }
    },
    showMatchButton() {
      return NOMINAL_ROLL_STUDENT_STATUS_CODES.FIXABLE === this.nomRollStudent.status
        || NOMINAL_ROLL_STUDENT_STATUS_CODES.ERROR === this.nomRollStudent.status;
    },
    showUnmatchButton(matchedStudent) {
      return ([NOMINAL_ROLL_STUDENT_STATUS_CODES.MATCHEDSYS, NOMINAL_ROLL_STUDENT_STATUS_CODES.MATCHEDUSR]
        .some(element => element === this.nomRollStudent.status) && matchedStudent.studentID === this.studentID);
    },
    grayoutPossibleMatches(matchedStudent) {
      return !!matchedStudent.possibleMatchedToStudent;
    },
  }
};
</script>

<style scoped>
.batch-title {
  font-size: 1.065rem;
}

.pre-style {
  white-space: pre-wrap; /* Since CSS 2.1 */
  white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
  white-space: -o-pre-wrap; /* Opera 7 */
  word-wrap: break-word;
  max-height: 10em;
  overflow-y: auto;
}

.pen-placeholder {
  margin-right: 5.7em;
}

#bottom-table /deep/ table th,
#top-table /deep/ table th {
  border-bottom: none !important;
  font-size: 0.875rem;
  font-weight: normal;
  color: rgba(0, 0, 0, 0.87) !important;
  height: 1.5rem;
}


.details-table /deep/ table > tbody > tr > td {
  height: 1.5rem;
}

.details-table /deep/ table > tbody > tr:hover {
  background: transparent !important;
}

.details-table /deep/ table > tbody > tr:not(:last-child) > td {
  border-bottom: none !important;
}

.full-width {
  margin-left: -32px;
  margin-right: -32px;
}

pre {
  font-family: inherit;
  font-size: inherit;
}
</style>
