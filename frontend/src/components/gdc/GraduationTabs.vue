<template>
  <v-container
    fluid
    class="px-16"
  >
    <v-row
      no-gutters
      align="center"
      class="mb-4 ml-1"
    >
      <v-col
        cols="auto"
        class="pr-4 d-flex align-center"
        style="cursor: pointer;"
        @click="activeCollectionSelected = true"
      >
        <v-radio
          v-model="activeCollectionSelected"
          :value="true"
          density="compact"
          hide-details
        />
        <div class="pl-2">
          <span class="font-weight-bold">
            Current Reporting Cycle -
          </span>
          <span>
            {{ collectionObject ? `${formatDateAsMonthYear(collectionObject.periodStart)} to ${formatDateAsMonthYear(collectionObject.periodEnd)}` : '-' }}
          </span>
        </div>
      </v-col>

      <v-col
        cols="auto"
        class="pl-4 d-flex align-center"
        style="cursor: pointer;"
        @click="activeCollectionSelected = false"
      >
        <v-radio
          v-model="activeCollectionSelected"
          :value="false"
          density="compact"
          hide-details
        />
        <div class="pl-2">
          <span class="font-weight-bold">
            Previous Reporting Cycle -
          </span>
          <span>
            {{ previousCollectionObject ? `${formatDateAsMonthYear(previousCollectionObject.periodStart)} to ${formatDateAsMonthYear(previousCollectionObject.periodEnd)}` : '-' }}
          </span>
        </div>
      </v-col>
    </v-row>


    <v-row no-gutters>
      <v-col>
        <v-divider class="divider" />
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <v-tabs
          v-model="tab"
          style="color: #38598a"
        >
          <v-tab
            id="reportingDatesTab"
            value="reportingDatesTab"
            prepend-icon="mdi-calendar-range"
          >
            Reporting Dates
          </v-tab>
          <v-tab
            id="schoolsTab"
            value="schoolsTab"
            prepend-icon="mdi-domain"
          >
            Schools
          </v-tab>
          <v-tab
            id="reportingInsightsTab"
            value="reportingInsightsTab"
            prepend-icon="mdi-chart-timeline-variant"
          >
            Reporting Insights
          </v-tab>
          <v-tab
            id="studentDataTab"
            value="studentDataTab"
            prepend-icon="mdi-account-search-outline"
          >
            Find Student in Data Submissions
          </v-tab>
        </v-tabs>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <v-card-text>
          <v-window v-model="tab">
            <v-window-item
              value="reportingDatesTab"
              transition="false"
              reverse-transition="false"
            >
              <ReportingDates
                :key="`${selectedCollectionObject?.reportingPeriodID}-${tab}`"
                :collection-object="selectedCollectionObject"
                :is-previous="!activeCollectionSelected"
                @update:collection-object="collectionObject = $event"
              />
            </v-window-item>
            <v-window-item
              value="schoolsTab"
              transition="false"
              reverse-transition="false"
            >
              <Schools
                :collection-object="selectedCollectionObject"
                :is-previous="!activeCollectionSelected"
              />
            </v-window-item>
            <v-window-item
              value="reportingInsightsTab"
              transition="false"
              reverse-transition="false"
            >
              <CollectionInsights :collection-object="selectedCollectionObject" />
            </v-window-item>
            <v-window-item
              value="studentDataTab"
              transition="false"
              reverse-transition="false"
            >
              <GradStudentSearch :collection-object="selectedCollectionObject" />
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import alertMixin from '@/mixins/alertMixin';
import {PAGE_TITLES, Routes} from '@/utils/constants';
import {mapState} from 'pinia';
import {authStore} from '@/store/modules/auth';
import {appStore} from '@/store/modules/app';
import ReportingDates from '@/components/gdc/ReportingDates.vue';
import ApiService from '@/common/apiService';
import {formatDate, formatDateAsMonthYear} from '@/utils/format';
import CollectionInsights from './insights/CollectionInsights.vue';
import Schools from '@/components/gdc/Schools.vue';
import GradStudentSearch from '@/components/gdc/GradStudentSearch.vue';

export default {
  name: 'GraduationSchoolTabs',
  components: {
    Schools,
    ReportingDates,
    CollectionInsights,
    GradStudentSearch
  },
  mixins: [alertMixin],
  data() {
    return {
      PAGE_TITLES: PAGE_TITLES,
      tab: null,
      collectionObject: null,
      previousCollectionObject: null,
      activeCollectionSelected: true
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
    ...mapState(appStore, ['config']),
    selectedCollectionObject() {
      return this.activeCollectionSelected ? this.collectionObject : this.previousCollectionObject;
    }
  },
  created() {
    this.getActiveReportingDates();
    this.getPreviousReportingDates();
  },
  methods: {
    formatDateAsMonthYear,
    formatDate,
    getActiveReportingDates() {
      ApiService.apiAxios.get(`${Routes.gdc.ACTIVE_COLLECTION}`)
        .then(response => {
          this.collectionObject = response.data;
        });
    },
    getPreviousReportingDates() {
      ApiService.apiAxios.get(`${Routes.gdc.PREVIOUS_COLLECTION}`)
        .then(response => {
          this.previousCollectionObject = response.data;
        });
    }
  }
};
</script>

<style scoped>
.divider {
  border-color: #FCBA19;
  border-width: unset;
  opacity: unset;
}
</style>
