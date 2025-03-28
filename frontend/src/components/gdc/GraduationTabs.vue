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
        {{ collectionsObject !== null ? `- ${collectionsObject.schoolYear.openDate} to ${collectionsObject.summer.closeDate}` : '-' }}
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
              <ReportingDates :collections-object="collectionsObject" />
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
      collectionsObject: null
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
      // ApiService.apiAxios.get(`${Routes.gdc.ACTIVE_COLLECTIONS}`)
      //   .then(response => {
      //     this.collectionsObject = response.data;
      //   });
      this.collectionsObject = {
        schoolYear: {
          openDate: '20241001',
          closeDate: '20250718'
        },
        summer: {
          openDate: '20250810',
          closeDate: '20250912'
        }
      };
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
