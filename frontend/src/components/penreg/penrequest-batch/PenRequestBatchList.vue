<template>
  <PenRequestBatchDataTable
    :headers="headers"
    :penRequestBatchResponse="penRequestBatchResponse"
    :batchPageNumber.sync="pageNumber"
    :loadingTable="loadingTable || loadingFiles"
    pageCommands
    @select-filter="selectFilter"
    :inProgressSagaIDs="inProgressSagaIDs"
  ></PenRequestBatchDataTable>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import PenRequestBatchDataTable from './PenRequestBatchDataTable';
import ApiService from '../../../common/apiService';
import {Routes, PEN_REQ_BATCH_STATUS_CODES} from '@/utils/constants';
import filtersMixin from '@/mixins/filtersMixin';
import alertMixin from '../../../mixins/alertMixin';
import {getSearchParam} from '@/utils/penrequest-batch/search';
import {deepCloneObject} from '@/utils/common';
import {formatDateTime} from '@/utils/format';

export default {
  name: 'PenRequestBatchList',
  mixins: [alertMixin, filtersMixin],
  components: {
    PenRequestBatchDataTable,
  },
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
        { value: 'rowSelect', type: 'select', sortable: false },
        { text: 'Mincode', value: 'mincode', sortable: false, align: 'start', tooltip: 'Mincode' },
        { text: 'School Name', value: 'schoolName', sortable: false, tooltip: 'School Name' },
        { text: 'TOT', value: 'studentCount', sortable: false, countable: true, tooltip: 'Total Requests' },
        { text: 'MCH', value: 'matchedCount', sortable: false, filterName: 'Matched', countable: true, isFiltered: false, tooltip: 'Matched Requests' },
        { text: 'NEW', value: 'newPenCount', sortable: false, filterName: 'New PENs', countable: true, isFiltered: false, tooltip: 'New PEN Issued' },
        { text: 'ERR', value: 'errorCount', sortable: false, filterName: 'Errors', countable: true, isFiltered: false, tooltip: 'Requests with errors' },
        { text: 'REP', value: 'repeatCount', sortable: false, filterName: 'Repeated', countable: true, isFiltered: false, tooltip: 'Repeated Requests' },
        { text: 'FIX', value: 'fixableCount', sortable: false, filterName: 'Fixable', countable: true, isFiltered: false, tooltip: 'Fixable Requests' },
        { text: 'DUP', value: 'duplicateCount', sortable: false, filterName: 'Duplicates', countable: true, isFiltered: false, tooltip: 'Duplicate Requests' },
        { text: 'FLT', value: 'filteredCount', sortable: false, countable: true, tooltip: 'Filtered Item Count' },
        {
          text: 'Load Date',
          value: 'extractDate',
          sortable: false,
          tooltip: 'Loaded Date',
          format: _.partialRight(formatDateTime, 'uuuu-MM-dd\'T\'HH:mm:ss', 'uuuu/MM/dd')
        },
        { text: 'Submission', value: 'submissionNumber', sortable: false, tooltip: 'Submission Number' },
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
      handler() {
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
    ...mapState('penRequestBatch', ['prbStudentStatusFilters', 'selectedFiles', 'penRequestBatchResponse']),
    pageNumber: {
      get(){
        return this.$store.state['penRequestBatch'].pageNumber;
      },
      set(newPage){
        return this.$store.state['penRequestBatch'].pageNumber = newPage;
      }
    },
    countableHeaders() {
      return this.headers.filter(header => header.countable);
    },
    searchCriteria() {
      const statusCriteriaList = this.prbStudentStatusFilters.map(statusCriteria => ({key: statusCriteria, operation: 'gt', value: 0, valueType: 'LONG', condition: 'OR'}));
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
    ...mapMutations('penRequestBatch', ['setSelectedFiles', 'setPrbStudentStatusFilters', 'setPenRequestBatchResponse', 'setCurrentBatchFileSearchParams']),
    initializeFilters() {
      if(this.prbStudentStatusFilters?.length > 0) {
        const filterNames = this.prbStudentStatusFilters.map(filter => this.headers.find(header => header.value === filter)?.filterName);
        this.filters.splice(0, this.filters.length, ...filterNames);
      } else {
        this.filters.splice(0);
        this.filters.push('Fixable');
      }
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
