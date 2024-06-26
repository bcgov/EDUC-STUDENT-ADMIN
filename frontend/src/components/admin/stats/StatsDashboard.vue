<template>
  <div id="statsContainer">
    <v-row>
      <v-col
        v-if="STUDENT_ANALYTICS_BATCH"
        cols="6"
      >
        <router-link
          v-if="mergeChartdata && mergeLabels"
          :to="{ name: 'merges'}"
        >
          <bar-chart-container
            v-if="mergeChartdata && mergeLabels"
            class="pt-4"
            :display-y-axis="false"
            :labels="mergeLabels"
            :chart-data="mergeChartdata"
            :title="CHART_TYPES.MERGES"
            :data-type="CHART_TYPES.MERGES"
            annual-total
          />
        </router-link>
        <v-card
          v-else-if="loadingMerge"
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
      </v-col>
      <v-col
        v-if="STUDENT_ANALYTICS_STUDENT_PROFILE"
        cols="6"
      >
        <router-link :to="{ name: 'analytics-gmp-stats'}">
          <doughnut-chart-container
            class="pt-4"
            :completion-states="COMPLETION_STATES.GMP"
            :data-type="CHART_TYPES.GMP"
          />
        </router-link>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        v-if="STUDENT_ANALYTICS_STUDENT_PROFILE"
        cols="6"
      >
        <router-link :to="{ name: 'analytics-ump-stats'}">
          <doughnut-chart-container
            class="pb-4"
            :completion-states="COMPLETION_STATES.UMP"
            :data-type="CHART_TYPES.UMP"
          />
        </router-link>
      </v-col>
      <v-col
        v-if="STUDENT_ANALYTICS_BATCH"
        cols="6"
      >
        <router-link
          v-if="newPenChartdata && newPenLabels"
          :to="{ name: 'new-pens'}"
        >
          <bar-chart-container
            class="pb-4"
            :display-y-axis="false"
            :labels="newPenLabels"
            :chart-data="newPenChartdata"
            :title="CHART_TYPES.NEW_PENS"
            :data-type="CHART_TYPES.NEW_PENS"
            annual-total
          />
        </router-link>
        <v-card
          v-else-if="loadingNewPen"
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
      </v-col>
    </v-row>
  </div>
</template>

<script>
import BarChartContainer from './BarChartContainer.vue';
import DoughnutChartContainer from './DoughnutChartContainer.vue';
import {CHART_TYPES, CHART_STAT_URLS, COMPLETION_STATES} from '../../../utils/constants/ChartConstants';
import ApiService from '../../../common/apiService';
import alertMixin from '@/mixins/alertMixin';
import { mapState } from 'pinia';
import {authStore} from '@/store/modules/auth';

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
    COMPLETION_STATES: COMPLETION_STATES,
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
  computed: {
    ...mapState(authStore, ['STUDENT_ANALYTICS_STUDENT_PROFILE', 'STUDENT_ANALYTICS_BATCH']),
  },
  mounted() {
    if(this.STUDENT_ANALYTICS_BATCH) {
      this.fillNewPenData();
      this.fillMergeData();
    }
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
      ApiService.apiAxios.get(CHART_STAT_URLS.MERGE+'?statsType=MERGES_IN_LAST_13_MONTH')
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
