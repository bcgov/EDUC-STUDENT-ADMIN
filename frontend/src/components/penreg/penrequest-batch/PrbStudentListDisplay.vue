<template>
  <v-container fluid class="full-height px-0 mb-4">
    <v-form ref="prbStudentSearchForm" id="prbStudentSearchForm"
      v-model="validForm"
    >
      <v-container fluid class="fill-height px-0">
        <v-row no-gutters>
          <v-card elevation="0" height="100%" width="100%" style="background-color:white;">
            <PenRequestSearchPanel
              :searchParams="prbStudentSearchParams"
              :loading="searchLoading"
              :disabled="!searchEnabled"
              @searchByPen="searchPenRequestsByPen"
              @search="searchPenRequests"
            ></PenRequestSearchPanel>
            <v-progress-linear
              indeterminate
              color="blue"
              :active="searchLoading && !prbStudentSearchResponse"
            ></v-progress-linear>
            <v-row v-if="prbStudentSearchResponse" no-gutters class="py-2" style="background-color:white;">
              <v-divider class="mx-3 header-divider"/>
            </v-row>
            <v-row v-if="prbStudentSearchResponse" id="resultsRow" no-gutters class="py-2" style="background-color:white;">
              <PrbStudentSearchResults
                :loading="searchLoading"
                :archived="archived"
              ></PrbStudentSearchResults>
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
  SEARCH_VALUE_TYPE
} from '@/utils/constants';
import {mapMutations, mapState} from 'vuex';
import PrbStudentSearchResults from './PrbStudentSearchResults';
import {formatPrbStudents} from '@/utils/penrequest-batch/format';
import alertMixin from '../../../mixins/alertMixin';
import {difference} from 'lodash';
import Mousetrap from 'mousetrap';
import router from '@/router';
import PenRequestSearchPanel from '@/components/common/PenRequestSearchPanel';

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
    ...mapState('prbStudentSearch', ['pageNumber', 'selectedRecords', 'prbStudentSearchResponse', 'selectedStudentStatus', 'currentPrbStudentSearchParams', 'prbStudentSearchCriteria']),
    prbStudentSearchParams: {
      get(){
        return this.$store.state['prbStudentSearch'].prbStudentSearchParams;
      },
      set(newPage){
        return this.$store.state['prbStudentSearch'].prbStudentSearchParams = newPage;
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
    this.$store.dispatch('penRequestBatch/getCodes');
    this.setSelectedRecords();
    this.initialSearch();
  },
  methods: {
    ...mapMutations('prbStudentSearch', ['setPageNumber', 'setSelectedRecords', 'setPrbStudentSearchResponse', 'clearPrbStudentSearchParams', 'setCurrentPrbStudentSearchParams', 'setPrbStudentSearchCriteria']),
    searchPenRequestsByPen([field, pen]){
      this.clearPrbStudentSearchParams();
      this.prbStudentSearchParams[field] = pen;
      this.searchPenRequests();
    },
    searchHasValues(){
      this.searchEnabled = Object.values(this.prbStudentSearchParams).some(v => !!v);
      return this.searchEnabled;
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
    searchPenRequests(initial = false) {
      this.searchLoading = true;
      this.prbStudentSearchResultsKey += 1; //forces prbStudentSearchResults to rerender and update curPage
      this.disablePageHandler=true;
      this.setPageNumber(1);

      if(initial || (this.$refs.prbStudentSearchForm.validate() && this.searchHasValues())) {
        const searchCriteria = this.prbStudentSearchCriteriaList(this.prbStudentSearchParams);
        this.retrievePenRequests(searchCriteria, true)
          .then(() => {
            this.setCurrentPrbStudentSearchParams(JSON.parse(JSON.stringify(this.prbStudentSearchParams)));
            this.setPrbStudentSearchCriteria(searchCriteria);
          })
          .finally(() => {
            this.searchLoading = false;
            this.disablePageHandler = false;
          });

        const selectedFiles = this.$store.state[this.penRequestBatchStore].selectedFiles;
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
      });

      formatPrbStudents(students);
      return students;
    },
    isSelected(rec) {
      const foundItem = this.selectedRecords?.find(item => item?.penRequestBatchStudentID === rec.penRequestBatchStudentID);
      return !!foundItem;
    },
    prbStudentSearchCriteriaList(searchParams) {
      let optionalCriteriaList = [this.prbStudentStatusSearchCriteria];

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
    retrievePenRequests(searchCriteria, isFilterOperation) {
      const params = {
        params: {
          pageNumber: this.pageNumber-1,
          sort: {
            'penRequestBatchEntity.mincode': 'ASC',
            legalLastName: 'ASC',
            legalFirstName: 'ASC',
            legalMiddleNames: 'ASC'
          },
          searchQueries: searchCriteria || this.prbStudentSearchCriteriaList(this.prbStudentSearchParams),
        }
      };

      return ApiService.apiAxios
        .get(Routes['penRequestBatch'].STUDENTS_SEARCH_URL, params)
        .then(response => {
          response.data && response.data.content && this.initializePrbStudents(response.data.content, isFilterOperation);
          this.setPrbStudentSearchResponse(response.data);
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while loading the PEN requests. Please try again later.');
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
          response.data && this.$store.commit(`${this.penRequestBatchStore}/setSelectedFiles`, response.data.content);
        });
    },
  }
};
</script>

<style scoped>
  .header-divider {
    border-width: 0.35ex 0 0 0;
  }
</style>
