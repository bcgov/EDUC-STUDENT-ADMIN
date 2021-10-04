<template>
  <div id="statsContainer">
    <v-row>
      <v-col cols="6">
        <bar-chart-container v-if="mergeChartdata && mergeLabels" class="pt-4" :labels="mergeLabels" :chart-data="mergeChartdata" :data-type="CHART_TYPES.MERGES"></bar-chart-container>
        <v-card v-else-if="loadingMerge" class="mx-auto pa-4">
          <v-row align="center" justify="center">
            <v-progress-circular
              :size="70"
              :width="7"
              color="primary"
              indeterminate
            ></v-progress-circular>
          </v-row>
        </v-card>
      </v-col>
      <v-col cols="6">
        <doughnut-chart-container class="pt-4" :data-type="CHART_TYPES.GMP"></doughnut-chart-container>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <doughnut-chart-container class="pb-4" :data-type="CHART_TYPES.UMP"></doughnut-chart-container>
      </v-col>
      <v-col cols="6">
        <bar-chart-container v-if="newPenChartdata && newPenLabels" class="pb-4" :labels="newPenLabels" :chart-data="newPenChartdata" :data-type="CHART_TYPES.NEW_PENS"></bar-chart-container>
        <v-card v-else-if="loadingNewPen" class="mx-auto pa-4">
          <v-row align="center" justify="center">
            <v-progress-circular
              :size="70"
              :width="7"
              color="primary"
              indeterminate
            ></v-progress-circular>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import BarChartContainer from './BarChartContainer';
import DoughnutChartContainer from './DoughnutChartContainer';
import {CHART_TYPES, CHART_STAT_URLS} from '../../../utils/constants/ChartConstants';
import ApiService from '../../../common/apiService';
import alertMixin from '@/mixins/alertMixin';

export default {
  name: 'StatsDashboard',
  components: {
    BarChartContainer,
    DoughnutChartContainer
  },
  mixins: [alertMixin],
  data: () => ({
    barOptions: {
      maintainAspectRatio: false,
      legend: {
        display: false,
      },
    },
    CHART_TYPES,
    gmpChartdata: null,
    loadingMerge: true,
    loadingNewPen: true,
    mergeChartdata: null,
    mergeLabels: null,
    newPenChartdata: null,
    newPenLabels: null,
    pieChartdata: null,
    pieChartOptions: {
      maintainAspectRatio: false,
    },
    result: [],
    styles: {
      height: '15rem',
      position: 'relative'
    }
  }),
  mounted() {
    this.fillNewPenData();
    this.fillMergeData();
  },
  methods: {
    fillNewPenData() {
      ApiService.apiAxios.get(CHART_STAT_URLS.NEW_PEN)
        .then(response => {
          this.newPenLabels = response.data.labels;
          this.newPenChartdata = response.data.data;
        })
        .catch(e => {
          this.setFailureAlert('Failed to load new pen statistics. Please try again later.');
          console.log(e);
        })
        .finally(() => {this.loadingNewPen = false;});
      
    },
    fillMergeData() {
      ApiService.apiAxios.get(CHART_STAT_URLS.MERGE)
        .then(response => {
          this.mergeLabels = response.data.labels;
          this.mergeChartdata = response.data.data;
        })
        .catch(e => {
          this.setFailureAlert('Failed to load merge statistics. Please try again later.');
          console.log(e);
        })
        .finally(() => {this.loadingMerge = false;});

    }
  }
};
</script>

<style scoped>
  #statsContainer {
    background: #eee;
  }
</style>
