<template>
  <v-container
    fluid
    class="px-16"
  >
    <v-row
      no-gutters
      class="mb-2 ml-1"
    >
      <strong>
        Current Reporting Cycle
      </strong>
      <span class="pl-2">
        {{ collectionObject !== null ? `- ${collectionObject?.schYrStart} to ${collectionObject?.summerEnd}` : '-' }}
      </span>
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
            <v-window-item value="reportingDatesTab">
              <ReportingDates :collection-object="collectionObject" />
            </v-window-item>
            <v-window-item value="schoolsTab">
              Schools
            </v-window-item>
            <v-window-item value="reportingInsightsTab">
              Reporting Insights
            </v-window-item>
            <v-window-item value="studentDataTab">
              Find Student in Data Submissions
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

export default {
  name: 'GraduationSchoolTabs',
  components: {
    ReportingDates
  },
  mixins: [alertMixin],
  props: {
    districtID: {
      type: String,
      required: false,
      default: null
    },
  },
  data() {
    return {
      PAGE_TITLES: PAGE_TITLES,
      tab: null,
      collectionObject: null
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
    ...mapState(appStore, ['config'])
  },
  created() {
    this.getActiveReportingDates();
  },
  methods: {
    getActiveReportingDates() {
      ApiService.apiAxios.get(`${Routes.gdc.ACTIVE_COLLECTION}`)
        .then(response => {
          console.log(response.data);
          this.collectionObject = response.data;
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
