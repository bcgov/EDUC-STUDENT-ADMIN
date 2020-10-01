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
    <div v-if="!loading && prbStudent"  style="width: 100%" :overlay=false>
      <v-row no-gutters class="list-actions pt-4 pb-4 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3 d-flex align-center" style="background-color:white;">
        <span class="mr-4">
          <strong>{{seqNumberInBatch}} of {{totalNumberInBatch}} filtered</strong> | Record {{prbStudent.recordNumber}} of {{batchFile.studentCount}} in submission {{prbStudent.submissionNumber}}
        </span>
        <PrbStudentStatusChip 
          :prbStudent="prbStudent"
        ></PrbStudentStatusChip>
        <v-spacer></v-spacer>
        <PrimaryButton id="modify-search-action" :secondary="true" class="mx-2" :disabled="!actionEnabled" text="Modify search"></PrimaryButton>
        <PrimaryButton id="issue-pen-action" class="mr-2" :disabled="!actionEnabled" text="Issue new PEN"></PrimaryButton>
        <PrimaryButton id="request-info-action" text="Request info"></PrimaryButton>
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
        <div style="width: 100%" :overlay="false">
          <v-data-table
            id="top-table"
            class="details-table"
            :headers="headers"
            :items="[prbStudent]"
            hide-default-footer
            dense
          >
            <template v-for="h in headers" v-slot:[`header.${h.value}`]="{ header }">
              <span :key="h.id" class="top-column-item">
                {{ header.topText }}
              </span>
              <span :key="h.id" class="double-column-item">{{header.doubleText}}</span>
            </template>
            <template v-slot:item="props">
              <tr>
                <td v-for="header in props.headers" :key="header.id" :class="header.id">
                  <div class="table-cell">
                    <span class="top-column-item">
                      <span><strong>{{ props.item[header.topValue] || ' ' }}</strong></span>
                    </span>
                    <span class="double-column-item"><strong>{{props.item[header.doubleValue]}}</strong></span>
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
                    <span class="top-column-item">
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
            <v-btn icon color="#003366" @click="clearInfoRequested">
              <v-icon>fa-times-circle</v-icon>
            </v-btn>
          </v-row>
          <v-row no-gutters>
            <p>{{prbStudent.infoRequest}}</p>
          </v-row>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import PrimaryButton from '../../util/PrimaryButton';
import PrbStudentStatusChip from './PrbStudentStatusChip';
import { formatPrbStudent, formatPrbStudents } from '../../../utils/penrequest-batch/format';
import ApiService from '../../../common/apiService';
import { Routes, SEARCH_FILTER_OPERATION, SEARCH_VALUE_TYPE } from '../../../utils/constants';
import { cloneDeep, sortBy, uniq } from 'lodash';
import alterMixin from '../../../mixins/alterMixin';

