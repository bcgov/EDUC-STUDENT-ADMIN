<template>
  <v-container
    fluid
    class="full-height px-0 mb-4"
  >
    <v-form
      id="prbStudentSearchForm"
      ref="prbStudentSearchForm"
      v-model="validForm"
    >
      <v-container
        fluid
        class="fill-height px-0"
      >
        <v-row no-gutters>
          <v-card
            elevation="0"
            height="100%"
            width="100%"
            style="background-color:white;"
          >
            <PenRequestSearchPanel
              :search-params="prbStudentSearchParams"
              :loading="searchLoading"
              :disabled="!searchEnabled"
              @searchByPen="searchPenRequestsByPen"
              @search="searchPenRequests"
            />
            <v-progress-linear
              indeterminate
              color="blue"
              :active="searchLoading && !prbStudentSearchResponse"
            />
            <v-row
              v-if="prbStudentSearchResponse"
              no-gutters
              class="py-2"
              style="background-color:white;"
            >
              <v-divider class="mx-3 header-divider" />
            </v-row>
            <v-row
              v-if="prbStudentSearchResponse"
              id="resultsRow"
              no-gutters
              class="py-2"
              style="background-color:white;"
            >
              <PrbStudentSearchResults
                :loading="searchLoading"
                :archived="archived"
              />
            </v-row>
          </v-card>
        </v-row>
      </v-container>
    </v-form>
  </v-container>
</template>
<script>
import ApiService from '../../../common/apiService';
import {
  PEN_REQ_BATCH_STUDENT_REQUEST_CODES,
  Routes,
  SEARCH_CONDITION,
  SEARCH_FILTER_OPERATION,
  SEARCH_VALUE_TYPE,
  PEN_REQUEST_STUDENT_VALIDATION_FIELD_CODES_TO_STUDENT_DETAILS_FIELDS_MAPPER
} from '@/utils/constants';
import {mapActions, mapState} from 'pinia';
import PrbStudentSearchResults from './PrbStudentSearchResults.vue';
import {formatPrbStudents} from '@/utils/penrequest-batch/format';
import alertMixin from '../../../mixins/alertMixin';
import _, {difference} from 'lodash';
import Mousetrap from 'mousetrap';
import router from '@/router';
import PenRequestSearchPanel from '@/components/common/PenRequestSearchPanel.vue';
import {penRequestBatchStudentSearchStore} from '@/store/modules/prbStudentSearch';
import {penRequestBatchStore} from '@/store/modules/penRequestBatch';

