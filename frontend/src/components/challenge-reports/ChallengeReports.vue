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
            id="reportingDatesTab"
            value="reportingDatesTab"
            prepend-icon="mdi-format-list-checks"
          >
            Manage Reporting Process
          </v-tab>
          <v-tab
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
import ChallengeReportsReportingProcess from '@/components/challenge-reports/ChallengeReportsReportingProcess.vue';

export default {
  name: 'ChallengeReports',
  components: {
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
  },
  methods: {
    formatDate
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
