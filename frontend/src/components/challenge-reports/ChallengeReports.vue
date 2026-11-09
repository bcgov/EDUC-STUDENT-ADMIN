<template>
  <v-container
    fluid
    class="containerSetup"
  >
    <v-row no-gutters>
      <v-col>
        <v-tabs
          v-model="tab"
          style="color: #38598a"
        >
          <v-tab
            v-if="hasPermissionToManageChallengeReporting"
            id="reportingDatesTab"
            value="reportingDatesTab"
            prepend-icon="mdi-format-list-checks"
          >
            Manage Reporting Process
          </v-tab>
          <v-tab
            v-if="hasPermissionToViewChallengeReportData"
            id="reportDataTab"
            value="reportDataTab"
            prepend-icon="mdi-file-table-outline"
          >
            View Report Data
          </v-tab>
          <v-tab
            v-if="hasPermissionToViewChallengeReporting"
            id="schoolsTab"
            value="schoolsTab"
            prepend-icon="mdi-download-box-outline"
          >
            Ministry Reports
          </v-tab>
        </v-tabs>
      </v-col>
    </v-row>
    <v-row
      v-if="!activePeriod"
      no-gutters
    >
      <v-col class="d-flex justify-center mt-4">
        <v-progress-circular
          v-if="loading"
          :size="70"
          :width="7"
          color="primary"
          indeterminate
        />
      </v-col>
    </v-row>
    <v-row
      v-else
      no-gutters
    >
      <v-col>
        <v-card-text>
          <v-window v-model="tab">
            <v-window-item
              v-if="hasPermissionToManageChallengeReporting"
              value="reportingDatesTab"
              transition="false"
              reverse-transition="false"
            >
              <ChallengeReportsReportingProcess
                :active-period="activePeriod"
                @period-changed="refreshActivePeriod"
              />
            </v-window-item>
            <v-window-item
              v-if="hasPermissionToViewChallengeReportData"
              value="reportDataTab"
              transition="false"
              reverse-transition="false"
            >
              <ChallengeReportsViewReportData :active-period="activePeriod" />
            </v-window-item>
            <v-window-item
              v-if="hasPermissionToViewChallengeReporting"
              value="schoolsTab"
              transition="false"
              reverse-transition="false"
            >
              <ChallengeReportsMinistryReports :active-period="activePeriod" />
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import alertMixin from '@/mixins/alertMixin';
import {PAGE_TITLES} from '@/utils/constants';
import {formatDate} from '@/utils/format';
import ChallengeReportsReportingProcess from '@/components/challenge-reports/ChallengeReportsManagement.vue';
import ChallengeReportsMinistryReports from '@/components/challenge-reports/ChallengeReportsMinistryReports.vue';
import ChallengeReportsViewReportData from '@/components/challenge-reports/ChallengeReportsViewReportData.vue';
import {fetchActiveChallengeReportPeriod} from '@/components/composable/challengeReportsComposable';
import {hasRequiredPermission, PERMISSION} from '@/utils/constants/Permission';
import {mapState} from 'pinia';
import {authStore} from '@/store/modules/auth';

export default {
  name: 'ChallengeReports',
  components: {
    ChallengeReportsMinistryReports,
    ChallengeReportsReportingProcess,
    ChallengeReportsViewReportData
  },
  mixins: [alertMixin],
  data() {
    return {
      PAGE_TITLES: PAGE_TITLES,
      tab: null,
      loading: true,
      activePeriod: null,
      collectionObject: null,
      previousCollectionObject: null,
      activeCollectionSelected: true
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    hasPermissionToViewChallengeReporting() {
      return this.hasRequiredPermission(this.userInfo, PERMISSION.REPORTS_SDC_HEADCOUNTS_PERMISSION);
    },
    hasPermissionToViewChallengeReportData() {
      return this.hasRequiredPermission(this.userInfo, PERMISSION.CHALLENGE_REPORT_PERMISSION);
    },
    hasPermissionToManageChallengeReporting() {
      return this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_GRAD_DATA_COLLECTION_PERMISSION);
    }
  },
  mounted() {
    this.refreshActivePeriod();
  },
  methods: {
    formatDate,
    async refreshActivePeriod() {
      this.loading = true;
      this.activePeriod = null;
      const updatedActivePeriod = await fetchActiveChallengeReportPeriod();
      if (updatedActivePeriod) {
        this.activePeriod = updatedActivePeriod;
      }
      this.loading = false;
    },
    hasRequiredPermission
  }
};
</script>

<style scoped>
.containerSetup {
  padding-right: 15em !important;
  padding-left: 15em !important;
}

.divider {
  border-color: #FCBA19;
  border-width: unset;
  opacity: unset;
}
</style>