export default {
  components: {
    PrbStudentSearchResults,
    PenRequestSearchPanel,
  },
  mixins: [alertMixin],
  props: {
    batchIDs: {
      type: String,
      default: ''
    },
    statusFilters: {
      type: String,
      default: ''
    },
    archived: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      validForm: false,
      searchLoading: false,
      searchEnabled: false,
      prbStudentSearchResultsKey: 0,
      disablePageHandler: false,
    };
  },
  computed:{
    ...mapState(penRequestBatchStudentSearchStore, ['pageNumber', 'selectedRecords', 'prbStudentSearchResponse', 'selectedStudentStatus', 'currentPrbStudentSearchParams', 'prbStudentSearchCriteria', 'showSamePENAssigned']),
    prbStudentSearchParams: {
      get(){
        return penRequestBatchStudentSearchStore().prbStudentSearchParams;
      },
      set(newPage){
        return penRequestBatchStudentSearchStore().setPrbStudentSearchParams(newPage);
      }
    },
    prbStudentStatusSearchCriteria() {
      const statuses = this.selectedStudentStatus || this.statusFilters;
      return {
        key: 'penRequestBatchStudentStatusCode',
        operation: statuses.length > 0 ? SEARCH_FILTER_OPERATION.IN : SEARCH_FILTER_OPERATION.NOT_EQUAL,
        value: statuses.length > 0 ? statuses : PEN_REQ_BATCH_STUDENT_REQUEST_CODES.LOADED,
        valueType: SEARCH_VALUE_TYPE.STRING,
        condition: SEARCH_CONDITION.AND
      };
    },
    prbStudentBatchIdSearchCriteria() {
      return ({key: 'penRequestBatchEntity.penRequestBatchID', operation: SEARCH_FILTER_OPERATION.IN, value: this.batchIDs, valueType: SEARCH_VALUE_TYPE.UUID});
    },
    penRequestBatchStore() {
      return this.archived ? 'archivedRequestBatch' : 'penRequestBatch';
    }
  },
  watch: {
    pageNumber: {
      handler() {
        if(!this.disablePageHandler){
          this.searchLoading = true;
          this.retrievePenRequests(this.prbStudentSearchCriteria, false)
            .finally(() => {
              this.searchLoading = false;
            });
        }
      }
    },
    selectedStudentStatus: {
      handler() {
        this.initialSearch();
      }
    },
    showSamePENAssigned: {
      handler() {
        this.initialSearch();
      }
    },
  },
  mounted() {
    Mousetrap.bind('ctrl+b', () => {
      if(this.archived){
        router.push({name: 'archivedRequestBatch'});
      }else{
        router.push({name: 'penRequestBatch'});
      }
      return false;
    });
    penRequestBatchStore().getCodes();
    this.setSelectedRecords();
    this.initialSearch();
  },
  methods: {
    ...mapActions(penRequestBatchStudentSearchStore, ['setPageNumber', 'setSelectedRecords', 'setPrbStudentSearchResponse', 'clearPrbStudentSearchParams', 'setCurrentPrbStudentSearchParams', 'setPrbStudentSearchCriteria']),
    searchPenRequestsByPen([field, pen]){
      this.clearPrbStudentSearchParams();
      this.prbStudentSearchParams[field] = pen;
      this.searchPenRequests();
    },
    searchHasValues(){
      this.searchEnabled = Object.values(this.prbStudentSearchParams).some(v => !!v);
      return this.searchEnabled;
    },
    async getSamePENStudents(){
      const params = {
        params: {
          batchIDs: this.batchIDs,
        }
      };
      return ApiService.apiAxios
        .get(Routes['penRequestBatch'].SAME_PEN_SEARCH_URL, params)
        .then(response => {
          return response.data;
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while loading getSamePENStudents. Please try again later.');
          console.log(error);
          throw error;
        });
    },
    initialSearch() {
      if(this.currentPrbStudentSearchParams) {
        this.prbStudentSearchParams = JSON.parse(JSON.stringify(this.currentPrbStudentSearchParams));
      }
      this.searchPenRequests(true);
      if(this.prbStudentSearchParams) {
        this.searchHasValues();
      }
    },
    async searchPenRequests(initial = false) {
      this.searchLoading = true;
      this.prbStudentSearchResultsKey += 1; //forces prbStudentSearchResults to rerender and update curPage
      this.disablePageHandler=true;
      this.setPageNumber(1);

      if(initial || (this.$refs.prbStudentSearchForm.validate() && this.searchHasValues())) {
        const searchCriteria = await this.prbStudentSearchCriteriaList(this.prbStudentSearchParams);
        this.retrievePenRequests(searchCriteria, true)
          .then(() => {
            this.setCurrentPrbStudentSearchParams(JSON.parse(JSON.stringify(this.prbStudentSearchParams)));
            this.setPrbStudentSearchCriteria(searchCriteria);
          })
          .finally(() => {
            this.searchLoading = false;
            this.disablePageHandler = false;
          });

        const selectedFiles = penRequestBatchStore().selectedFiles;
        if(!selectedFiles || difference(this.batchIDs.split(','), selectedFiles.map(file => file.penRequestBatchID)).length > 0) {
          this.retrieveSelectedFiles();
        }
      }else{
        this.searchLoading = false;
      }
    },
    initializePrbStudents(students, isFilterOperation) {
      if (isFilterOperation) {
        // reset
        this.setSelectedRecords([]);
      }

      students.forEach(rec => {
        rec.isSelected = this.isSelected(rec);
        rec.validationIssues = [];
      });

      formatPrbStudents(students);
      return students;
    },
    isSelected(rec) {
      const foundItem = this.selectedRecords?.find(item => item?.penRequestBatchStudentID === rec.penRequestBatchStudentID);
      return !!foundItem;
    },
    async prbStudentSearchCriteriaList(searchParams) {
      let optionalCriteriaList = [this.prbStudentStatusSearchCriteria];

      if(this.showSamePENAssigned){
        let students = await this.getSamePENStudents();
        if(students.length > 0){
          optionalCriteriaList.push({
            key: 'penRequestBatchStudentID',
            operation: SEARCH_FILTER_OPERATION.IN,
            value: students.join(','),
            valueType: SEARCH_VALUE_TYPE.UUID,
            condition: SEARCH_CONDITION.AND
          });
        }
      }

      const prbStudentSearchKeys = Object.keys(searchParams).filter(k => (searchParams[k] && searchParams[k].length !== 0));
      if (prbStudentSearchKeys && prbStudentSearchKeys.length > 0) {
        prbStudentSearchKeys.forEach(element => {
          let value  = searchParams[element];

          let operation = SEARCH_FILTER_OPERATION.STARTS_WITH_IGNORE_CASE;
          let valueType = SEARCH_VALUE_TYPE.STRING;
          if (element === 'dob') {
            value = value.replace(/\//g, '');
            valueType = SEARCH_VALUE_TYPE.STRING;
            operation = SEARCH_FILTER_OPERATION.EQUAL;
          } else if (element.includes('Name')) {
            operation = SEARCH_FILTER_OPERATION.STARTS_WITH;
          } else if (element === 'postalCode') {
            value = value.replace(/ +/g, '');
            operation = SEARCH_FILTER_OPERATION.EQUAL;
          } else if(element === 'genderCode' || element === 'gradeCode'|| element === 'assignedPEN') {
            operation = SEARCH_FILTER_OPERATION.EQUAL;
          } else if(element === 'mincode' || element === 'submissionNumber') {
            element = 'penRequestBatchEntity.' + element;
          }

          optionalCriteriaList.push({key: element, operation: operation, value: value, valueType: valueType, condition: SEARCH_CONDITION.AND});
        });
      }
      return [{
        searchCriteriaList: [this.prbStudentBatchIdSearchCriteria, ...optionalCriteriaList],
      }];

    },
    async retrievePenRequests(searchCriteria, isFilterOperation) {
      let crit = searchCriteria;
      if(_.isEmpty(searchCriteria)) {
        crit = await this.prbStudentSearchCriteriaList(this.prbStudentSearchParams);
      }

      const params = {
        params: {
          pageNumber: this.pageNumber-1,
          sort: {
            'penRequestBatchEntity.mincode': 'ASC',
            legalLastName: 'ASC',
            legalFirstName: 'ASC',
            legalMiddleNames: 'ASC'
          },
          searchQueries: crit,
        }
      };

      return ApiService.apiAxios
        .get(Routes['penRequestBatch'].STUDENTS_SEARCH_URL, params)
        .then(response => {
          if(response.data && response.data.content) {
            this.initializePrbStudents(response.data.content, isFilterOperation);
            this.setPrbStudentSearchResponse(response.data);
            const prbStudentIDs = response.data.content.map(prbStudent => prbStudent.penRequestBatchStudentID);
            return this.retrieveValidationIssuesByBatchStudentIDs(prbStudentIDs);
          }
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while loading the PEN requests. Please try again later.');
          console.log(error);
          throw error;
        });
    },
    retrieveValidationIssuesByBatchStudentIDs(prbStudentIDs) {
      const params = {
        params: {
          penRequestBatchStudentIDs: prbStudentIDs.join(','),
        }
      };

      return ApiService.apiAxios.get(Routes.penRequestBatch.ROOT_ENDPOINT + '/students/validation-issues', params)
        .then(response => {
          const validationIssues = response.data.reduce((result, issue) => {
            issue.dataFieldName = PEN_REQUEST_STUDENT_VALIDATION_FIELD_CODES_TO_STUDENT_DETAILS_FIELDS_MAPPER[issue.penRequestBatchValidationFieldCode];

            const prbStudentValidationIssues = result[issue.penRequestBatchStudentID];
            if(prbStudentValidationIssues) {
              prbStudentValidationIssues.push(issue);
            } else {
              result[issue.penRequestBatchStudentID] = [issue];
            }
            return result;
          }, {});
          this.prbStudentSearchResponse.content.forEach(prbStudent => {
            prbStudent.validationIssues = validationIssues[prbStudent.penRequestBatchStudentID] || [];
          });
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while loading the validation issues. Please try again later.');
          console.log(error);
          throw error;
        });
    },
    retrieveSelectedFiles() {
      const searchQueries = [
        {
          searchCriteriaList: [{
            key: 'penRequestBatchID', operation: SEARCH_FILTER_OPERATION.IN, value: this.batchIDs, valueType: SEARCH_VALUE_TYPE.UUID
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
          const auStore = penRequestBatchStore();
          response.data && auStore.setSelectedFiles(response.data.content);
        });
    },
  }
};
</script>

<style scoped>
  .header-divider {
    border-width: 0.35ex 0 0 0;
  }

  :deep(.v-data-table-footer){
    display: none;
  }
</style>
