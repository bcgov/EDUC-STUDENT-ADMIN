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
    <v-row no-gutters>
      <v-col>
        <v-card-text>
          <v-window v-model="tab">
            <v-window-item
              value="reportingDatesTab"
              transition="false"
              reverse-transition="false"
            >
              <ChallengeReportsReportingProcess />
            </v-window-item>
            <v-window-item
              value="schoolsTab"
              transition="false"
              reverse-transition="false"
            >
              <ChallengeReportsMinistryReports />
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
import {hasRequiredPermission, PERMISSION} from '@/utils/constants/Permission';
import {mapState} from 'pinia';
import {authStore} from '@/store/modules/auth';

export default {
  name: 'ChallengeReports',
  components: {
    ChallengeReportsMinistryReports,
    ChallengeReportsReportingProcess
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
    ...mapState(authStore, ['userInfo']),
    hasPermissionToViewChallengeReporting() {
      return this.hasRequiredPermission(this.userInfo, PERMISSION.REPORTS_SDC_HEADCOUNTS_PERMISSION);
    },
    hasPermissionToManageChallengeReporting() {
      return this.hasRequiredPermission(this.userInfo, PERMISSION.EDIT_GRAD_DATA_COLLECTION_PERMISSION);
    }
  },
  methods: {
    formatDate,
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
