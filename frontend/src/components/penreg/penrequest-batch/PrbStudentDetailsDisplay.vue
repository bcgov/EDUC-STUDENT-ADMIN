<template>
  <v-container fluid class="fill-height px-0 mb-4">
    <v-progress-linear
      absolute
      top
      indeterminate
      color="blue"
      :active="loading"
    ></v-progress-linear>
    <v-alert
      v-model="alert"
      dense
      text
      dismissible
      outlined
      transition="scale-transition"
      :class="`${alertType} flex-grow-1 mx-3`"
    >
      {{ alertMessage }}
    </v-alert>
    <div v-if="!loading && prbStudent" style="width: 100%;" :overlay=false>
      <div class="sticky full-width px-8">
      <v-row no-gutters class="list-actions pt-4 pb-4 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3 d-flex align-center" style="background-color:white;">
        <span class="mr-4 batch-title">
          <strong>{{seqNumberInBatch}} of {{totalNumberInBatch}} filtered</strong> | Record {{prbStudent.recordNumber}} of {{batchFile.studentCount}} in submission {{prbStudent.submissionNumber}}
        </span>
        <PrbStudentStatusChip
          :prbStudent="prbStudent"
        ></PrbStudentStatusChip>
        <v-spacer></v-spacer>
        <PrimaryButton id="modify-search-action" :secondary="true" class="mx-2" text="Modify search" @click.native="openSearchDemographicsModal"></PrimaryButton>
        <PrimaryButton id="issue-pen-action" class="mr-2" :disabled="disableIssueNewPen" :loading="isIssuingNewPen" text="Issue new PEN" @click.native="issueNewPen"></PrimaryButton>
        <InfoDialog
          :disabled="disableInfoReqBtn"
          @updateInfoRequested="updateInfoRequested"
          :text="prbStudent.infoRequest"
        ></InfoDialog>
      </v-row>
        <v-row>
          <SearchDemographicModal @closeDialog="closeDialog" @updateStudent="updateStudentAndRunPenMatch" :dialog="dialog"
                                  :is-field-read-only="isFieldReadOnly"
                                  :is-mincode-hidden="true"
                                  :student-data="modalStudent"></SearchDemographicModal>
        </v-row>
      <v-row no-gutters class="py-2 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3" style="background-color:white;">
        <span>
          <strong>{{prbStudent.minCode}} {{batchFile.schoolName}}</strong>
        </span>
        <v-spacer></v-spacer>
        <span class="mr-6">
          <span class="mr-3">Submitted PEN</span>
          <span :class="{'pen-placeholder': !prbStudent.submittedPen}"><strong>{{prbStudent.submittedPen}}</strong></span>
        </span>
        <span>
          <span class="mr-3">Assigned PEN</span>
          <span :class="{'pen-placeholder': !prbStudent.assignedPEN}"><strong>{{prbStudent.assignedPEN}}</strong></span>
        </span>
      </v-row>
      <v-divider class="mb-1 subheader-divider"/>
      <v-row no-gutters class="py-2" style="background-color:white;">
        <div style="width: 100%;" :overlay="false">
          <v-data-table
            id="top-table"
            class="details-table mb-3"
            :headers="headers"
            :items="[prbStudent]"
            hide-default-footer
            dense
          >
            <template v-for="h in headers" v-slot:[`header.${h.value}`]="{ header }">
              <span :key="h.id" class="top-column-item" :class="[header.doubleText ? 'header-half-width':'']">
                {{ header.topText }}
              </span>
              <span :key="h.id" class="double-column-item">{{header.doubleText}}</span>
            </template>
            <template v-slot:item="props">
              <tr>
                <td v-for="header in props.headers" :key="header.id" :class="header.id">
                  <div class="table-cell" :class="[props.item[header.doubleValue] ? 'value-half-width':'']">
                    <span :class="['top-column-item',{'mark-field-value-changed':isFieldValueUpdated(header.topValue)}]">
                      <span><strong>{{ props.item[header.topValue] || ' ' }}</strong></span>
                    </span>
                    <span :class="['double-column-item-value',{'mark-field-value-changed':isFieldValueUpdated(header.doubleValue)}]"><strong>{{props.item[header.doubleValue]}}</strong></span>
                  </div>
                </td>
              </tr>
            </template>
          </v-data-table>
          <v-data-table
            id="bottom-table"
            class="details-table"
            :headers="bottomTableHeaders"
            :items="[prbStudent]"
            hide-default-footer
            dense
          >
            <template v-slot:item="props">
              <tr>
                <td v-for="header in props.headers" :key="header.id" :class="header.id">
                  <div class="table-cell">
                    <span  :class="['top-column-item',{'mark-field-value-changed':isFieldValueUpdated(header.value)}]">
                      <span><strong>{{ props.item[header.value] || ' ' }}</strong></span>
                    </span>
                  </div>
                </td>
              </tr>
            </template>
          </v-data-table>
        </div>
      </v-row>
      <v-row v-if="prbStudent.infoRequest" no-gutters class="py-2 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3" style="background-color:white;">
        <v-col cols="6">
          <v-row no-gutters class="d-flex align-center">
            <span class="mr-3"><strong>Info requested</strong></span>
            <v-btn id="clear-info-requested" icon color="#003366" @click="updateInfoRequested()">
              <v-icon>fa-times-circle</v-icon>
            </v-btn>
          </v-row>
          <v-row no-gutters>
            <pre>{{prbStudent.infoRequest}}</pre>
          </v-row>
        </v-col>
      </v-row>
      </div>
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
      <v-row class="full-width" v-if="showPossibleMatch">
        <PenMatchResultsTable :student="prbStudent" :is-comparison-required="true"
                              :is-pen-link="true"
                              :is-refresh-required="true"
                              :possible-match="possibleMatches"></PenMatchResultsTable>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import {mapMutations, mapState} from 'vuex';
