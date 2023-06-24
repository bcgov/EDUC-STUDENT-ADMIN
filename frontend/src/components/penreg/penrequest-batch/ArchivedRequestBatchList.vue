<template>
  <PenRequestBatchDataTable
    v-model:batch-page-number="pageNumber"
    :headers="headers"
    :pen-request-batch-response="penRequestBatchResponse"
    :loading-table="loadingTable"
    archived
  />
</template>

<script>
import {mapActions, mapState} from 'pinia';
import PenRequestBatchDataTable from './PenRequestBatchDataTable.vue';
import ApiService from '../../../common/apiService';
import alertMixin from '@/mixins/alertMixin';
import {
  PEN_REQ_BATCH_STATUS_CODES,
  Routes,
} from '@/utils/constants';
import {formatDateTime} from '@/utils/format';
import {compact, partialRight} from 'lodash';
import {deepCloneObject} from '@/utils/common';
import Mousetrap from 'mousetrap';
import router from '@/router';
import {getSearchParam} from '@/utils/penrequest-batch/search';
import {notificationsStore} from '@/store/modules/notifications';
import {archivedRequestBatchStore} from '@/store/modules/archivedRequestBatch';

export default {
  name: 'ArchivedRequestBatchList',
  components: {
    PenRequestBatchDataTable,
  },
  mixins: [alertMixin],
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
  mounted() {
    Mousetrap.bind('ctrl+b', () => {
      router.push({name: 'archivedRequestBatch'});
      return false;
    });
  },
  computed: {
    ...mapState(archivedRequestBatchStore, ['selectedFiles', 'penRequestBatchResponse']),
    ...mapState(notificationsStore, ['notification']),
    pageNumber: {
      get(){
        return archivedRequestBatchStore().pageNumber;
      },
      set(newPage){
        return archivedRequestBatchStore().setPageNumber(newPage);
      }
    },
    countableHeaders() {
      return this.headers.filter(header => header.countable);
    },
    searchCriteria() {
      const searchCriteriaList = compact(Object.entries(this.searchParams.prbStudent).map(([paramName, paramValue]) =>
        getSearchParam(paramName, paramValue, 'penRequestBatchStudentEntities'))
      );
      searchCriteriaList.push(...compact(Object.entries(this.searchParams).filter(([paramName]) =>
        paramName !== 'prbStudent'
      ).map(([paramName, paramValue]) =>
        getSearchParam(paramName, paramValue))
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
    ...mapActions(archivedRequestBatchStore, ['setSelectedFiles', 'setPenRequestBatchResponse', 'setCurrentBatchFileSearchParams']),
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
  }
};
</script>
