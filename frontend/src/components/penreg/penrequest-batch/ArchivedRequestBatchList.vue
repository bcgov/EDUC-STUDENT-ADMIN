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
import {mapGetters, mapMutations, mapState} from 'vuex';
import PenRequestBatchDataTable from './PenRequestBatchDataTable';
import ApiService from '../../../common/apiService';
import alertMixin from '@/mixins/alertMixin';
import {
  PEN_REQ_BATCH_STATUS_CODES,
  Routes,
  SEARCH_CONDITION,
  SEARCH_FILTER_OPERATION,
  SEARCH_VALUE_TYPE
} from '@/utils/constants';
import {formatDateTime} from '@/utils/format';
import {compact, partialRight} from 'lodash';
import {deepCloneObject} from '@/utils/common';
import Mousetrap from 'mousetrap';
import router from '@/router';

export default {
  name: 'ArchivedRequestBatchList',
  mixins: [alertMixin],
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
        { text: 'Mincode', value: 'mincode', sortable: false, align: 'start', tooltip: 'Mincode' },
        { text: 'School Name', value: 'schoolName', sortable: false, tooltip: 'School Name' },
        { text: 'TOT', value: 'studentCount', sortable: false, countable: true, tooltip: 'Total Requests' },
        {text: 'MCH', value: 'matchedCount', sortable: false, countable: true, tooltip: 'Matched Requests'},
        {text: 'NEW', value: 'newPenCount', sortable: false, countable: true, tooltip: 'New PEN Issued'},
        {text: 'ERR', value: 'errorCount', sortable: false, countable: true, tooltip: 'Requests with errors'},
        {text: 'REP', value: 'repeatCount', sortable: false, countable: true, tooltip: 'Repeated Requests'},
        {text: 'FIX', value: 'fixableCount', sortable: false, countable: true, tooltip: 'Fixed Requests'},
        {text: 'SRCH', value: 'searchedCount', sortable: false, countable: true, tooltip: 'Searched Count'},
        {
          text: 'Load Date',
          value: 'extractDate',
          sortable: false,
          tooltip: 'Loaded Date',
          format: partialRight(formatDateTime, 'uuuu-MM-dd\'T\'HH:mm:ss', 'uuuu/MM/dd')
        },
        {text: 'SUB #', value: 'submissionNumber', sortable: false, tooltip: 'Submission Number'},
        {value: 'actions', sortable: false},
      ],
      loadingTable: false,
      isFilterOperation: false,
    };
  },
  mounted() {
    Mousetrap.bind('ctrl+b', () => {
      router.push({name: 'archivedRequestBatch'});
      return false;
    });
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
    notification(notificationData) {
      if (notificationData && notificationData.sagaStatus === 'COMPLETED' && notificationData.sagaName === 'PEN_REQUEST_BATCH_REPOST_REPORTS_SAGA') {
        const batchFile = this.penRequestBatchResponse.content?.find(batch => batch.penRequestBatchID === notificationData.penRequestBatchID);
        if(batchFile) {
          batchFile.sagaInProgress = false;
        }
      }
    },
  },
  computed: {
    ...mapState('archivedRequestBatch', ['selectedFiles', 'penRequestBatchResponse']),
    ...mapGetters('notifications', ['notification']),
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

      const statusCodeList = [PEN_REQ_BATCH_STATUS_CODES.ARCHIVED, PEN_REQ_BATCH_STATUS_CODES.REARCHIVED].join();
      return [
        {
          searchCriteriaList: [
            {key: 'penRequestBatchStatusCode', operation: 'in', value: statusCodeList, valueType: 'STRING'}
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
            extractDate: 'DESC',
            mincode: 'ASC'
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
    getSearchParam(paramName, paramValue, namePrefix) {
      let operation = SEARCH_FILTER_OPERATION.EQUAL;
      let valueType = SEARCH_VALUE_TYPE.STRING;
      if (!paramValue) {
        return null;
      }
      if (paramName === 'dob') {
        paramValue = paramValue.replace(/\//g, '');
      } else if (paramName === 'schoolName') {
        operation = SEARCH_FILTER_OPERATION.STARTS_WITH_IGNORE_CASE;
      } else if (paramName.includes('Name')) {
        operation = SEARCH_FILTER_OPERATION.STARTS_WITH;
      } else if (paramName === 'postalCode') {
        paramValue = paramValue.replace(/ +/g, '');
      } else if (paramName === 'load') {
        if (!paramValue.startDate && !paramValue.endDate) {
          return null;
        }

        paramName = 'extractDate';
        valueType = SEARCH_VALUE_TYPE.DATE_TIME;
        let startDate;
        let endDate;
        if (paramValue.startDate && paramValue.startDate.length === 8) { // it has reached here means it is a valid date
          startDate = `${paramValue.startDate.substring(0, 4)}-${paramValue.startDate.substring(4, 6)}-${paramValue.startDate.substring(6, 8)}T00:00:00`;
        } else {
          startDate = paramValue.startDate && `${paramValue.startDate.replace(/\//g, '-')}T00:00:00`;
        }
        if (paramValue.endDate && paramValue.endDate.length === 8) { // it has reached here means it is a valid date
          endDate = `${paramValue.endDate.substring(0, 4)}-${paramValue.endDate.substring(4, 6)}-${paramValue.endDate.substring(6, 8)}T23:59:59`;
        } else {
          endDate = paramValue.endDate && `${paramValue.endDate.replace(/\//g, '-')}T23:59:59`;
        }

        if (startDate && !endDate) {
          operation = SEARCH_FILTER_OPERATION.GREATER_THAN_OR_EQUAL_TO;
          paramValue = startDate;
        } else if (!startDate && endDate) {
          operation = SEARCH_FILTER_OPERATION.LESS_THAN_OR_EQUAL_TO;
          paramValue = endDate;
        } else {
          operation = SEARCH_FILTER_OPERATION.BETWEEN;
          paramValue = `${startDate},${endDate}`;
        }
      } else if(paramName === 'mincode' || paramName === 'submissionNumber') {
        operation = SEARCH_FILTER_OPERATION.STARTS_WITH;
      }
      return ({key: namePrefix ? `${namePrefix}.${paramName}` : paramName, operation, value: paramValue, valueType, condition: SEARCH_CONDITION.AND});
    }
  }
};
</script>
