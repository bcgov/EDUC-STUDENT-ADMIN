<template>
  <PenRequestBatchDataTable
    :headers="headers"
    :penRequestBatchResponse="penRequestBatchResponse"
    :batchPageNumber.sync="pageNumber"
    :loadingTable="loadingTable || loadingFiles"
    archived
  ></PenRequestBatchDataTable>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import PenRequestBatchDataTable from './PenRequestBatchDataTable';
import ApiService from '../../../common/apiService';
import {Routes, SEARCH_FILTER_OPERATION, SEARCH_CONDITION, SEARCH_VALUE_TYPE} from '../../../utils/constants';
import {formatMincode, formatDateTime} from '../../../utils/format';
import {compact, partialRight} from 'lodash';

export default {
  name: 'ArchivedRequestBatchList',
  components: {
    PenRequestBatchDataTable,
  },
  props: {
    searchParams: {
      type: Object,
      required: true
    },
    loadingFiles: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      itemsPerPage: 15,
      headers: [
        { value: 'rowSelect', type: 'select', sortable: false },
        { text: 'Mincode', value: 'mincode', sortable: false, align: 'start', format: formatMincode },
        { text: 'School Name', value: 'schoolName', sortable: false },
        { text: 'TOT', value: 'studentCount', sortable: false, countable: true },
        { text: 'MCH', value: 'matchedCount', sortable: false, countable: true },
        { text: 'NEW', value: 'newPenCount', sortable: false, countable: true },
        { text: 'ERR', value: 'errorCount', sortable: false, countable: true },
        { text: 'REP', value: 'repeatCount', sortable: false, countable: true },
        { text: 'FIX', value: 'fixableCount', sortable: false, countable: true },
        { text: 'SRCH', value: 'filteredCount', sortable: false, countable: true },
        { text: 'Load Date', value: 'extractDate', sortable: false, format: partialRight(formatDateTime,'uuuu-MM-dd\'T\'HH:mm:ss', 'uuuu/MM/dd') },
        { text: 'SUB #', value: 'submissionNumber', sortable: false },
      ],
      loadingTable: true,
    };
  },
  watch: {
    pageNumber: {
      handler() {
        this.pagination(false);
      }
    },
    loadingFiles: {
      handler(v) {
        if(!v) {
          this.pagination(false);
        }
      }
    }
  },
  computed: {
    ...mapState('archivedRequestBatch', ['selectedFiles', 'penRequestBatchResponse']),
    pageNumber: {
      get(){
        return this.$store.state['archivedRequestBatch'].pageNumber;
      },
      set(newPage){
        return this.$store.state['archivedRequestBatch'].pageNumber = newPage;
      }
    },
    countableHeaders() {
      return this.headers.filter(header => header.countable);
    },
    searchCriteria() {
      const searchCriteriaList = compact(Object.entries(this.searchParams).map(([paramName, paramValue]) => {
        let operation = SEARCH_FILTER_OPERATION.EQUAL;
        let valueType = SEARCH_VALUE_TYPE.STRING;
        if (!paramValue) {
          return null;
        }

        if (paramName === 'dob') {
          paramValue = paramValue.replace(/\//g, '');
        } else if (paramName.includes('Name')) {
          operation = SEARCH_FILTER_OPERATION.STARTS_WITH_IGNORE_CASE;
        } else if (paramName === 'postalCode') {
          paramValue = paramValue.replace(/ +/g, '');
        } else if (paramName === 'load') {
          if (!paramValue.startDate) {
            return null;
          }
          let endDate = paramValue.endDate || paramValue.startDate;
          paramName = 'extractDate';
          paramValue = `${paramValue.startDate.replace(/\//g, '-')}T00:00:00,${endDate.replace(/\//g, '-')}T23:59:59`;
          operation = SEARCH_FILTER_OPERATION.BETWEEN;
          valueType = SEARCH_VALUE_TYPE.DATE_TIME;
        } else if(paramName === 'mincode') {
          operation = SEARCH_FILTER_OPERATION.STARTS_WITH;
        }

        return ({key: paramName, operation, value: paramValue, valueType, condition: SEARCH_CONDITION.AND});
      }));
      
      return [
        { 
          searchCriteriaList: [
            {key: 'penRequestBatchStatusCode', operation: 'eq', value: 'ARCHIVED', valueType: 'STRING'}
          ]
        },
        { 
          condition: 'AND', 
          searchCriteriaList
        },
      ];
    },
  },
  created(){
    this.setSelectedFiles();
    this.pagination(true);
  },
  methods: {
    ...mapMutations('archivedRequestBatch', ['setSelectedFiles', 'setPenRequestBatchResponse']),
    initializeFiles(files, isFilterOperation) {
      if (isFilterOperation) {
        // reset
        this.setSelectedFiles([]);
      }
      
      files.forEach(file => {
        file.isSelected = this.isSelected(file);
        this.countableHeaders.forEach(header => file[header.value] = +file[header.value]);
      });

      return files;
    },
    isSelected(file) {
      const foundItem = this.selectedFiles?.find(item => item?.penRequestBatchID === file.penRequestBatchID);
      return !!foundItem;
    },
    pagination(isFilterOperation) {
      this.loadingTable = true;
      const req = {
        params: {
          pageNumber: this.pageNumber-1,
          pageSize: this.itemsPerPage,
          sort: {
            mincode: 'ASC',
            submissionNumber: 'ASC'
          },
          searchQueries: this.searchCriteria
        }
      };

      ApiService.apiAxios
        .get(Routes.penRequestBatch.FILES_URL, req)
        .then(response => {
          if (response.data && response.data.content) {
            this.initializeFiles(response.data.content, isFilterOperation);
            this.setPenRequestBatchResponse(response.data);
          }
        })
        .catch(error => {
          console.log(error);
          this.$emit('failure-alert', 'An error occurred while loading the file list. Please try again later.');
        })
        .finally(() => (this.loadingTable = false));
    },
  }
};
</script>
