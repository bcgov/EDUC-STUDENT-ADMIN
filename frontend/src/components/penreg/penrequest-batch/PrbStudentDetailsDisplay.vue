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
            <v-row>
              <AlertMessage v-model="alert" :alertMessage="alertMessage" :alertType="alertType"></AlertMessage>
              <AlertMessage v-model="studentUpdateAlert" :alertMessage="studentUpdateAlertMessage" :alertType="studentUpdateAlertType" ></AlertMessage>
            </v-row>
            <div v-if="!loading && prbStudent" style="width: 100%;" :overlay=false>

              <StudentDetailsInfoPanel
                  :student.sync="prbStudent"
                  key="info-panel"
                  :runPenMatch="runPenMatch"
                  :studentDetailsCopy="prbStudentCopy"
                  :demogValidationResult="demogValidationResult"
                  @validationRun="checkValidationResults">
                <template v-slot:headerPanel="{ openSearchDemographicsModal }">
                  <v-row no-gutters
                         class="list-actions pt-4 pb-4 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3 d-flex align-center"
                         style="background-color:white;">
                    <v-icon v-if="isUnarchived || isArchived" :dense="isUnarchived" color="#2E8540" class="mr-1">
                      {{ isUnarchived ? 'fa-unlock' : 'mdi-package-up' }}
                    </v-icon>
                    <span class="mr-4 batch-title">
                      <strong>{{ seqNumberInBatch }} of {{
                          totalNumberInBatch
                        }} filtered</strong> | Record {{ prbStudent.recordNumber }} of {{ batchFile.studentCount }} in submission {{
                        prbStudent.submissionNumber
                      }}
                    </span>
                    <PrbStudentStatusChip
                        :prbStudent="prbStudent"
                    ></PrbStudentStatusChip>
                    <v-spacer></v-spacer>
                    <PrimaryButton id="modify-search-action" :secondary="true" class="mx-2"
                                   :disabled="disableModifySearch" text="Modify search"
                                   @click.native="openSearchDemographicsModal"></PrimaryButton>
                    <PrimaryButton id="issue-pen-action" class="mr-2" :disabled="disableIssueNewPen"
                                   :loading="isIssuingNewPen" text="Issue new PEN"
                                   @click.native="issueNewPen"></PrimaryButton>
                    <InfoDialog
                        :disabled="disableInfoReqBtn"
                        @updateInfoRequested="updateInfoRequested"
                        :text="prbStudent.infoRequest"
                    ></InfoDialog>
                  </v-row>
                  <v-row no-gutters class="py-2 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3" style="background-color:white;">
                    <span>
                      <strong>{{ prbStudent.mincode }} {{ batchFile.schoolName }}</strong>
                    </span>
                    <v-spacer></v-spacer>
                    <span class="mr-6">
                      <span class="mr-3">Submitted PEN</span>
                      <span
                          :class="{'pen-placeholder': !prbStudent.submittedPen}"><strong>{{
                          formatPen(prbStudent.submittedPen)
                        }}</strong></span>
                    </span>
                    <span>
                      <span class="mr-3">Assigned PEN</span>
                      <span
                          :class="{'pen-placeholder': !prbStudent.assignedPEN}"><strong>{{
                          formatPen(prbStudent.assignedPEN)
                        }}</strong></span>
                    </span>
                  </v-row>
                </template>
                <template v-slot:footerPanel>
                  <v-row v-if="prbStudent.infoRequest" no-gutters class="py-2 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3"
                         style="background-color:white;">
                    <v-col cols="12">
                      <v-row no-gutters class="d-flex align-center">
                        <span class="mr-3"><strong>Info requested</strong></span>
                        <v-btn id="clear-info-requested" icon color="#003366" @click="updateInfoRequested()">
                          <v-icon>fa-times-circle</v-icon>
                        </v-btn>
                      </v-row>
                      <v-row no-gutters>
                        <pre class="pre-style">{{ prbStudent.infoRequest }}</pre>
                      </v-row>
                    </v-col>
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
                <PenMatchResultsTable :student="prbStudent" :is-comparison-required="true"
                                      :is-pen-link="true"
                                      :is-refresh-required="true"
                                      :is-match-un-match="true"
                                      :disableMatchUnmatch="disableMatchUnmatch"
                                      :disableRefresh="disableRefresh"
                                      :demogValidationResult="demogValidationResult"
                                      @match-unmatch-student-prb-student="matchUnmatchStudentToPRBStudent"
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
            <v-row v-for="warning in demogValidationResult" :key="warning.penRequestBatchValidationIssueTypeCode">
              <v-col class="pb-0">
                <v-row>
                  <strong>{{ warning.uiFieldName }}</strong>
                  <v-icon small color="#FCBA19" class="ml-2">
                    fa-exclamation-circle
                  </v-icon>
                </v-row>
                <v-row>{{ warning.penRequestBatchValidationIssueTypeCode }}</v-row>
              </v-col>
            </v-row>
          </v-col>
        </template>
      </ConfirmationDialog>
    </div>
  </v-container>