import PrimaryButton from '../../util/PrimaryButton';
import PrbStudentStatusChip from './PrbStudentStatusChip';
import InfoDialog from './prb-student-details/InfoDialog';
import {formatPrbStudent, formatPrbStudents} from '@/utils/penrequest-batch/format';
import ApiService from '../../../common/apiService';
import {
  PEN_REQ_BATCH_STUDENT_REQUEST_CODES,
  Routes,
  SEARCH_FILTER_OPERATION,
  SEARCH_CONDITION, 
  SEARCH_VALUE_TYPE
} from '@/utils/constants';
import {cloneDeep, isEmpty, sortBy, uniq} from 'lodash';
import alterMixin from '../../../mixins/alterMixin';
import SearchDemographicModal from "@/components/common/SearchDemographicModal";
import PenMatchResultsTable from "@/components/common/PenMatchResultsTable";
import {
  constructPenMatchObjectFromStudent,
  deepCloneObject,
  getDemogValidationResults,
  getPossibleMatches
} from '@/utils/common';
import {formatDob, formatPostalCode} from "@/utils/format";

export default {
  name: 'PrbStudentDetailsDisplay',
  components: {
    PrimaryButton,
    PrbStudentStatusChip,
    InfoDialog,
    SearchDemographicModal,
    PenMatchResultsTable
  },
  mixins: [alterMixin],
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
        'penRequestBatchEntity.minCode': 'ASC',
        'penRequestBatchEntity.submissionNumber': 'ASC',
        recordNumber: 'ASC',
      },
      batchIDs: null,
      headers: [
        { id: 'table-checkbox', type: 'select', sortable: false },
        { topText: 'Mincode', bottomText: 'Local ID', align: 'start', sortable: false, topValue: 'minCode', bottomValue: 'localID' },
        { topText: 'Legal Surname', bottomText: 'Usual Surname', topValue: 'legalLastName', bottomValue: 'usualLastName', sortable: false },
        { topText: 'Legal Given', bottomText: 'Usual Given', topValue: 'legalFirstName', bottomValue: 'usualFirstName', sortable: false },
        { topText: 'Legal Middle', bottomText: 'Usual Middle', topValue: 'legalMiddleNames', bottomValue: 'usualMiddleNames', sortable: false },
        { topText: 'DC', doubleText: 'Gen', bottomText: 'Postal Code', topValue: 'dc', doubleValue: 'genderCode', bottomValue: 'postalCode', sortable: false },
        { topText: 'Birth Date', bottomText: 'Grade', topValue: 'dob', bottomValue: 'gradeCode', sortable: false },
        { topText: 'Sugg. PEN', bottomText: '', topValue: 'bestMatchPEN', bottomValue: '', sortable: false },
      ],

      loading: true,
      repeatRequestOriginalStatus: null,
      dialog: false,
      possibleMatches: [],
      isLoadingMatches: false,
      showPossibleMatch: false,
      prbStudentCopy:{},
      isIssuingNewPen: false,
      prbStudentNavInfo: [],
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
        if(this.prbStudent?.penRequestBatchStudentStatusCode === PEN_REQ_BATCH_STUDENT_REQUEST_CODES.REPEAT && this.prbStudent?.repeatRequestOriginalID)
          return ApiService.apiAxios.get(`${Routes['penRequestBatch'].FILES_URL}/${this.prbStudent.penRequestBatchID}/students/${this.prbStudent.repeatRequestOriginalID}`)
            .then(response => {
              this.repeatRequestOriginalStatus = response.data?.repeatRequestOriginalStatus;
            });
      }
    },
    notification(val) {
      if (val) {
        const notificationData = JSON.parse(val);
        if (notificationData && notificationData.sagaName === 'PEN_REQUEST_BATCH_NEW_PEN_PROCESSING_SAGA' && notificationData.sagaStatus === 'COMPLETED') {
            const updatedPrbStudent = JSON.parse(notificationData.eventPayload);
            if(updatedPrbStudent?.penRequestBatchStudentID === this.prbStudent.penRequestBatchStudentID) {
              this.setSuccessAlert('The request to issue new PEN is now completed.');
              this.setSelectedRecords();
              this.initializeDetails();
            }
        }
      }
    },
  },
  computed: {
    ...mapState('setNavigation', ['currentRoute']),
    ...mapState('penRequestBatch', ['selectedFiles']),
    ...mapState('prbStudentSearch', ['selectedRecords']),
    ...mapState('notifications', ['notification']),
    disableInfoReqBtn() {
      return ![PEN_REQ_BATCH_STUDENT_REQUEST_CODES.INFOREQ, PEN_REQ_BATCH_STUDENT_REQUEST_CODES.ERROR, PEN_REQ_BATCH_STUDENT_REQUEST_CODES.FIXABLE].some(element => element === this.prbStudent?.penRequestBatchStudentStatusCode || element === this.repeatRequestOriginalStatus);
    },
    selectedStudents() {
      return sortBy(this.selectedRecords, ['minCode', 'submissionNumber', 'recordNumber']);
    },
    topTableHeaders() {
      return this.headers.map(({topText, doubleText, topValue, doubleValue, sortable})=> ({text: topText, doubleText, value: topValue, doubleValue, sortable}));
    },
    bottomTableHeaders() {
      return this.headers.map(({bottomText, bottomValue, sortable})=> ({text: bottomText, value: bottomValue, sortable}));
    },
    repeatRequestOriginal() {
      return this.prbStudent?.repeatRequestOriginalID;
    },
    disableIssueNewPen() {
      return this.loading || this.prbStudent?.sagaInProgress || ![PEN_REQ_BATCH_STUDENT_REQUEST_CODES.FIXABLE, PEN_REQ_BATCH_STUDENT_REQUEST_CODES.INFOREQ]
        .some(element => element === this.prbStudent.penRequestBatchStudentStatusCode || element === this.repeatRequestOriginalStatus);
    }
  },
  created() {
    this.$store.dispatch('penRequestBatch/getCodes');
    this.initializeDetails();
  },
  beforeDestroy() {
    this.clearNavigation();
  },
  methods: {
    ...mapMutations('setNavigation', ['setNavigation', 'clearNavigation']),
    ...mapMutations('prbStudentSearch', [ 'setSelectedRecords']),
    ...mapMutations('penRequestBatch', ['setSelectedFiles']),
    setBatchNav() {
      this.setNavigation({
        seqNumber: this.seqNumber,
        totalNumber: this.totalNumber,
        title: `Record ${this.seqNumber} of ${this.totalNumber} (${this.batchCount} ${this.batchCount > 1 ? 'files' : 'file'} selected)`,
        preRoute: { name: 'prbStudentDetails', query: { seqNumber: this.seqNumber - 1, seqInBatch: this.seqNumberInBatch - 1, totalInBatch: this.totalNumberInBatch }},
        nextRoute: { name: 'prbStudentDetails', query: { seqNumber: this.seqNumber + 1, seqInBatch: this.seqNumberInBatch + 1, totalInBatch: this.totalNumberInBatch }},
      });
    },
    async initializeDetails() {
      if(!isEmpty(this.currentRoute)) {
        this.seqNumber = this.currentRoute.query?.seqNumber;
        this.seqNumberInBatch = this.currentRoute.query?.seqInBatch;
        this.totalNumberInBatch = this.currentRoute.query?.totalInBatch;
      }
      const studentIDs = [this.prbStudentIDs].flat();
      this.loading = true;

      try {
        if(this.prbStudentNavInfo.length === 0 || this.prbStudentNavInfo.length < this.seqNumber) {
          await this.retrievePaginatedPenRequests(studentIDs);
        } else {
          await this.retrievePenRequestByID();
        }

        await this.retrieveBatchFile();
        this.setBatchNav();
        if(this.prbStudent?.penRequestBatchStudentStatusCode === PEN_REQ_BATCH_STUDENT_REQUEST_CODES.NEWPENUSR) {
          await Promise.all([this.runDemogValidation(), this.runPenMatch()]);
        } else {
          await this.loadPossibleMatchesFromBatchAPI();
        }

        if(this.prbStudent?.sagaInProgress) {
          this.setSuccessAlert('The request to issue new PEN is currently being processed.');
        }
        
      } catch (error) {
        this.setFailureAlert('An error occurred while loading the PEN request. Please try again later.');
        console.log(error);
      }

      this.loading = false;
    },
    async retrievePenRequestByID() {
      const navInfo = this.prbStudentNavInfo[this.seqNumber-1];
      this.seqNumberInBatch = navInfo.seqNumberInBatch;
      this.totalNumberInBatch = navInfo.totalNumberInBatch;

      const response = await ApiService.apiAxios.get(`${Routes['penRequestBatch'].FILES_URL}/${navInfo.penRequestBatchID}/students/${navInfo.penRequestBatchStudentID}`);
      if(response.data) {
        this.prbStudent = formatPrbStudent(response.data);
        this.setModalStudentFromPrbStudent(this.prbStudent);
        this.prbStudentCopy = deepCloneObject(this.prbStudent);
      } else {
        throw new Error('No PrbStudent data for penRequestBatchStudentID:' + navInfo.penRequestBatchStudentID);
      }
    },
    async retrievePaginatedPenRequests(studentIDs) {
      let searchQueries;
      if(studentIDs.length > 0) {
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
          pageNumber: this.seqNumber-1,
          pageSize: 1,
          sort: this.sortParams,
          searchQueries,
        }
      };

      const response = await this.getPenRequestsFromApi(params);
      if(response.data && response.data.content) {
        this.prbStudent = formatPrbStudent(response.data.content[0]);
        this.setModalStudentFromPrbStudent(this.prbStudent);
        this.prbStudentCopy = deepCloneObject(this.prbStudent);
        if(this.seqNumberInBatch < 1 || this.seqNumberInBatch > this.totalNumberInBatch || (this.seqNumberInBatch === 1 && this.seqNumber === 1)) {
          const penRequestInBatchResp = await this.retrievePenRequestsInBatch(this.prbStudent.penRequestBatchID, searchQueries);
          if(penRequestInBatchResp.data) {
            if(this.seqNumberInBatch < 1) {
              this.seqNumberInBatch = penRequestInBatchResp.data.totalElements;
            } else if(this.seqNumberInBatch > this.totalNumberInBatch) {
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
      if(batchIdSearchCriteria) {
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
      if(!this.selectedFiles || this.selectedFiles.length === 0) {
        await this.retrieveSelectedFiles();
      }
      this.batchFile = this.selectedFiles.find(file => file.penRequestBatchID === this.prbStudent.penRequestBatchID);
    },
    retrieveSelectedFiles() {
      const searchQueries = [
        {
          searchCriteriaList: [{
            key: 'penRequestBatchID', operation: SEARCH_FILTER_OPERATION.IN, value: this.batchIDs.join(','), valueType: SEARCH_VALUE_TYPE.UUID
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
          response.data && this.setSelectedFiles(response.data.content);
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
      if(infoRequest) {
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
          response.data && (this.prbStudent = formatPrbStudent(response.data));
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while updating the PEN request. Please try again later.');
          console.log(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    openSearchDemographicsModal() {
      this.setModalStudentFromPrbStudent(this.prbStudent);
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
      // cancel reverts the request to original state.
      this.prbStudent = deepCloneObject(this.prbStudentCopy);
    },
    isFieldReadOnly() {
      return false;
    },
    async updateStudentAndRunPenMatch(studentModified) {
      this.prbStudent = deepCloneObject(studentModified);
      this.prbStudent.postalCode = this.prbStudent.postalCode? formatPostalCode(this.prbStudent.postalCode):'';
      this.prbStudent.dob = formatDob(this.prbStudent.dob,'uuuuMMdd','uuuu/MM/dd');
      await Promise.all([this.runDemogValidation(), this.runPenMatch()]);
    },
    async loadPossibleMatchesFromBatchAPI(){
      this.isLoadingMatches = true;
      this.showPossibleMatch = false;
      const params = {
        params: {
          id: this.prbStudent.penRequestBatchID,
          studentId: this.prbStudent.penRequestBatchStudentID
        }
      };
      try{
        const result = await ApiService.apiAxios.get(Routes.penRequestBatch.MATCH_OUTCOME_URL, params);
        this.possibleMatches = result.data;
      }catch (e){
        console.log(e);
        this.setFailureAlert('Error in retrieving possible matches from batch api.');
      }finally {
        this.isLoadingMatches = false;
        this.showPossibleMatch = true;
      }
    },
    async runPenMatch() {
      this.isLoadingMatches = true;
      this.showPossibleMatch = false;
      this.possibleMatches = [];
      try {
        const result = await getPossibleMatches(constructPenMatchObjectFromStudent(this.modalStudent));
        this.isIssuePenDisabled = false;
        this.showPossibleMatch = true;
        this.possibleMatches = result.data;
        if(this.prbStudent?.penRequestBatchStudentStatusCode != PEN_REQ_BATCH_STUDENT_REQUEST_CODES.NEWPENUSR) {
          this.prbStudent.penRequestBatchStudentStatusCode = this.getPrbStatusCodeFromPenMatchStatus(result.penStatus);
        } else if(! this.possibleMatches.some(matched => this.prbStudent?.assignedPEN?.replace(/\D/g,'') === matched.pen)) {
          const newStudent = await this.getStudentByID(this.prbStudent.studentID);
          this.possibleMatches.unshift(newStudent);
        }
      } catch (error) {
        console.log(error);
        this.requestFailed = true;
        this.setFailureAlert('PEN Match API call failed, please try again.');
      } finally {
        this.isLoadingMatches = false;
      }
    },
    isFieldValueUpdated(fieldName) {
      if(fieldName){
        return this.prbStudent[fieldName]?.toLowerCase() !== this.prbStudentCopy[fieldName]?.toLowerCase();
      }
      return false;
    },
    async runDemogValidation() {
      try {
        const payload = {
          student: {
            ...this.modalStudent
          }
        };
        const result = await getDemogValidationResults(payload);
        return result.length > 0;
      } catch (error) {
        console.log(error);
      }
    },
    setModalStudentFromPrbStudent(prbStudent){
      this.modalStudent = deepCloneObject(prbStudent);
      this.modalStudent.mincode = this.modalStudent.minCode?.replaceAll(' ',''); // since the modal component is generic and expects mincode to be all lowercase.
      this.modalStudent.postalCode = this.modalStudent.postalCode?.replaceAll(' ','');
      this.modalStudent.dob = formatDob(this.modalStudent.dob,'uuuu/MM/dd','uuuuMMdd');
    },
    //TODO need to find out when we implement validation in next story, which other status maps to what and may be update it to get from a MAP.
    getPrbStatusCodeFromPenMatchStatus(penStatus) {
      if (penStatus === 'D1') {
        return 'MATCHEDSYS';
      }
      return 'FIXABLE';
    },
    async issueNewPen() {
      this.isIssuingNewPen = true;
      const req = {
        twinStudentIDs: this.possibleMatches.map(match => match.studentID)
      };
      ApiService.apiAxios.post(`${Routes['penRequestBatch'].FILES_URL}/${this.prbStudent.penRequestBatchID}/students/${this.prbStudent.penRequestBatchStudentID}/issueNewPen`, req)
        .then(response => {
          if(response.data) {
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
    async getStudentByID(studentID) {
      const response = await ApiService.apiAxios.get(Routes.student.GET_ALL_STUDENTS_BY_IDS, { params: { studentIDs: studentID }});
      return response.data[0];
    }
  }
};
</script>

<style scoped>
  .batch-title {
    font-size: 1.065rem;
  }

  .pen-placeholder {
    margin-right: 5.7em;
  }

  .subheader-divider {
    border-width: 0.25ex 0 0 0;
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

  .double-column-item {
    float: right;
    display: contents;
  }

  .double-column-item-value{
    float: right;
  }

  .top-column-item {
    float: left;
  }
  .bottom-column-item {
    float: left;
  }
  .full-width {
    margin-left: -32px;
    margin-right: -32px;
  }
  .double-width {
    width: 5em;
  }
  .header-half-width {
    width: 3.0em;
  }
  .value-half-width {
    width: 4.0em;
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

  .mark-field-value-changed {
    color: #2E8540;
  }

  @media screen and (max-width: 1300px) {
    .details-table /deep/ table tr:nth-child(1),
    .details-table /deep/ table th:nth-child(1) {
      width: 3%;
    }
    .details-table /deep/ table tr:nth-child(3),
    .details-table /deep/ table tr:nth-child(4),
    .details-table /deep/ table tr:nth-child(5),
    .details-table /deep/ table th:nth-child(3),
    .details-table /deep/ table th:nth-child(4),
    .details-table /deep/ table th:nth-child(5) {
      width: 17.2%;
    }
    .details-table /deep/ table tr:nth-child(2),
    .details-table /deep/ table tr:nth-child(6),
    .details-table /deep/ table tr:nth-child(7),
    .details-table /deep/ table tr:nth-child(8),
    .details-table /deep/ table th:nth-child(2),
    .details-table /deep/ table th:nth-child(6),
    .details-table /deep/ table th:nth-child(7),
    .details-table /deep/ table th:nth-child(8) {
      width: 10%;
    }
  }

  @media screen and (min-width: 1301px) {
    .details-table /deep/ table th:nth-child(1) {
      width: 2%;
    }
    .details-table /deep/ table th:nth-child(3),
    .details-table /deep/ table th:nth-child(4),
    .details-table /deep/ table th:nth-child(5) {
      width: 16.8%;
    }
    .details-table /deep/ table th:nth-child(2),
    .details-table /deep/ table th:nth-child(6),
    .details-table /deep/ table th:nth-child(7),
    .details-table /deep/ table th:nth-child(8) {
      width: 10%;
    }
  }
</style>
