<template>
  <v-container fluid>
    <v-row dense>
      <v-col
        key="completionsLast12months"
        cols="6"
      >
        <bar-chart-container v-if="completionsLast12Month && completionsLast12MonthLabels" :displayYAxis="false"
                             :labels="completionsLast12MonthLabels" :chart-data="completionsLast12Month"
                             data-type="Completions Last 12 month"></bar-chart-container>
        <Spinner v-else/>
      </v-col>
      <v-col
        key="percentileStatsRequestLastMonth"
        cols="6"
      >
        <v-row dense style="min-height: 10rem;" class="mt-3">
          <v-col cols="6">
            <percentile-info-card v-if="completionsCurrentMonth!==null && percentCompletedRequestToLastMonth !== null"
                                  :percentile="percentCompletedRequestToLastMonth" :title="completionsCurrentMonth"
                                  sub-title="Completions" icon="mdi-checkbox-multiple-marked-circle"/>
            <Spinner v-else/>
          </v-col>

          <v-col cols="6">
            <percentile-info-card v-if="rejectionsCurrentMonth!==null && percentRejectedRequestToLastMonth !== null"
                                  :percentile="percentRejectedRequestToLastMonth" :title="rejectionsCurrentMonth"
                                  sub-title="Rejections" icon="mdi-checkbox-multiple-marked-circle"/>
            <Spinner v-else/>
          </v-col>
        </v-row>
        <v-row dense style="min-height: 10rem;" class="mt-4">
          <v-col cols="6">
            <percentile-info-card v-if="abandonedCurrentMonth!==null && percentAbandonedRequestToLastMonth !== null"
                                  :percentile="percentAbandonedRequestToLastMonth" :title="abandonedCurrentMonth"
                                  sub-title="Abandoned" icon="mdi-checkbox-multiple-marked-circle"/>
            <Spinner v-else/>
          </v-col>
          <v-col cols="6">
            <percentile-info-card
              v-if="completionsWithDocCurrentMonth!==null && percentCompletedRequestWithDocToLastMonth !== null"
              :percentile="percentCompletedRequestWithDocToLastMonth" :title="completionsWithDocCurrentMonth"
              sub-title="Completions With Document" icon="mdi-checkbox-multiple-marked-circle"/>
            <Spinner v-else/>
          </v-col>
        </v-row>
      </v-col>
      <v-col
        key="completionsLastWeek"
        cols="6"
      >
        <bar-chart-container v-if="completionsLastWeek && completionsLastWeekLabels" :displayYAxis="false"
                             :labels="completionsLastWeekLabels" :chart-data="completionsLastWeek"
                             data-type="Completions Last week"></bar-chart-container>
        <Spinner v-else/>
      </v-col>
      <v-col
        key="summaryLast12months"
        cols="6"
      >
        <DoughnutChartContainer v-if="CHART_STAT_URLS[`${requestTypeWithAllUpperCase}_ALL_STATUS_LAST_12_MONTH`]"
                                data-type="All Statuses Last 12 month" span-content="All statuses last 12 month"
                                :completion-states="COMPLETION_STATES[requestTypeWithAllUpperCase]"
                                :url="CHART_STAT_URLS[`${requestTypeWithAllUpperCase}_ALL_STATUS_LAST_12_MONTH`]"></DoughnutChartContainer>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col
        key="completionsLast12months"
        cols="12"
      >
        <v-card v-if="averageTimeToCompleteRequest">
          <v-card-text class="pt-4">
            Average time to complete request: {{ averageTimeToCompleteRequest.toFixed(1) }} days
          </v-card-text>
        </v-card>
        <Spinner v-else/>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>
import DoughnutChartContainer from './DoughnutChartContainer';
import Spinner from '../../common/Spinner';
import PercentileInfoCard from '../../common/PercentileInfoCard';
import BarChartContainer from './BarChartContainer';
import {CHART_STAT_URLS, CHART_TYPES, COMPLETION_STATES} from '@/utils/constants/ChartConstants';
import {capitalizeFirstLetter} from '@/utils/common';
import ApiService from '@/common/apiService';
import alertMixin from '@/mixins/alertMixin';

