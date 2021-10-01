<template>
  <v-container fluid>
    <v-row dense>
      <v-col
        key="completionsLast12months"
        cols="6"
      >
        <bar-chart-container v-if="gmpCompletionsLast12Month && gmpCompletionsLast12MonthLabels"
                             :labels="gmpCompletionsLast12MonthLabels" :chart-data="gmpCompletionsLast12Month"
                             data-type="Completions Last 12 month"></bar-chart-container>
        <Spinner v-else/>
      </v-col>
      <v-col
        key="percentileStatsGMPLastMonth"
        cols="6"
      >
        <v-row dense>
          <v-col cols="6">
            <percentile-info-card v-if="gmpCompletionsCurrentMonth!==null && percentCompletedGmpToLastMonth !== null"
                                  :percentile="percentCompletedGmpToLastMonth" :title="gmpCompletionsCurrentMonth"
                                  sub-title="GMP Completions" icon="mdi-checkbox-multiple-marked-circle"/>
            <Spinner v-else/>
          </v-col>

          <v-col cols="6">
            <percentile-info-card v-if="gmpRejectionsCurrentMonth!==null && percentRejectedGMPToLastMonth !== null"
                                  :percentile="percentRejectedGMPToLastMonth" :title="gmpRejectionsCurrentMonth"
                                  sub-title="GMP Rejections" icon="mdi-checkbox-multiple-marked-circle"/>
            <Spinner v-else/>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <percentile-info-card v-if="gmpAbandonedCurrentMonth!==null && percentAbandonedGMPToLastMonth !== null"
                                  :percentile="percentAbandonedGMPToLastMonth" :title="gmpAbandonedCurrentMonth"
                                  sub-title="GMP Abandoned" icon="mdi-checkbox-multiple-marked-circle"/>
            <Spinner v-else/>
          </v-col>
          <v-col cols="6">
            <percentile-info-card
              v-if="gmpCompletionsWithDocCurrentMonth!==null && percentCompletedGmpWithDocToLastMonth !== null"
              :percentile="percentCompletedGmpWithDocToLastMonth" :title="gmpCompletionsWithDocCurrentMonth"
              sub-title="GMP Completions With Document" icon="mdi-checkbox-multiple-marked-circle"/>
            <Spinner v-else/>
          </v-col>
        </v-row>
      </v-col>
      <v-col
        key="completionsLastWeek"
        cols="6"
      >
        <bar-chart-container v-if="gmpCompletionsLastWeek && gmpCompletionsLastWeekLabels"
                             :labels="gmpCompletionsLastWeekLabels" :chart-data="gmpCompletionsLastWeek"
                             data-type="Completions Last week"></bar-chart-container>
        <Spinner v-else/>
      </v-col>
      <v-col
        key="summaryLast12months"
        cols="6"
      >
        <DoughnutChartContainer v-if="CHART_STAT_URLS.GMP_ALL_STATUS_LAST_12_MONTH"
                                data-type="All Statuses Last 12 month" span-content="All statuses last 12 month"
                                url="/api/analytics/gmp/stats?statsType=ALL_STATUSES_LAST_12_MONTH"></DoughnutChartContainer>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import DoughnutChartContainer from './DoughnutChartContainer';
import Spinner from '../../common/Spinner';
import PercentileInfoCard from '../../common/PercentileInfoCard';
import BarChartContainer from './BarChartContainer';
import {CHART_STAT_URLS, CHART_TYPES} from '@/utils/constants/ChartConstants';
import ApiService from '@/common/apiService';
import alertMixin from '@/mixins/alertMixin';

