<template>
  <div>
    <v-row v-if="challengeReportsSessionStatus !== 'FINALIZED'">
      <v-col cols="9">
        <v-alert
          type="info"
          variant="tonal"
          text="Reports will be available for download once the data is finalized. Teams will be notified when ready."
        />
      </v-col>
    </v-row>
    <template
      v-for="report in reports"
      :key="report.reportType"
    >
      <v-row>
        <v-col cols="9">
          <h3 class="subHeading pb-1">
            {{ report.title }} - {{ schoolYear }}
          </h3>
          <p>{{ report.description }}</p>
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="mt-2"
      >
        <v-col>
          <router-link
            v-if="isFinalized"
            :id="report.reportType"
            :to="{ path: downloadReportURL(report.reportType) }"
            target="_blank"
          >
            <v-icon>mdi-tray-arrow-down</v-icon>
            {{ report.title }} - {{ schoolYear }}
          </router-link>
          <span
            v-else
            :id="report.reportType"
            class="disabled"
            aria-disabled="true"
          >
            <v-icon>mdi-tray-arrow-down</v-icon>
            {{ report.title }} - {{ schoolYear }}
            <span class="d-sr-only">(not yet available)</span>
          </span>
        </v-col>
      </v-row>
    </template>
  </div>
</template>
<script>
import {Routes} from '@/utils/constants';
import {Year} from '@js-joda/core';

export default {
  name: 'ChallengeReportsMinistryReports',
  props: {
    activePeriod: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      reports: [
        {
          title: 'District Funding Report for Course Challenges',
          description: 'Includes the total, eligible successful course challenges for each district.',
          reportType: 'DISTRICT_FUNDING_REPORT'
        },
        {
          title: 'Independent School Funding Report for Course Challenges',
          description: 'Includes all eligible course challenges for Independent and Independent First Nations schools.',
          reportType: 'INDEPENDENT_SCHOOL_FUNDING_REPORT'
        }
      ]
    };
  },
  computed: {
    challengeReportsSessionStatus() {
      return this.activePeriod.challengeReportsSessionStatus;
    },
    isFinalized() {
      return this.challengeReportsSessionStatus === 'FINALIZED';
    },
    schoolYear() {
      return Year.of(this.activePeriod.schoolYear).minusYears(1) + '/' + this.activePeriod.schoolYear;
    }
  },
  methods: {
    downloadReportURL(reportType) {
      return `${Routes.challengeReports.DOWNLOAD_REPORT}/${reportType}`;
    }
  }
};
</script>
<style scoped>
.subHeading {
  color: #38598a;
}

.disabled {
  opacity: 0.5;
}
</style>
