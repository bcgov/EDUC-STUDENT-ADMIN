<template>
  <div>
    <v-card
      v-show="!loading && !loadFailed"
      class="mx-auto pa-4"
    >
      <doughnut-chart
        v-if="data"
        ref="chart"
        :chart-data="data"
        :options="options"
        :style="styles"
      />
      <v-card-text class="v-card-text--offset py-0">
        <div class="text-h6 font-weight-light mb-2">
          {{ dataType }}
        </div>
        <v-divider class="my-2" />

        <span
          v-if="spanContent"
          class="text-caption grey&#45;&#45;text font-weight-light"
        >{{ spanContent }}</span>
        <span
          v-else
          class="text-caption grey&#45;&#45;text font-weight-light"
        >{{ total }} total {{ dataType }} requests completed</span>
      </v-card-text>
    </v-card>
    <v-card
      v-show="loading"
      class="mx-auto pa-4"
    >
      <v-row
        align="center"
        justify="center"
      >
        <v-progress-circular
          :size="70"
          :width="7"
          color="primary"
          indeterminate
        />
      </v-row>
    </v-card>
  </div>
</template>
<script>
import DoughnutChart from '../../util/charts/DoughnutChart.vue';
import ApiService from '../../../common/apiService';
import {CHART_STAT_URLS} from '@/utils/constants/ChartConstants';
import alertMixin from '../../../mixins/alertMixin';
export default {
  name: 'DoughnutChartContainer',
  components: {
    DoughnutChart
  },
  mixins: [alertMixin],
  props: {
    dataType: {
      type: String,
      required: true
    },
    spanContent:{
      type: String,
      required: false
    },
    url:{
      type: String,
      required: false
    },
    completionStates:{
      type: Array,
      required: true,
    }
  },
  data: () => ({
    data: null,
    dataResponse: null,
    loading: true,
    loadFailed: false,
    options: {
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          color: 'white',
          font: {
            weight: 'bold'
          }
        }
      },
    },
    styles: {
      height: '15rem',
      position: 'relative'
    },
    total: null
  }),
  created() {
    this.loading = true;
    ApiService.apiAxios.get(this.url || CHART_STAT_URLS[this.dataType])
      .then(response => {
        Object.keys(response.data.allStatsLastTwelveMonth).forEach((key) => this.completionStates.includes(key) || delete response.data.allStatsLastTwelveMonth[key]);
        this.total = Object.values(response.data.allStatsLastTwelveMonth).reduce((partial_sum, a) => partial_sum + a,0);
        this.data = {
          labels: Object.keys(response.data.allStatsLastTwelveMonth),
          datasets: [
            {
              backgroundColor: [
                '#3485FF',
                '#00A646',
                '#ef5675',
                '#f9ca54'
              ],
              data: Object.values(response.data.allStatsLastTwelveMonth),
              datalabels: {
                anchor: 'end',
                align: 'start',
                clip: true,
                display: function(context) {
                  return context.dataset.data[context.dataIndex] !== 0;
                }
              }
            }
          ]
        };
        this.loading = false;
      })
      .catch(e => {
        this.loadFailed = true;
        console.log(e);
        this.setFailureAlert(`Failed to load ${this.dataType} data. Please try refreshing the page.`);
      })
      .finally(() => {this.loading = false;});

  }
};
</script>
