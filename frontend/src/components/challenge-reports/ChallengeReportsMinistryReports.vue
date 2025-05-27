<template>
  <div v-if="loading">
    <v-row>
      <v-col class="d-flex justify-center">
        <v-progress-circular
          :size="70"
          :width="7"
          color="primary"
          indeterminate
        />
      </v-col>
    </v-row>
  </div>
  <div v-else>
    <v-row v-if="challengeReportsSessionStatus !== 'FINALIZED'">
      <v-col cols="9">
        <v-alert
          type="info"
          variant="tonal"
          text="Reports will be available for download once the data is finalized. Teams will be notified when ready."
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="9">
        <h3 class="subHeading pb-1">
          District Funding Report for Course Challenges - {{ schoolYear }}
        </h3>
        <p>Includes the total, eligible successful course challenges for each district.</p>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="mt-2"
    >
      <v-col>
        <span>
          <router-link
            id="downloadReport"
            :to="{ path: publicReportDownloadReportURL()}"
            target="_blank"
            :class="{ disabled: challengeReportsSessionStatus !== 'FINALIZED' }"
          >
            <v-icon>mdi-tray-arrow-down</v-icon>
            District Funding Report for Course Challenges - {{ schoolYear }}
          </router-link>
        </span>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="9">
        <h3 class="subHeading pb-1">
          Independent School Funding Report for Course Challenges - {{ schoolYear }}
        </h3>
        <p>Includes all eligible course challenges for Independent and Independent First Nations schools.</p>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="mt-2"
    >
      <v-col>
        <span>
          <router-link
            id="downloadReport"
            :to="{ path: indyReportDownloadReportURL()}"
            target="_blank"
            :class="{ disabled: challengeReportsSessionStatus !== 'FINALIZED' }"
          >
            <v-icon>mdi-tray-arrow-down</v-icon>
            Independent School Funding Report for Course Challenges - {{ schoolYear }}
          </router-link>
        </span>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import {formatDate} from '@/utils/format';
import {mapState} from 'pinia';
import {authStore} from '@/store/modules/auth';
import ApiService from '@/common/apiService';
import {Routes} from '@/utils/constants';
import {Year} from '@js-joda/core';

export default {
  name: 'ChallengeReportsMinistryReports',
  components: {},
  data() {
    return {
      isFormValid: false,
      loading: true,
      schoolYear: null,
      challengeReportsSessionStatus: null,
      activePeriod: null
    };
  },
  computed:{
    ...mapState(authStore, ['userInfo'])
  },
  mounted() {
    this.getActiveChallengeReportPeriod();
  },
  methods: {
    formatDate,
    indyReportDownloadReportURL() {
      return `${Routes.challengeReports.DOWNLOAD_REPORT}/INDEPENDENT_SCHOOL_FUNDING_REPORT`;
    },
    publicReportDownloadReportURL() {
      return `${Routes.challengeReports.DOWNLOAD_REPORT}/DISTRICT_FUNDING_REPORT`;
    },
    async getActiveChallengeReportPeriod() {
      this.loading = true;
      ApiService.apiAxios.get(`${Routes.challengeReports.ACTIVE_PERIOD}`)
        .then((response) => {
          this.activePeriod = response.data;
          this.challengeReportsSessionStatus = this.activePeriod.challengeReportsSessionStatus;
          this.schoolYear = Year.of(this.activePeriod.schoolYear).minusYears(1) + '/' + this.activePeriod.schoolYear ;
        })
        .catch((error) => {
          console.error(error);
          this.setFailureAlert(
            error?.response?.data?.message
              ? error?.response?.data?.message
              : 'An error occurred while trying to retrieve the status of Challenge Reports.'
          );
        }).finally(() => {
          this.loading = false;
        });
    },
  }
};
</script>
<style scoped>
.subHeading {
  color: #38598a;
}
.header {
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
}

li {
  font-size: 14px;
  margin-left: 1em;
  list-style-type: initial;
}
</style>