export default {
  name: 'GMPStatsLanding',
  mixins: [alertMixin],
  components: {DoughnutChartContainer, BarChartContainer, Spinner, PercentileInfoCard},
  data: () => ({
    CHART_STAT_URLS: CHART_STAT_URLS,
    CHART_TYPES: CHART_TYPES,
    gmpCompletionsLast12Month: null,
    gmpCompletionsLast12MonthLabels: null,
    gmpCompletionsLastWeekLabels: null,
    gmpCompletionsLastWeek: null,
    gmpCompletionsCurrentMonth: null,
    percentCompletedGmpToLastMonth: null,
    gmpRejectionsCurrentMonth: null,
    percentRejectedGMPToLastMonth: null,
    gmpAbandonedCurrentMonth: null,
    percentAbandonedGMPToLastMonth: null,
    gmpCompletionsWithDocCurrentMonth: null,
    percentCompletedGmpWithDocToLastMonth: null,
  }),
  mounted() {
    ApiService.apiAxios.get(CHART_STAT_URLS.GMP_STATS + '?statsType=COMPLETIONS_LAST_12_MONTH')
      .then(response => {
        this.gmpCompletionsLast12Month = Object.values(response.data.completionsInLastTwelveMonth);
        this.gmpCompletionsLast12MonthLabels = Object.keys(response.data.completionsInLastTwelveMonth);
      })
      .catch(e => {
        console.error(e);
        this.setFailureAlert(`Failed to load Gmp completions in last 12 month data. Please try refreshing the page.`);
      });
    ApiService.apiAxios.get(CHART_STAT_URLS.GMP_STATS + '?statsType=COMPLETIONS_LAST_WEEK')
      .then(response => {
        this.gmpCompletionsLastWeek = Object.values(response.data.completionsInLastWeek);
        this.gmpCompletionsLastWeekLabels = Object.keys(response.data.completionsInLastWeek);
      })
      .catch(e => {
        console.error(e);
        this.setFailureAlert(`Failed to load Gmp completions in last 12 month data. Please try refreshing the page.`);
      });
    ApiService.apiAxios.get(CHART_STAT_URLS.GMP_STATS + '?statsType=PERCENT_GMP_COMPLETION_TO_LAST_MONTH')
      .then(response => {
        this.gmpCompletionsCurrentMonth = response.data.gmpCompletedInCurrentMonth?.toString();
        this.percentCompletedGmpToLastMonth = response.data.percentCompletedGmpToLastMonth;
      })
      .catch(e => {
        console.error(e);
        this.setFailureAlert(`Failed to load Gmp completions in last 12 month data. Please try refreshing the page.`);
      });

    ApiService.apiAxios.get(CHART_STAT_URLS.GMP_STATS + '?statsType=PERCENT_GMP_REJECTED_TO_LAST_MONTH')
      .then(response => {
        this.gmpRejectionsCurrentMonth = response.data.gmpRejectedInCurrentMonth.toString();
        this.percentRejectedGMPToLastMonth = response.data.percentRejectedGmpToLastMonth;
      })
      .catch(e => {
        console.error(e);
        this.setFailureAlert(`Failed to load Gmp completions in last 12 month data. Please try refreshing the page.`);
      });
    ApiService.apiAxios.get(CHART_STAT_URLS.GMP_STATS + '?statsType=PERCENT_GMP_ABANDONED_TO_LAST_MONTH')
      .then(response => {
        this.gmpAbandonedCurrentMonth = response.data.gmpAbandonedInCurrentMonth.toString();
        this.percentAbandonedGMPToLastMonth = response.data.percentAbandonedGmpToLastMonth;
      })
      .catch(e => {
        console.error(e);
        this.setFailureAlert(`Failed to load Gmp completions in last 12 month data. Please try refreshing the page.`);
      });
    ApiService.apiAxios.get(CHART_STAT_URLS.GMP_STATS + '?statsType=PERCENT_GMP_COMPLETED_WITH_DOCUMENTS_TO_LAST_MONTH')
      .then(response => {
        this.gmpCompletionsWithDocCurrentMonth = response.data.gmpCompletedWithDocsInCurrentMonth.toString();
        this.percentCompletedGmpWithDocToLastMonth = response.data.percentGmpCompletedWithDocumentsToLastMonth;
      })
      .catch(e => {
        console.error(e);
        this.setFailureAlert(`Failed to load Gmp completions in last 12 month data. Please try refreshing the page.`);
      });
  }
};
</script>

<style scoped>

</style>