export default {
  name: 'GMPStatsLanding',
  mixins: [alertMixin],
  components: {DoughnutChartContainer, BarChartContainer, Spinner, PercentileInfoCard},
  props: {
    requestType: {
      type: String,
      required: true
    },
  },
  data: () => ({
    CHART_STAT_URLS: CHART_STAT_URLS,
    COMPLETION_STATES: COMPLETION_STATES,
    CHART_TYPES: CHART_TYPES,
    completionsLast12Month: null,
    completionsLast12MonthLabels: null,
    completionsLastWeekLabels: null,
    completionsLastWeek: null,
    completionsCurrentMonth: null,
    percentCompletedRequestToLastMonth: null,
    rejectionsCurrentMonth: null,
    percentRejectedRequestToLastMonth: null,
    abandonedCurrentMonth: null,
    percentAbandonedRequestToLastMonth: null,
    completionsWithDocCurrentMonth: null,
    percentCompletedRequestWithDocToLastMonth: null,
    averageTimeToCompleteRequest: null
  }),
  computed: {
    requestTypeWithAllUpperCase() {
      return this.requestType.toUpperCase();
    }
  },
  mounted() {
    const requestTypeWithFirstUpperCase = capitalizeFirstLetter(this.requestType);
    const baseUrl = CHART_STAT_URLS[`${this.requestTypeWithAllUpperCase}_STATS`];
    ApiService.apiAxios.get(baseUrl + '?statsType=COMPLETIONS_LAST_12_MONTH')
      .then(response => {
        this.completionsLast12Month = Object.values(response.data.completionsInLastTwelveMonth);
        this.completionsLast12MonthLabels = Object.keys(response.data.completionsInLastTwelveMonth);
      })
      .catch(e => {
        console.error(e);
        this.setFailureAlert(`Failed to load ${this.requestType} completions in last 12 month data. Please try refreshing the page.`);
      });
    ApiService.apiAxios.get(baseUrl + '?statsType=COMPLETIONS_LAST_WEEK')
      .then(response => {
        this.completionsLastWeek = Object.values(response.data.completionsInLastWeek);
        this.completionsLastWeekLabels = Object.keys(response.data.completionsInLastWeek);
      })
      .catch(e => {
        console.error(e);
        this.setFailureAlert(`Failed to load ${this.requestType} completions in last week data. Please try refreshing the page.`);
      });
    ApiService.apiAxios.get(baseUrl + `?statsType=PERCENT_${this.requestTypeWithAllUpperCase}_COMPLETION_TO_LAST_MONTH`)
      .then(response => {
        this.completionsCurrentMonth = response.data[this.requestType + 'CompletedInCurrentMonth']?.toString();
        this.percentCompletedRequestToLastMonth = response.data['percentCompleted' + requestTypeWithFirstUpperCase + 'ToLastMonth'];
      })
      .catch(e => {
        console.error(e);
        this.setFailureAlert(`Failed to load ${this.requestType} completions in last month data. Please try refreshing the page.`);
      });
    ApiService.apiAxios.get(baseUrl + `?statsType=PERCENT_${this.requestTypeWithAllUpperCase}_REJECTED_TO_LAST_MONTH`)
      .then(response => {
        this.rejectionsCurrentMonth = response.data[`${this.requestType}RejectedInCurrentMonth`].toString();
        this.percentRejectedRequestToLastMonth = response.data[`percentRejected${requestTypeWithFirstUpperCase}ToLastMonth`];
      })
      .catch(e => {
        console.error(e);
        this.setFailureAlert(`Failed to load ${this.requestType} rejected in last month data. Please try refreshing the page.`);
      });
    ApiService.apiAxios.get(baseUrl + `?statsType=PERCENT_${this.requestTypeWithAllUpperCase}_ABANDONED_TO_LAST_MONTH`)
      .then(response => {
        this.abandonedCurrentMonth = response.data[`${this.requestType}AbandonedInCurrentMonth`].toString();
        this.percentAbandonedRequestToLastMonth = response.data[`percentAbandoned${requestTypeWithFirstUpperCase}ToLastMonth`];
      })
      .catch(e => {
        console.error(e);
        this.setFailureAlert(`Failed to load ${this.requestType} abandoned in last month data. Please try refreshing the page.`);
      });
    ApiService.apiAxios.get(baseUrl + `?statsType=PERCENT_${this.requestTypeWithAllUpperCase}_COMPLETED_WITH_DOCUMENTS_TO_LAST_MONTH`)
      .then(response => {
        this.completionsWithDocCurrentMonth = response.data[`${this.requestType}CompletedWithDocsInCurrentMonth`].toString();
        this.percentCompletedRequestWithDocToLastMonth = response.data[`percent${requestTypeWithFirstUpperCase}CompletedWithDocumentsToLastMonth`];
      })
      .catch(e => {
        console.error(e);
        this.setFailureAlert(`Failed to load ${this.requestType} completions with docs in last month data. Please try refreshing the page.`);
      });
    ApiService.apiAxios.get(baseUrl + '?statsType=AVERAGE_COMPLETION_TIME')
      .then(response => {
        this.averageTimeToCompleteRequest = response.data.averageTimeToCompleteRequest;
      })
      .catch(e => {
        console.error(e);
        this.setFailureAlert(`Failed to load ${this.requestType} average time to complete data. Please try refreshing the page.`);
      });
  }
};
</script>
