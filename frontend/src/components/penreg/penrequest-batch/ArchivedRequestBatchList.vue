<template>
  <PenRequestBatchDataTable
    :headers="headers"
    :penRequestBatchResponse="penRequestBatchResponse"
    :batchPageNumber.sync="pageNumber"
    :loadingTable="loadingTable"
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
import { deepCloneObject } from '../../../utils/common';

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
    reloading: {
      type: Boolean,
      required: false
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
        { text: 'SRCH', value: 'searchedCount', sortable: false, countable: true },
        { text: 'Load Date', value: 'extractDate', sortable: false, format: partialRight(formatDateTime,'uuuu-MM-dd\'T\'HH:mm:ss', 'uuuu/MM/dd') },
        { text: 'SUB #', value: 'submissionNumber', sortable: false },
      ],
      loadingTable: true,
      isFilterOperation: false,
    };
  },
  watch: {
    pageNumber: {
      handler() {
        this.pagination();
      }
    },
    searchParams: {
      handler() {
        this.isFilterOperation = true;
        if (this.pageNumber === 1) {
          this.pagination();
        } else {
          this.pageNumber = 1;
        } 
      }
    },
    reloading: {
      handler(v) {
        if(v) {
          this.pagination();
        }
      }
    },
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
      const searchCriteriaList = compact(Object.entries(this.searchParams.prbStudent).map(([paramName, paramValue]) => 
        this.getSearchParam(paramName, paramValue, 'penRequestBatchStudentEntities'))
      );
      searchCriteriaList.push(...compact(Object.entries(this.searchParams).filter(([paramName]) => 
        paramName !== 'prbStudent'
      ).map(([paramName, paramValue]) => 
        this.getSearchParam(paramName, paramValue))
      ));
      
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
  methods: {
    ...mapMutations('archivedRequestBatch', ['setSelectedFiles', 'setPenRequestBatchResponse', 'setCurrentBatchFileSearchParams']),
    initializeFiles(files) {
      if (this.isFilterOperation) {
        // reset
        this.setSelectedFiles();
        this.isFilterOperation = false;
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
    pagination() {
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
            this.initializeFiles(response.data.content);
            this.setPenRequestBatchResponse(response.data);
            this.setCurrentBatchFileSearchParams(deepCloneObject(this.searchParams));
          }
        })
        .catch(error => {
          console.log(error);
          this.$emit('failure-alert', 'An error occurred while loading the file list. Please try again later.');
        })
        .finally(() => {
          this.loadingTable = false;
          this.$emit('table-load');
        });
    },
    getSearchParam(paramName, paramValue, namePrefix) {
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
        if (!paramValue.startDate && !paramValue.endDate) {
          return null;
        }

        paramName = 'extractDate';
        valueType = SEARCH_VALUE_TYPE.DATE_TIME;
        const startDate = paramValue.startDate && `${paramValue.startDate.replace(/\//g, '-')}T00:00:00`;
        const endDate = paramValue.endDate && `${paramValue.endDate.replace(/\//g, '-')}T23:59:59`;

        if(startDate && !endDate) {
          operation = SEARCH_FILTER_OPERATION.GREATER_THAN_OR_EQUAL_TO;
          paramValue = startDate;
        } else if(!startDate && endDate) {
          operation = SEARCH_FILTER_OPERATION.LESS_THAN_OR_EQUAL_TO;
          paramValue = endDate;
        } else {
          operation = SEARCH_FILTER_OPERATION.BETWEEN;
          paramValue = `${startDate},${endDate}`;
        }
      } else if(paramName === 'mincode') {
        operation = SEARCH_FILTER_OPERATION.STARTS_WITH;
      }
      return ({key: namePrefix ? `${namePrefix}.${paramName}` : paramName, operation, value: paramValue, valueType, condition: SEARCH_CONDITION.AND});
    }
  }
};
</script>
