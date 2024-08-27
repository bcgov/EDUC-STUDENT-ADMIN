<template>
  <v-row no-gutters>
    <v-col cols="4">
      <v-select
        id="reportListDropdown"
        v-model="selectedReport"
        class="pt-0"
        label="Select Report"
        variant="outlined"
        :items="reportList"
        item-title="label"
        return-object
      />
    </v-col>
    <v-col
      v-if="(reportData !== null || displayAllStudents) && selectedReport?.csvDownloadURL"
      class="mt-4 ml-4"
    >
      <router-link
        id="downloadReport"
        :to="{ path: selectedReport.csvDownloadURL + collectionID}"
        target="_blank"
      >
        <v-icon>mdi-tray-arrow-down</v-icon>
        Download CSV
      </router-link>
    </v-col>
  </v-row>

  <v-row
    v-if="displayAllStudents || reportData !== null"
    no-gutters
  >
    <v-col>
      <v-text-field
        v-model="search"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        clearable
        hide-details
        single-line
      />
    </v-col>
  </v-row>

  <v-row v-if="reportData === null && isLoading && !displayAllStudents">
    <v-col>
      <Spinner />
    </v-col>
  </v-row>
  <v-row v-if="!displayAllStudents && reportData !== null">
    <v-col>
      <v-data-table
        id="dataTable"
        :search="search"
        :headers="headers"
        :items="reportData"
        items-per-page="10"
        class="elevation-1 rounded"
        mobile-breakpoint="0"
      />
    </v-col>
  </v-row>
  <v-row v-if="displayAllStudents">
    <v-col>
      <CustomTableSlice
        :headers="config"
        :data="studentList"
        :total-elements="totalElements"
        :is-loading="isLoading"
        :can-load-next="canLoadNext"
        :can-load-previous="canLoadPrevious"
        @loadNext="loadNext"
        @loadPrevious="loadPrevious"
      />
    </v-col>
  </v-row>
  <v-row>
    <v-col v-if="selectedReport?.reportID === 'FUNDING_POLICY_REPORT_INDY'">
      <FundingPolicyReport
        :collection-object="collectionObject"
        :collection-type="selectedReport?.reportID"
      />
    </v-col>
    <v-col v-if="selectedReport?.reportID === 'FUNDING_POLICY_REPORT_DISTRICT'">
      <FundingPolicyReport
        :collection-object="collectionObject"
        :collection-type="selectedReport?.reportID"
      />
    </v-col>
  </v-row>
</template>

<script>

import ApiService from '@/common/apiService';
import alertMixin from '@/mixins/alertMixin';
import Spinner from '@/components/common/Spinner.vue';
import {MIN_REPORTS} from '@/utils/sdc/collectionTableConfiguration.js';
import CustomTableSlice from '@/components/common/CustomTableSlice.vue';
import {Routes} from '@/utils/constants';
import {isEmpty, omitBy} from 'lodash';
import FundingPolicyReport from './FundingPolicyReports.vue';

export default {
  name: 'ReportSection',
  components: {FundingPolicyReport, Spinner, CustomTableSlice},
  mixins: [alertMixin],
  props: {
    reportList: {
      required: true,
      type: Array,
      default: null
    },
    collectionObject: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      selectedReport: null,
      reportData: null,
      search: null,
      isLoading: false,
      headers: [],
      collectionID: this.$route.params.collectionID,
      displayAllStudents: false,
      allStudentsView: ['FSA Registration Report'],
      filterSearchParams: {
        notSdcSchoolCollectionStudentStatusCode: 'ERROR,DELETED',
        moreFilters: {},
        grade: ''
      },
      pageNumber: 1,
      pageSize: 15,
      studentList: [],
      totalElements: 0,
      canLoadNext: false,
      canLoadPrevious: false,
      config: null
    };
  },
  watch: {
    selectedReport() {
      this.displayAllStudents = false;
      if(this.allStudentsView.includes(this.selectedReport.label)) {
        this.reportData = null;
        this.loadHeaders(this.selectedReport.label);
        if(this.displayAllStudents) {
          this.loadStudents();
        }
      } else if (this.selectedReport.reportID === 'FUNDING_POLICY_REPORT_INDY' || this.selectedReport.reportID === 'FUNDING_POLICY_REPORT_DISTRICT') {
        this.displayAllStudents = false;
        this.reportData = null;
      } else {
        this.getReportData();
      }
    }
  },
  methods: {
    async getReportData() {
      this.isLoading = true;
      this.reportData = null;

      await ApiService.apiAxios.get(this.selectedReport.url + this.collectionID).then(response => {
        this.reportData = response.data.rows;
        this.headers = [];
        response?.data?.headers?.forEach(header => {
          let formattedHeader =
            {
              title: header,
              text: header,
              value: header,
              key: header,
              align: 'start'
            };
          this.headers.push(formattedHeader);
        });
      })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while retrieving report information. Please try again later.');
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    loadStudents() {
      this.isLoading = true;
      ApiService.apiAxios.get(`${Routes.sdc.BASE_URL}/collection/${this.collectionID}/students-paginated-slice?tableFormat=true`, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          searchParams: omitBy(this.filterSearchParams, isEmpty),
          sort: {
            legalLastName: 'ASC'
          },
        }
      }).then(response => {
        this.studentList = response.data.content;
        this.canLoadNext = response.data.last === false;
        this.canLoadPrevious = response.data.first === false;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while trying to retrieve students list. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      });
    },
    loadHeaders(label) {
      if(label === 'FSA Registration Report') {
        if(this.collectionObject?.collectionTypeCode === 'FEBRUARY') {
          this.config = MIN_REPORTS.fsaReportHeadersforFeb;
          this.filterSearchParams.grade = 'FSA_FEB_GRADE';
          this.displayAllStudents = true;
        } else if(this.collectionObject?.collectionTypeCode === 'SEPTEMBER') {
          this.config = MIN_REPORTS.fsaReportHeadersforSept;
          this.filterSearchParams.grade = 'FSA_SEP_GRADE';
          this.displayAllStudents = true;
        } else {
          this.displayAllStudents = false;
        }
      }
    },
    loadNext() {
      if (this.canLoadNext) {
        this.pageNumber += 1;
        this.loadStudents();
      }
    },
    loadPrevious() {
      if (this.canLoadPrevious) {
        this.pageNumber -= 1;
        this.loadStudents();
      }
    },
  }
};
</script>
<style scoped>
:deep(#dataTable > div.v-table__wrapper > table > thead > tr > th > div > span){
  font-size: 0.80rem;
  font-weight: bold;
}

:deep(#dataTable > div.v-table__wrapper > table > thead > tr > th){
  background-color: #ebedef;
}

:deep(#dataTable > div.v-table__wrapper > table > tbody > tr > td){
  font-size: 0.85rem;
}
</style>
