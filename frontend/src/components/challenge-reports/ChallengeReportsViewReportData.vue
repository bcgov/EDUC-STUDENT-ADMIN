<template>
  <div>
    <v-row>
      <v-col
        cols="12"
        class="d-flex justify-end mb-n8"
      >
        <v-chip
          v-if="challengeReportsSessionStatus === 'PRELIM'"
          color="warning"
        >
          Preliminary - Updates due by {{ activePeriod.finalDateForChanges }}
        </v-chip>
        <v-chip
          v-else-if="challengeReportsSessionStatus === 'FINALIZED'"
          color="success"
        >
          Final - Data as of {{ activePeriod.finalCompletionDate }}
        </v-chip>
        <v-chip v-else>
          Preliminary Phase Not Started
        </v-chip>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <h3 class="subHeading pb-1">
          Report Data Description
        </h3>
        <p>Student level data used to produce the Funding Reports for Course Challenges. Preliminary data is updated until the reporting process is finalized. Final data does not change once it is created.</p>
        <p style="font-style: italic; color: dimgrey">
          Data is replaced when the reporting process is run for the next school year. Download and retain these files if they are needed longer.
        </p>
      </v-col>
    </v-row>
    <v-row
      v-for="report in reports"
      :key="report.title"
    >
      <v-col cols="12">
        <h3 class="subHeading pb-1">
          {{ report.title }} - {{ schoolYear }}
        </h3>
        <p>{{ report.description }}</p>
        <div
          v-for="stage in stages"
          :key="stage.reportType + report.reportType"
          class="mt-2"
        >
          <router-link
            v-if="stage.available()"
            :id="stage.reportType + report.reportType"
            :to="{ path: downloadReportURL(stage.reportType + report.reportType) }"
            target="_blank"
          >
            <v-icon>mdi-tray-arrow-down</v-icon>
            {{ stage.label }} {{ report.title }} - {{ schoolYear }}
          </router-link>
          <span
            v-else
            :id="stage.reportType + report.reportType"
            class="disabled"
            aria-disabled="true"
          >
            <v-icon>mdi-tray-arrow-down</v-icon>
            {{ stage.label }} {{ report.title }} - {{ schoolYear }}
            <span class="d-sr-only">(not yet available)</span>
          </span>
          <span
            v-if="stage.asOf()"
            class="ml-2"
            style="font-style: italic; color: dimgrey"
          >
            ({{ stage.asOf() }})
          </span>
        </div>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import {Routes} from '@/utils/constants';
import {Year} from '@js-joda/core';

export default {
  name: 'ChallengeReportsViewReportData',
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
          title: 'District Course Challenges Report Data',
          description: 'Includes all eligible course challenges for public schools in all districts.',
          reportType: '_PROVINCIAL_DISTRICT_REPORT'
        },
        {
          title: 'Independent School Course Challenges Report Data',
          description: 'Includes all eligible course challenges for Independent and Independent First Nations schools.',
          reportType: '_PROVINCIAL_INDEPENDENT_REPORT'
        }
      ],
      stages: [
        {
          label: 'Preliminary',
          reportType: 'PRELIM',
          available: () => ['PRELIM', 'FINALIZED'].includes(this.challengeReportsSessionStatus),
          asOf: () => this.challengeReportsSessionStatus === 'PRELIM' ? 'current data' : this.activePeriod.preliminaryCompletionDate && `data as of ${this.activePeriod.preliminaryCompletionDate}`
        },
        {
          label: 'Final',
          reportType: 'FINAL',
          available: () => this.challengeReportsSessionStatus === 'FINALIZED',
          asOf: () => this.challengeReportsSessionStatus === 'FINALIZED' && `data as of ${this.activePeriod.finalCompletionDate}`
        }
      ]
    };
  },
  computed: {
    challengeReportsSessionStatus() {
      return this.activePeriod.challengeReportsSessionStatus;
    },
    schoolYear() {
      return Year.of(this.activePeriod.schoolYear).minusYears(1) + '/' + this.activePeriod.schoolYear;
    }
  },
  methods: {
    downloadReportURL(reportType) {
      return `${Routes.challengeReports.DOWNLOAD_REPORT_DATA}/${reportType}`;
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
