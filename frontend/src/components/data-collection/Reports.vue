<template>
  <v-container
    fluid
  >
    <v-row class="mt-3 mb-3">
      <v-btn-toggle rounded="0">
        <v-btn
          v-if="hasAccessToPublicReports()"
          id="publicReportButton"
          size="large"
          class="detail-button"
          :class="{ 'active-button': reportView === 'publicReports' }"
          @click="showPublicReports"
        >
          Public School Students
        </v-btn>
        <v-btn
          v-if="hasAccessToIndependentReports()"
          id="independentReportButton"
          size="large"
          class="detail-button"
          :class="{ 'active-button': reportView === 'independentReports' }"
          @click="showIndependentReports"
        >
          Independent School Students
        </v-btn>
        <v-btn
          v-if="hasAccessToHeadcountReports()"
          id="headcountReports"
          size="large"
          class="detail-button"
          :class="{ 'active-button': reportView === 'headcountReports' }"
          @click="showHeadcountReports"
        >
          Headcounts
        </v-btn>
      </v-btn-toggle>
    </v-row>
    <v-row>
      <v-col>
        <div v-if="reportView === 'publicReports'">
          <ReportSection
            :report-list="publicReports"
            :collection-object="collectionObject"
          />
        </div>
        <div v-if="reportView === 'independentReports'">
          <ReportSection
            :report-list="independentReports"
            :collection-object="collectionObject"
          />
        </div>
        <div v-if="reportView === 'headcountReports'">
          <ReportSection
            :report-list="headcountsReports"
            :collection-object="collectionObject"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
  
<script>

import {hasRequiredPermission, PERMISSION} from '@/utils/constants/Permission';
import {mapState} from 'pinia';
import {authStore} from '@/store/modules/auth';
import { appStore } from '@/store/modules/app';
import ReportSection from '@/components/data-collection/ReportSection.vue';
import {SDC_REPORTS} from '@/utils/constants';
import {LocalDate, LocalDateTime} from '@js-joda/core';

export default {
  name: 'Reports',
  components: {
    ReportSection
  },
  props: {
    collectionObject: {
      type: Object,
      required: true
    }
  },
  emits: [],
  data() {
    return {
      reportView: null,
      publicReports: [],
      independentReports: [],
      headcountsReports: []
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['config']),
  },
  created() {
    this.setOriginalReportTab();
    this.publicReports = this.getActiveReports(SDC_REPORTS.publicReports);
    this.independentReports = this.getActiveReports(SDC_REPORTS.independentReports);
    this.headcountsReports = this.visibleHeadcountsReports(SDC_REPORTS.headcountReports); 
  },
  methods: {
    getActiveReports(reports){
      return reports.filter(report => {
        if(report.onlyForCollection && !report.onlyForCollection.includes(this.collectionObject.collectionTypeCode)){
          return false;
        }
        return true;
      });    
    },
    visibleHeadcountsReports(reports) {
      const activeReports = this.getActiveReports(reports);
      return this.isMigratedCollection() ? activeReports.filter((report) => report.label !== 'Refugee Enroled Headcounts and FTEs') : activeReports;
    },    
    isMigratedCollection() { //we don't show refugee reports for collections before EDX go live
      return LocalDateTime.parse(this.collectionObject?.createDate).toLocalDate().isBefore(LocalDate.parse(this.config.SLD_MIGRATION_DATE));
    },
    setOriginalReportTab(){
      if(this.hasAccessToPublicReports()){
        this.reportView = 'publicReports';
      }else if(this.hasAccessToIndependentReports()){
        this.reportView = 'independentReports';
      }else if(this.hasAccessToHeadcountReports()){
        this.reportView = 'headcountReports';
      }
    },
    hasAccessToPublicReports(){
      return hasRequiredPermission(this.userInfo, PERMISSION.REPORTS_SDC_PUBLIC_SCHOOLS_PERMISSION);
    },
    hasAccessToIndependentReports(){
      return hasRequiredPermission(this.userInfo, PERMISSION.REPORTS_SDC_INDEPENDENT_SCHOOLS_PERMISSION);
    },
    hasAccessToHeadcountReports(){
      return hasRequiredPermission(this.userInfo, PERMISSION.REPORTS_SDC_HEADCOUNTS_PERMISSION);
    },
    showPublicReports() {
      this.reportView = 'publicReports';
    },
    showIndependentReports() {
      this.reportView = 'independentReports';
    },
    showHeadcountReports() {
      this.reportView = 'headcountReports';
    }
  }
};
</script>
  
  <style scoped>
  .detail-button {
    border: 1px solid lightgray;
  }

  .active-button {
    background-color: #003366 !important;
    color: white !important;
    border: 1px solid #003366;
  }
  </style>
  