</template>

<script>
import {mapMutations, mapState} from 'vuex';
import PrimaryButton from '../../util/PrimaryButton';
import PrbStudentStatusChip from './PrbStudentStatusChip';
import InfoDialog from './prb-student-details/InfoDialog';
import ApiService from '../../../common/apiService';
import StudentDetailsInfoPanel from '../../common/StudentDetailsInfoPanel';
import studentUpdateAlertMixin from '../../../mixins/student-update-alert-mixin';
import AlertMessage from '../../util/AlertMessage';
import {
  PEN_REQ_BATCH_STUDENT_REQUEST_CODES,
  PRB_SAGA_NAMES,
  Routes,
  SEARCH_CONDITION,
  SEARCH_FILTER_OPERATION,
  SEARCH_VALUE_TYPE
} from '@/utils/constants';
import {cloneDeep, isEmpty} from 'lodash';
import alertMixin from '../../../mixins/alertMixin';
import PenMatchResultsTable from '@/components/common/PenMatchResultsTable';
import {
  constructPenMatchObjectFromStudent,
  deepCloneObject,
  getDemogValidationResults,
  getMatchedRecordssWithDemographicsByStudent,
  getPossibleMatches,
} from '@/utils/common';
import {formatPen} from '@/utils/format';
import ConfirmationDialog from '../../util/ConfirmationDialog';


