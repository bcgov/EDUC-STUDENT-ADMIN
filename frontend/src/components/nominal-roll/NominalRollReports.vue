<template>
  <v-row class="mt-5">
    <v-col>
      <h3>Nominal Roll Summary Reports</h3>
    </v-col>
  </v-row>

  <v-row no-gutters>
    <v-col>
      <span style="font-size: small; color: gray">
        Nominal Roll information based on posted students and September data collection.
      </span>
    </v-col>
  </v-row>

  <v-row no-gutters class="d-flex flex-row">
    <v-card
        v-for="(report, index) in reports"
        :key="report.displayYear"
        class="mt-2 mr-4"
        width="30em"
        border="sm"
    >
      <v-card-title style="font-size: medium;">
        {{ index === 0 ? 'Current Reporting Cycle' : 'Previous Reporting Cycle' }}
      </v-card-title>

      <v-card-text style="color: gray; font-size: small;" class="mt-n3">
        May {{ report.displayYear }}
      </v-card-text>

      <v-row class="pl-3 pb-3">
        <v-col cols="12">
          <v-btn
              :loading="loadingYear === report.apiYear"
              color="primary"
              @click="downloadNominalRollReport(report.apiYear, report.displayYear)"
          >
            Download Nominal Roll Summary Report
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-row>
</template>

<script>
import { LocalDate } from '@js-joda/core';
import alertMixin from '../../mixins/alertMixin';
import ApiService from '../../common/apiService';
import { Routes } from '../../utils/constants';

export default {
  name: 'NominalRollReports',
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: false,
      default: null
    },
  },
  data() {
    return {
      reports: [],
      loadingYear: null,
    };
  },
  created() {
    this.populateReports();
  },
  methods: {
    populateReports() {
      const now = LocalDate.now();
      const currentYear = now.year(); // Example: 2024

      this.reports = [
        {
          displayYear: currentYear,
          apiYear: (currentYear) - 1,
        },
        {
          displayYear: currentYear -1,
          apiYear: (currentYear -1)  - 1,
        }
      ];
    },
    async downloadNominalRollReport(apiYear,displayYear) {
      this.loadingYear = apiYear;
      try {
        const { data } = await ApiService.apiAxios.get(`${Routes.nominalRoll.REPORTS}/${apiYear}`, {
          params: { yearEnd: apiYear },
          responseType: 'blob'
        });
        this.openBlobInNewTab(data, displayYear);
      } catch (error) {
        console.error('Error downloading file:', error);
        this.setFailureAlert(error.response?.data?.message || error.message);
      } finally {
        this.loadingYear = null;
      }
    },
    async openBlobInNewTab(blob, displayYear) {
      const blobURL = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobURL;
      link.download = `Nominal_Roll_Summary_${displayYear}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobURL);
    },
  },
};
</script>

<style scoped>
h3 {
  color: #38598a;
}
button {
  color: #1976d2;
}
ul {
  list-style-type: none;
  padding-top: 1em;
  padding-bottom: 2em;
}
li {
  padding-top: 1em;
}
p {
  padding-top: 1em;
  font-style: italic;
}
i {
  font-size: 1.25em;
}
</style>