export default {
  name: 'PrbStudentDetailsDisplay',
  components: {
    PrimaryButton,
    PrbStudentStatusChip,
  },
  mixins: [alterMixin],
  props: {
    seqNumber: {
      type: Number,
      default: 1,
    },
    totalNumber: {
      type: Number,
      default: 1,
    },
    batchCount: {
      type: Number,
      default: 1,
    },
    seqInBatch: {
      type: Number,
      default: 1,
    },
    totalInBatch: {
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
    }
  },
  data() {
    return {
      batchFile: null,
      prbStudent: null,
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

      actionEnabled: false,

      loading: true,
    };
  },
  watch: {
    seqNumber: {
      handler() {
        this.initializeDetails();
      }
    },
  },
  computed: {
    ...mapState('penRequestBatch', ['selectedFiles']),
    ...mapState('prbStudentSearch', ['selectedRecords']),
    selectedStudents() {
      return sortBy(this.selectedRecords, ['minCode', 'submissionNumber', 'recordNumber']);
    },
    topTableHeaders() {
      return this.headers.map(({topText, doubleText, topValue, doubleValue, sortable})=> ({text: topText, doubleText, value: topValue, doubleValue, sortable}));
    },
    bottomTableHeaders() {
      return this.headers.map(({bottomText, bottomValue, sortable})=> ({text: bottomText, value: bottomValue, sortable}));
    },
  },
  created() {
    this.initializeDetails();
  },
  beforeDestroy() {
    this.clearNavigation();
  },
  methods: {
    ...mapMutations('setNavigation', ['setNavigation', 'clearNavigation', 'setPreRoute', 'setNextRoute']),
    ...mapMutations('prbStudentSearch', [ 'setSelectedRecords']),
    ...mapMutations('penRequestBatch', ['setSelectedFiles']),
    setBatchNav() {
      const query = { 
        totalNumber: this.totalNumber,
        totalInBatch: this.totalNumberInBatch, 
        batchCount: this.batchCount, 
        searchCriteria: JSON.stringify(this.searchCriteria), 
        prbStudentIDs: this.prbStudentIDs,
      };

      this.setNavigation({
        seqNumber: this.seqNumber, 
        totalNumber: this.totalNumber, 
        title: `Record ${this.seqNumber} of ${this.totalNumber} (${this.batchCount} ${this.batchCount > 1 ? 'files' : 'file'} selected)`, 
        preRoute: { name: 'prbStudentDetails', query: { seqNumber: this.seqNumber - 1, seqInBatch: this.seqNumberInBatch - 1, ...query }}, 
        nextRoute: { name: 'prbStudentDetails', query: { seqNumber: this.seqNumber + 1, seqInBatch: this.seqNumberInBatch + 1, ...query }},
      });
    },
    async initializeDetails() {
      this.seqNumberInBatch = this.seqInBatch;
      this.totalNumberInBatch = this.totalInBatch;
      const studentIDs = [this.prbStudentIDs].flat();
      this.loading = true;

      try {
        if(studentIDs.length > 0) {
          await this.retrieveSelectedPenRequests(studentIDs);
        } else {
          await this.retrievePaginatedPenRequests();
        }

        await this.retrieveBatchFile();
        this.setBatchNav();
      } catch (error) {
        this.setFailureAlert('An error occurred while loading the PEN request. Please try again later.');
        console.log(error);
      }

      this.loading = false;
    },
    async retrieveSelectedPenRequests(studentIDs) {
      if(!this.selectedStudents || this.selectedStudents.length === 0) {
        await this.retrieveAllPenRequests(studentIDs);
      }
      this.prbStudent = this.selectedStudents[this.seqNumber-1];
      const recordsInBatch = this.selectedStudents.filter(record => record.penRequestBatchID === this.prbStudent.penRequestBatchID);
      this.seqNumberInBatch = recordsInBatch.findIndex(record => record.penRequestBatchStudentID === this.prbStudent.penRequestBatchStudentID) + 1;
      this.totalNumberInBatch = recordsInBatch.length;
      this.batchIDs = uniq(this.selectedStudents.map(record => record.penRequestBatchID));
    },
    async retrievePaginatedPenRequests() {
      const params = {
        params: {
          pageNumber: this.seqNumber-1,
          pageSize: 1,
          sort: this.sortParams,
          searchQueries: this.searchCriteria,
        }
      };

      this.batchIDs = this.getBatchIdSearchCriteria(this.searchCriteria).value.split(',');

      const response = await this.getPenRequestsFromApi(params);
      if(response.data && response.data.content) {
        this.prbStudent = formatPrbStudent(response.data.content[0]);
        if(this.seqNumberInBatch < 1 || this.seqNumberInBatch > this.totalNumberInBatch || (this.seqNumberInBatch === 1 && this.seqNumber === 1)) {
          const penRequestInBatchResp = await this.retrievePenRequestsInBatch(this.prbStudent.penRequestBatchID);
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
      } else {
        throw new Error('No PrbStudent data for seqNumber:' + this.seqNumber);
      }
    },
    retrieveAllPenRequests(studentIDs) {
      const searchQueries = [
        { 
          searchCriteriaList: [{
            key: 'penRequestBatchStudentID', operation: SEARCH_FILTER_OPERATION.IN, value: studentIDs.join(','), valueType: SEARCH_VALUE_TYPE.UUID
          }],
        },
      ];

      const params = {
        params: {
          pageNumber: 0,
          pageSize: 10,
          searchQueries
        }
      };

      return this.getPenRequestsFromApi(params)
        .then(response => {
          if(response.data && response.data.content) {
            formatPrbStudents(response.data.content);
            this.setSelectedRecords(response.data.content);
          }
        });
    },
    retrievePenRequestsInBatch(batchID) {
      let criteria = cloneDeep(this.searchCriteria);
      let batchIdSearchCriteria = this.getBatchIdSearchCriteria(criteria);
      if(batchIdSearchCriteria) {
        batchIdSearchCriteria.operation = SEARCH_FILTER_OPERATION.EQUAL;
        batchIdSearchCriteria.value = batchID;
      }

      const params = {
        params: {
          pageNumber: 1,
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
    clearInfoRequested() {
      this.loading = true;
      const req = {
        infoRequest: '',
        penRequestBatchStudentStatusCode: 'FIXABLE'
      };
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
    }
  }
};
</script>

<style scoped>
  .pen-placeholder {
    margin-right: 5.7em;
  }

  .subheader-divider {
    border-width: 0.25ex 0 0 0;
  }

  #bottom-table /deep/ table th,
  #top-table /deep/ table th { 
    border-bottom: none !important;
    font-size: 0.875rem;;
    font-weight: normal;
    color: rgba(0, 0, 0, 0.87) !important;
  }

  .details-table /deep/ table th:nth-child(1) {
    width: 3%;
  }
  .details-table /deep/ table th:nth-child(3),
  .details-table /deep/ table th:nth-child(4),
  .details-table /deep/ table th:nth-child(5) {
    width: 19%;
  }
  .details-table /deep/ table th:nth-child(2),
  .details-table /deep/ table th:nth-child(6),
  .details-table /deep/ table th:nth-child(7),
  .details-table /deep/ table th:nth-child(8) {
    width: 10%;
  }

  .details-table /deep/ table > tbody > tr:hover {
    background: transparent !important;
  }

  .details-table /deep/ table > tbody > tr:not(:last-child) > td { 
    border-bottom: none !important;
  }

  .double-column-item {
    float: right;
  }
  .top-column-item {
    float: left;
  }
  .bottom-column-item {
    float: left;
  }

</style>