export default {
  name: 'PrbStudentDetailsDisplay',
  components: {
    AlertMessage,
    PrimaryButton,
    PrbStudentStatusChip,
    InfoDialog,
    PenMatchResultsTable,
    StudentDetailsInfoPanel,
    ConfirmationDialog
  },
  mixins: [alertMixin, studentUpdateAlertMixin],
  props: {
    totalNumber: {
      type: Number,
      default: 1,
    },
    batchCount: {
      type: Number,
      default: 1,
    },
    searchCriteria: {
      type: Array,
      default: () => []
    },
    prbStudentIDs: {
      type: [Array, String],
      default: () => []
    },
    prBatchIDs: {
      type: [Array, String],
      default: () => []
    },
    archived: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      batchFile: null,
      prbStudent: null,
      modalStudent: null,
      seqNumber: 1,
      seqNumberInBatch: 1,
      totalNumberInBatch: 1,
      sortParams: {
        'penRequestBatchEntity.mincode': 'ASC',
        'penRequestBatchEntity.submissionNumber': 'ASC',
        recordNumber: 'ASC',
      },
      batchIDs: null,
      loading: true,
      repeatRequestOriginalStatus: null,
      possibleMatches: [],
      isLoadingMatches: false,
      showPossibleMatch: false,
      prbStudentCopy: {},
      isIssuingNewPen: false,
      prbStudentNavInfo: [],
      prbSagaNames: Object.values(PRB_SAGA_NAMES),
      isMatchingToStudentRecord: false,
      hasValidationIssues: false,
      disabledButtonActionsForStudentStatuses: [
        PEN_REQ_BATCH_STUDENT_REQUEST_CODES.MATCHEDUSR,
        PEN_REQ_BATCH_STUDENT_REQUEST_CODES.MATCHEDSYS,
        PEN_REQ_BATCH_STUDENT_REQUEST_CODES.NEWPENSYS,
        PEN_REQ_BATCH_STUDENT_REQUEST_CODES.NEWPENUSR,
      ],
      demogValidationResult: [],
      isStudentDataUpdated: false, // make it true, if any of the student gets updated from possible match list
      sagaId: undefined,
    };
  },
  watch: {
    currentRoute: {
      handler() {
        this.initializeDetails();
      }
    },
    repeatRequestOriginal: {
      handler() {
        if (this.prbStudent?.penRequestBatchStudentStatusCode === PEN_REQ_BATCH_STUDENT_REQUEST_CODES.REPEAT && this.prbStudent?.repeatRequestOriginalID)
          return ApiService.apiAxios.get(`${Routes['penRequestBatch'].FILES_URL}/${this.prbStudent.penRequestBatchID}/students/${this.prbStudent.repeatRequestOriginalID}`)
              .then(response => {
                this.repeatRequestOriginalStatus = response.data?.repeatRequestOriginalStatus;
              });
      }
    },
    notification(val) {
      let notificationData = val;
      const isPRBSaga = this.prbSagaNames.some(el => el === notificationData?.sagaName);
      if (notificationData && isPRBSaga) {
        this.handlePRBSagaNotification(notificationData);
      } else if (!this.sagaId && !this.prbStudent?.sagaInProgress && notificationData.eventType === 'UPDATE_STUDENT' && notificationData.eventOutcome === 'STUDENT_UPDATED' && notificationData.eventPayload) {
        this.handleStudentUpdateEvent(notificationData);
      }
    },
  },
  computed: {
    ...mapState('setNavigation', ['currentRoute']),
    ...mapState('notifications', ['notification']),
    disableRefresh() {
      return this.prbStudent?.sagaInProgress || this.isArchived
          || PEN_REQ_BATCH_STUDENT_REQUEST_CODES.FIXABLE !== this.prbStudent?.penRequestBatchStudentStatusCode;
    },
    disableMatchUnmatch() {
      return this.isStudentDataUpdated || this.prbStudent?.sagaInProgress || this.isArchived;
    },
    disableInfoReqBtn() {
      return this.loading || this.prbStudent?.sagaInProgress || this.isArchived
          || this.disabledButtonActionsForStudentStatuses.some(status => status === this.prbStudent?.penRequestBatchStudentStatusCode)
          || ![PEN_REQ_BATCH_STUDENT_REQUEST_CODES.INFOREQ, PEN_REQ_BATCH_STUDENT_REQUEST_CODES.ERROR, PEN_REQ_BATCH_STUDENT_REQUEST_CODES.FIXABLE]
              .some(element => element === this.prbStudent?.penRequestBatchStudentStatusCode || element === this.repeatRequestOriginalStatus);
    },
    repeatRequestOriginal() {
      return this.prbStudent?.repeatRequestOriginalID;
    },
    disableIssueNewPen() {
      return this.loading || this.prbStudent?.sagaInProgress || this.isArchived
          || this.disabledButtonActionsForStudentStatuses.some(status => status === this.prbStudent?.penRequestBatchStudentStatusCode)
          || (![PEN_REQ_BATCH_STUDENT_REQUEST_CODES.FIXABLE, PEN_REQ_BATCH_STUDENT_REQUEST_CODES.INFOREQ]
                  .some(element => element === this.prbStudent.penRequestBatchStudentStatusCode || element === this.repeatRequestOriginalStatus)
              && (this.demogValidationResult.some(x => x.penRequestBatchValidationIssueSeverityCode === 'ERROR') && (PEN_REQ_BATCH_STUDENT_REQUEST_CODES.ERROR === this.prbStudent.penRequestBatchStudentStatusCode)));
    },
    disableModifySearch() {
      return this.loading || this.prbStudent?.sagaInProgress || this.isArchived
          || this.disabledButtonActionsForStudentStatuses.some(status => status === this.prbStudent?.penRequestBatchStudentStatusCode);
    },
    isUnarchived() {
      return this.batchFile?.penRequestBatchStatusCode === 'UNARCHIVED';
    },
    isArchived() {
      return this.batchFile?.penRequestBatchStatusCode === 'ARCHIVED';
    },
    penRequestBatchStore() {
      return this.archived ? 'archivedRequestBatch' : 'penRequestBatch';
    }
  },
  created() {
    this.$store.dispatch('penRequestBatch/getCodes');
    this.resetAlert();
    this.initializeDetails();
  },
  beforeDestroy() {
    this.clearNavigation();
  },
  methods: {
    ...mapMutations('setNavigation', ['setNavigation', 'clearNavigation']),
    ...mapMutations('prbStudentSearch', ['setSelectedRecords']),
    formatPen,
    setBatchNav() {
      this.setNavigation({
        seqNumber: this.seqNumber,
        totalNumber: this.totalNumber,
        title: `Record ${this.seqNumber} of ${this.totalNumber} (${this.batchCount} ${this.batchCount > 1 ? 'files' : 'file'} selected)`,
        preRoute: {
          name: 'prbStudentDetails',
          query: {
            seqNumber: this.seqNumber - 1,
            seqInBatch: this.seqNumberInBatch - 1,
            totalInBatch: this.totalNumberInBatch
          }
        },
        nextRoute: {
          name: 'prbStudentDetails',
          query: {
            seqNumber: this.seqNumber + 1,
            seqInBatch: this.seqNumberInBatch + 1,
            totalInBatch: this.totalNumberInBatch
          }
        },
      });
    },
    async initializeDetails() {
      if (!isEmpty(this.currentRoute)) {
        this.seqNumber = this.currentRoute.query?.seqNumber;
        this.seqNumberInBatch = this.currentRoute.query?.seqInBatch;
        this.totalNumberInBatch = this.currentRoute.query?.totalInBatch;
      }
      const studentIDs = [this.prbStudentIDs].flat();
      this.loading = true;

      try {
        if (this.prbStudentNavInfo.length === 0 || this.prbStudentNavInfo.length < this.seqNumber) {
          await this.retrievePaginatedPenRequests(studentIDs);
        } else {
          await this.retrievePenRequestByID();
        }

        await this.retrieveBatchFile();
        this.setBatchNav();
        const payload = {
          student: {
            ...this.modalStudent
          }
        };

        this.possibleMatches = [];
        if ([PEN_REQ_BATCH_STUDENT_REQUEST_CODES.FIXABLE, PEN_REQ_BATCH_STUDENT_REQUEST_CODES.INFOREQ, PEN_REQ_BATCH_STUDENT_REQUEST_CODES.ERROR]
            .some(status => status === this.prbStudent?.penRequestBatchStudentStatusCode)) {
          this.demogValidationResult = await getDemogValidationResults(payload);
          const hasValidationFailure = this.demogValidationResult.some(x => x.penRequestBatchValidationIssueSeverityCode === 'ERROR');

          if (!hasValidationFailure && PEN_REQ_BATCH_STUDENT_REQUEST_CODES.FIXABLE === this.prbStudent?.penRequestBatchStudentStatusCode) {
            await this.runPenMatch();
          }
        } else {
          await this.getMatchedRecordsForStudent();
        }

        if (this.prbStudent?.sagaInProgress) {
          switch (this.prbStudent?.sagaName) {
          case PRB_SAGA_NAMES.PEN_REQUEST_BATCH_NEW_PEN_PROCESSING_SAGA:
            this.setSuccessAlert('The request to issue new PEN is currently being processed.');
            break;
          case PRB_SAGA_NAMES.PEN_REQUEST_BATCH_USER_MATCH_PROCESSING_SAGA:
            this.setSuccessAlert('The request to match student to Pen Request is currently being processed.');
            break;
          case PRB_SAGA_NAMES.PEN_REQUEST_BATCH_USER_UNMATCH_PROCESSING_SAGA:
            this.setSuccessAlert('The request to unmatch student to Pen Request is currently being processed.');
            break;
          }
        }
      } catch (error) {
        this.setFailureAlert('An error occurred while loading the PEN request. Please try again later.');
        console.log(error);
      }

      this.loading = false;
    },
    async retrievePenRequestByID() {
      const navInfo = this.prbStudentNavInfo[this.seqNumber - 1];
      this.seqNumberInBatch = navInfo.seqNumberInBatch;
      this.totalNumberInBatch = navInfo.totalNumberInBatch;

      const response = await ApiService.apiAxios.get(`${Routes['penRequestBatch'].FILES_URL}/${navInfo.penRequestBatchID}/students/${navInfo.penRequestBatchStudentID}`);
      if (response.data) {
        this.prbStudent = response.data;
        this.setModalStudentFromPrbStudent(this.prbStudent);
        this.prbStudentCopy = deepCloneObject(this.prbStudent);
      } else {
        throw new Error('No PrbStudent data for penRequestBatchStudentID:' + navInfo.penRequestBatchStudentID);
      }
    },
    async retrievePaginatedPenRequests(studentIDs) {
      let searchQueries;
      if (studentIDs.length > 0) {
        this.batchIDs = [this.prBatchIDs].flat();
        searchQueries = [
          {
            searchCriteriaList: [
              {
                key: 'penRequestBatchEntity.penRequestBatchID',
                operation: SEARCH_FILTER_OPERATION.IN,
                value: this.batchIDs.join(','),
                valueType: SEARCH_VALUE_TYPE.UUID
              },
              {
                key: 'penRequestBatchStudentID',
                operation: SEARCH_FILTER_OPERATION.IN,
                value: studentIDs.join(','),
                valueType: SEARCH_VALUE_TYPE.UUID,
                condition: SEARCH_CONDITION.AND
              }
            ],
          },
        ];
      } else {
        searchQueries = this.searchCriteria;
        this.batchIDs = this.getBatchIdSearchCriteria(this.searchCriteria).value.split(',');
      }

      const params = {
        params: {
          pageNumber: this.seqNumber - 1,
          pageSize: 1,
          sort: this.sortParams,
          searchQueries,
        }
      };

      const response = await this.getPenRequestsFromApi(params);
      if (response.data && response.data.content) {
        this.prbStudent = response.data.content[0];
        this.setModalStudentFromPrbStudent(this.prbStudent);
        this.prbStudentCopy = deepCloneObject(this.prbStudent);
        if (this.seqNumberInBatch < 1 || this.seqNumberInBatch > this.totalNumberInBatch || (this.seqNumberInBatch === 1 && this.seqNumber === 1)) {
          const penRequestInBatchResp = await this.retrievePenRequestsInBatch(this.prbStudent.penRequestBatchID, searchQueries);
          if (penRequestInBatchResp.data) {
            if (this.seqNumberInBatch < 1) {
              this.seqNumberInBatch = penRequestInBatchResp.data.totalElements;
            } else if (this.seqNumberInBatch > this.totalNumberInBatch) {
              this.seqNumberInBatch = 1;
            }
            this.totalNumberInBatch = penRequestInBatchResp.data.totalElements;
          } else {
            throw new Error('No Batch data for penRequestBatchID:' + this.prbStudent.penRequestBatchID);
          }
        }
        this.prbStudentNavInfo.push({
          penRequestBatchID: this.prbStudent.penRequestBatchID,
          penRequestBatchStudentID: this.prbStudent.penRequestBatchStudentID,
          seqNumberInBatch: this.seqNumberInBatch,
          totalNumberInBatch: this.totalNumberInBatch
        });

      } else {
        throw new Error('No PrbStudent data for seqNumber:' + this.seqNumber);
      }
    },
    retrievePenRequestsInBatch(batchID, searchQueries) {
      let criteria = cloneDeep(searchQueries);
      let batchIdSearchCriteria = this.getBatchIdSearchCriteria(criteria);
      if (batchIdSearchCriteria) {
        batchIdSearchCriteria.operation = SEARCH_FILTER_OPERATION.EQUAL;
        batchIdSearchCriteria.value = batchID;
      }

      const params = {
        params: {
          pageNumber: 0,
          pageSize: 1,
          searchQueries: criteria,
        }
      };

      return this.getPenRequestsFromApi(params);
    },
    async retrieveBatchFile() {
      const selectedFiles = this.$store.state[this.penRequestBatchStore].selectedFiles;
      if (!selectedFiles || selectedFiles.length === 0) {
        await this.retrieveSelectedFiles();
      }
      this.batchFile = this.$store.state[this.penRequestBatchStore].selectedFiles.find(file => file.penRequestBatchID === this.prbStudent.penRequestBatchID);
    },
    retrieveSelectedFiles() {
      const searchQueries = [
        {
          searchCriteriaList: [{
            key: 'penRequestBatchID',
            operation: SEARCH_FILTER_OPERATION.IN,
            value: this.batchIDs.join(','),
            valueType: SEARCH_VALUE_TYPE.UUID
          }],
        },
      ];

      const params = {
        params: {
          pageNumber: 0,
          pageSize: 15,
          searchQueries
        }
      };

      return ApiService.apiAxios.get(Routes['penRequestBatch'].FILES_URL, params)
          .then(response => {
            response.data && this.$store.commit(`${this.penRequestBatchStore}/setSelectedFiles`, response.data.content);
          });
    },
    getPenRequestsFromApi(params) {
      return ApiService.apiAxios.get(Routes['penRequestBatch'].STUDENTS_SEARCH_URL, params);
    },
    getBatchIdSearchCriteria(searchCriteria) {
      const batchIdSearchQuery = searchCriteria.find(query =>
          query.searchCriteriaList.some(criteria => criteria.key === 'penRequestBatchEntity.penRequestBatchID'));
      return batchIdSearchQuery?.searchCriteriaList.find(criteria => criteria.key === 'penRequestBatchEntity.penRequestBatchID');
    },
    updateInfoRequested(infoRequest) {
      this.loading = true;
      let req;
      if (infoRequest) {
        req = {
          infoRequest: infoRequest,
          penRequestBatchStudentStatusCode: PEN_REQ_BATCH_STUDENT_REQUEST_CODES.INFOREQ
        };
      } else {
        req = {
          infoRequest: '',
          penRequestBatchStudentStatusCode: PEN_REQ_BATCH_STUDENT_REQUEST_CODES.FIXABLE
        };
      }
      ApiService.apiAxios.put(`${Routes['penRequestBatch'].FILES_URL}/${this.prbStudent.penRequestBatchID}/students/${this.prbStudent.penRequestBatchStudentID}`, req)
          .then(response => {
            response.data && (this.prbStudent = response.data);
          })
          .catch(error => {
            this.setFailureAlert('An error occurred while updating the PEN request. Please try again later.');
            console.log(error);
          })
          .finally(() => {
            this.loading = false;
          });
    },

    async runPenMatch() {
      this.isLoadingMatches = true;
      this.showPossibleMatch = false;
      this.possibleMatches = [];
      try {
        const result = await getPossibleMatches(constructPenMatchObjectFromStudent(this.prbStudent));
        this.isIssuePenDisabled = false;
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
    checkValidationResults(value) {
      this.hasValidationIssues = value.hasValidationError;
      this.demogValidationResult = value.validationIssues;
    },
    setModalStudentFromPrbStudent(prbStudent) {
      this.modalStudent = deepCloneObject(prbStudent);
    },
    //TODO need to find out when we implement validation in next story, which other status maps to what and may be update it to get from a MAP.
    getPrbStatusCodeFromPenMatchStatus(penStatus) {
      if (penStatus === 'D1') {
        return 'MATCHEDSYS';
      }
      return 'FIXABLE';
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
    async issueNewPen() {
      let result = await this.confirmToProceed();
      if (!result) {
        return;
      }
      this.isIssuingNewPen = true;
      const req = {
        twinStudentIDs: this.possibleMatches.map(match => match.studentID),
        prbStudent: this.prbStudent
      };
      ApiService.apiAxios.post(`${Routes['penRequestBatch'].FILES_URL}/${this.prbStudent.penRequestBatchID}/students/${this.prbStudent.penRequestBatchStudentID}/issueNewPen`, req)
          .then(response => {
            if (response.data) {
              this.prbStudent.sagaInProgress = true;
              this.setSuccessAlert('Your request to issue new PEN is accepted.');
            }
          })
          .catch(error => {
            this.setFailureAlert('An error occurred while issuing new PEN. Please try again later.');
            console.log(error);
          })
          .finally(() => {
            this.isIssuingNewPen = false;
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
    async matchUnmatchStudentToPRBStudent(student, buttonText) {
      let operation;
      if ('Match' === buttonText) {
        const result = await this.confirmToProceed();
        if (!result) {
          return;
        }
        this.prbStudent.assignedPEN = student.pen;
        this.prbStudent.studentID = student.studentID;
        operation = 'match';
      } else {
        operation = 'unmatch';
      }
      this.isMatchingToStudentRecord = true;
      const payload = {
        prbStudent: this.prbStudent,
        studentID: student.studentID,
        matchedPEN: student.pen,
        matchedStudentIDList: this.possibleMatches.filter(el => el.studentID !== student.studentID).map(el => el.studentID)
      };
      const params = {
        penNumbersInOps: student.pen
      };
      ApiService.apiAxios.post(`${Routes['penRequestBatch'].FILES_URL}/${this.prbStudent.penRequestBatchID}/students/${this.prbStudent.penRequestBatchStudentID}/user-${operation}`, payload, {params})
          .then(response => {
            if (response.data) {
              this.sagaId = response.data;
              this.prbStudent.sagaInProgress = true;
              this.setSuccessAlert(`Your request to ${operation} student to Pen Request is accepted.`);
            }
          })
          .catch(error => {
            if (error?.response?.data?.code === 409) {
              this.setFailureAlert(error?.response?.data?.message);
            }
            this.setFailureAlert(`Your request to ${operation} student to Pen Request could not be accepted,  Please try again later.`);
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
        const result = await getMatchedRecordssWithDemographicsByStudent(this.prbStudent?.studentID, true);
        let matchedIndex = -1;

        result.forEach((item, index) => {
          if (item.studentID === this.prbStudent?.studentID) {
            item.matchedToStudent = true;
            item.iconValue = 'mdi-file-check';
            matchedIndex = index;
          } else {
            item.possibleMatchedToStudent = true;
            item.iconValue = 'mdi-account-multiple';
          }
        });

        this.possibleMatches = matchedIndex > 0 ? [result[matchedIndex], ...result.slice(0, matchedIndex), ...result.slice(matchedIndex + 1)] : result;

        this.showPossibleMatch = true;
      } catch (error) {
        console.log(error);
        this.setFailureAlert('PEN Match API call failed, please try again.');
      } finally {
        this.isLoadingMatches = false;
      }

    },
    async refreshMatchResults() {
      await this.runPenMatch();
    },
    handlePRBSagaNotification(notificationData) {
      const updatedPrbStudent = JSON.parse(notificationData.eventPayload);
      if (updatedPrbStudent?.penRequestBatchStudentID === this.prbStudent.penRequestBatchStudentID) {
        if (notificationData.sagaStatus === 'COMPLETED') {
          switch (notificationData?.sagaName) {
          case PRB_SAGA_NAMES.PEN_REQUEST_BATCH_NEW_PEN_PROCESSING_SAGA:
            if (this.sagaId) {
              this.setSuccessAlert('Your request to issue new PEN is now completed.');
            } else {
              this.setSuccessAlert(`${updatedPrbStudent.updateUser} issued a new PEN to this pen request.`);
            }
            break;
          case PRB_SAGA_NAMES.PEN_REQUEST_BATCH_USER_MATCH_PROCESSING_SAGA:
            if (this.sagaId) {
              this.setSuccessAlert('Your request to match student to this Pen Request is now completed.');
            } else {
              this.setSuccessAlert(`${updatedPrbStudent.updateUser} matched a student to this Pen Request.`);
            }
            break;
          case PRB_SAGA_NAMES.PEN_REQUEST_BATCH_USER_UNMATCH_PROCESSING_SAGA:
            if (this.sagaId) {
              this.setSuccessAlert('Your request to unmatch student to this Pen Request is now completed.');
            } else {
              this.setSuccessAlert(`${updatedPrbStudent.updateUser} unmatched student from Pen Request.`);
            }
            break;
          }
          this.setSelectedRecords();
          this.initializeDetails();
        } else if (notificationData.sagaStatus === 'INITIATED') {
          this.prbStudent.sagaInProgress = true;
        }
      }
    },
    handleStudentUpdateEvent(notificationData) {
      try {
        const student = JSON.parse(notificationData.eventPayload);
        if (student?.pen && (this.possibleMatches?.some(el => el?.pen === student.pen))) {
          this.setWarningAlertForStudentUpdate(`Student details for ${student.pen}, present in possible matches is updated by ${student.updateUser}.`);
          this.isStudentDataUpdated = true;
        }
      } catch (e) {
        console.error(e);
      }
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
