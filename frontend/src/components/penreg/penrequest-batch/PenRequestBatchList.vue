<template>
  <PenRequestBatchDataTable
    :batch-page-number="pageNumber"
    :headers="headers"
    :pen-request-batch-response="penRequestBatchResponse"
    :loading-table="loadingTable || loadingFiles"
    page-commands
    :in-progress-saga-i-ds="inProgressSagaIDs"
    @select-filter="selectFilter"
    @update:batch-page-number="updatePage"
  />
</template>

<script>
import { mapActions, mapState } from 'pinia';
import PenRequestBatchDataTable from './PenRequestBatchDataTable.vue';
import ApiService from '../../../common/apiService';
import {Routes, PEN_REQ_BATCH_STATUS_CODES} from '@/utils/constants';
import alertMixin from '../../../mixins/alertMixin';
import {getSearchParam} from '@/utils/penrequest-batch/search';
import {deepCloneObject} from '@/utils/common';
import {formatDateTime} from '@/utils/format';
import {penRequestBatchStore} from '@/store/modules/penRequestBatch';
import _ from 'lodash';

export default {
  name: 'PenRequestBatchList',
  emits: ['table-load','update:filters'],
  components: {
    PenRequestBatchDataTable,
  },
  mixins: [alertMixin],
  props: {
    schoolGroup: {
      type: String,
      required: true
    },
    searchParams: {
      type: Object,
      required: false,
      default: () => ({})
    },
    filters: {
      type: Array,
      required: true
    },
    loadingFiles: {
      type: Boolean,
      required: true
    },
    inProgressSagaIDs: {
      type: Array
    }
  },
  data () {
    return {
      itemsPerPage: 15,
      headers: [
        { title: '', value: 'rowSelect', key: 'rowSelect', type: 'select', sortable: false },
        { title: 'Mincode', text: 'Mincode', value: 'mincode', key: 'mincode', sortable: false, align: 'start', tooltip: 'Mincode' },
        { title: 'School Name', text: 'School Name', value: 'schoolName', key: 'schoolName', sortable: false, tooltip: 'School Name' },
        { title: 'TOT', text: 'TOT', value: 'studentCount', key: 'studentCount', sortable: false, countable: true, tooltip: 'Total Requests' },
        { title: 'MCH', text: 'MCH', value: 'matchedCount', key: 'matchedCount', sortable: false, filterName: 'Matched', countable: true, isFiltered: false, tooltip: 'Matched Requests' },
        { title: 'NEW', text: 'NEW', value: 'newPenCount', key: 'newPenCount', sortable: false, filterName: 'New PENs', countable: true, isFiltered: false, tooltip: 'New PEN Issued' },
        { title: 'ERR', text: 'ERR', value: 'errorCount', key: 'errorCount', sortable: false, filterName: 'Errors', countable: true, isFiltered: false, tooltip: 'Requests with errors' },
        { title: 'REP', text: 'REP', value: 'repeatCount', key: 'repeatCount', sortable: false, filterName: 'Repeated', countable: true, isFiltered: false, tooltip: 'Repeated Requests' },
        { title: 'FIX', text: 'FIX', value: 'fixableCount', key: 'fixableCount', sortable: false, filterName: 'Fixable', countable: true, isFiltered: false, tooltip: 'Fixable Requests' },
        { title: 'DUP', text: 'DUP', value: 'duplicateCount', key: 'duplicateCount', sortable: false, filterName: 'Duplicates', countable: true, isFiltered: false, tooltip: 'Duplicate Requests' },
        { title: 'FLT', text: 'FLT', value: 'filteredCount', key: 'filteredCount', sortable: false, countable: true, tooltip: 'Filtered Item Count' },
        {
          title: 'Load Date',
          text: 'Load Date',
          value: 'extractDate',
          key: 'extractDate',
          sortable: false,
          tooltip: 'Loaded Date',
          format: _.partialRight(formatDateTime, 'uuuu-MM-dd\'T\'HH:mm:ss', 'uuuu/MM/dd')
        },
        { title: 'Submission', text: 'Submission', value: 'submissionNumber', key: 'submissionNumber', sortable: false, tooltip: 'Submission Number' },
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
    filters: {
      immediate: true,
      handler() {
        console.log('headers: ' + JSON.stringify(this.filters));
        this.setPrbStudentStatusFilters(this.selectFilters(this.headers, 'value'));
        this.reloadTable();
      }
    },
    schoolGroup: {
      handler() {
        this.initializeFilters();
      }
    },
    searchParams: {
      handler() {
        this.reloadTable();
      }
    },
    loadingFiles: {
      handler(v) {
        if(!v) {
          this.pagination();
        }
      }
    }
  },
  computed: {
    ...mapState(penRequestBatchStore, ['prbStudentStatusFilters', 'selectedFiles', 'penRequestBatchResponse']),
    pageNumber: {
      get(){
        return penRequestBatchStore().pageNumber;
      },
      set(newPage){
        penRequestBatchStore().pageNumber = newPage;
        return newPage;
      }
    },
    countableHeaders() {
      return this.headers.filter(header => header.countable);
    },
    searchCriteria() {
      const statusCriteriaList = this.prbStudentStatusFilters?.map(statusCriteria => ({key: statusCriteria, operation: 'gt', value: 0, valueType: 'LONG', condition: 'OR'}));
      const statusCodeList = [PEN_REQ_BATCH_STATUS_CODES.ACTIVE, PEN_REQ_BATCH_STATUS_CODES.UNARCHIVED, PEN_REQ_BATCH_STATUS_CODES.UNARCH_CHG].join();
      const searchParamCriteriaList = _.compact(Object.entries(this.searchParams).map(([paramName, paramValue]) =>
        getSearchParam(paramName, paramValue))
      );
      return [
        {
          searchCriteriaList: [
            {key: 'schoolGroupCode', operation: 'eq', value: this.schoolGroup, valueType: 'STRING'},
            {key: 'penRequestBatchStatusCode', operation: 'in', value: statusCodeList, valueType: 'STRING', condition: 'AND'},
            ...searchParamCriteriaList
          ]
        },
        {
          condition: 'AND',
          searchCriteriaList: statusCriteriaList
        },
      ];
    },
  },
  created(){
    this.setSelectedFiles();
    this.initializeFilters();
  },
  methods: {
    ...mapActions(penRequestBatchStore, ['setSelectedFiles', 'setPrbStudentStatusFilters', 'setPenRequestBatchResponse', 'setCurrentBatchFileSearchParams']),
    initializeFilters() {
      if(this.prbStudentStatusFilters?.length > 0) {
        const filterNames = this.prbStudentStatusFilters.map(filter => this.headers.find(header => header.value === filter)?.filterName);
        this.filters.splice(0, this.filters.length, ...filterNames);
      } else {
        this.filters.splice(0);
        this.filters.push('Fixable');
      }
    },
    async selectFilter(header) {
      console.log('Here ' + JSON.stringify(header));
      if(header.isFiltered) {
        this.filters.push(header.filterName);
      } else {
        const index = this.filters.findIndex(filter => filter === header.filterName);
        this.filters.splice(index, 1);
      }

      console.log('filters ' + JSON.stringify(this.filters));
      this.$emit('update:filters', this.filters);
    },
    selectFilters(headers, filterValueField) {
      let statusFilters = [];
      headers.filter(header => !!header.filterName).forEach(header => {
        header.isFiltered = this.filters.some(filter => filter === header.filterName);
        if(header.isFiltered) {
          statusFilters.push(header[filterValueField]);
        }
      });
      return statusFilters;
    },
    updatePage(newPage){
      this.pageNumber = newPage;
    },
    initializeFiles(files) {
      let activeFile = files?.find(f => f.penRequestBatchStatusCode === PEN_REQ_BATCH_STATUS_CODES.ACTIVE);
      activeFile && (activeFile.firstActiveFile = true);

      if (this.isFilterOperation) {
        // reset
        this.setSelectedFiles([]);
        this.isFilterOperation = false;
      }

      files.forEach(file => {
        file.isSelected = this.isSelected(file);
        this.countableHeaders.forEach(header => file[header.value] = +file[header.value]);
        file.filteredCount = this.headers.reduce((sum, header) =>
          header.isFiltered ? sum + file[header.value] : sum
        , 0);
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
            penRequestBatchStatusCode: 'DESC',
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
          this.setFailureAlert('An error occurred while loading the file list. Please try again later.');
        })
        .finally(() => {
          this.loadingTable = false;
          this.$emit('table-load');
        });
    },
    reloadTable() {
      this.isFilterOperation = true;
      if (this.pageNumber === 1) {
        this.pagination();
      } else {
        this.pageNumber = 1;
      }
    },
  }
};
</script>
