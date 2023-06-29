<template>
  <v-container
    fluid
    class="full-height px-0"
  >
    <v-row>
      <v-col cols="9">
        <BarChartContainer
          v-if="mergeChartData"
          :display-y-axis="displayYAxis"
          :height-value="heightValue"
          :labels="mergeLabels"
          :chart-data="mergeChartData"
          title="Merges by Month"
          data-type="Merges"
          annual-total
        />
        <spinner v-else />
      </v-col>
      <v-col cols="3">
        <v-row
          no-gutters
          class="d-flex justify-end"
        >
          <v-col>
            <v-select
              id="mergeTimeframe"
              v-model="timeframe"
              :items="timeframes"
              item-title="text"
              item-value="value"
              variant="solo"
              color="#38598a"
              :menu-props="{ offsetY: true }"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <Spinner v-if="loadingDataTable" />
        <MergedStudentsDataTable
          v-else
          :merged-and-true-students="mergedAndTrueStudents"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import {LocalDate} from '@js-joda/core';
import ApiService from '../../../common/apiService';
import alertMixin from '@/mixins/alertMixin';
import BarChartContainer from '@/components/admin/stats/BarChartContainer.vue';
import {CHART_STAT_URLS} from '@/utils/constants/ChartConstants';
import Spinner from '@/components/common/Spinner.vue';
import MergedStudentsDataTable from '@/components/admin/stats/MergedStudentsStatsDataTable.vue';

export default {
  name: 'Merges',
  components: {
    MergedStudentsDataTable,
    Spinner,
    BarChartContainer,
  },
  mixins: [alertMixin],
  data: () => ({
    loadingDataTable: false,
    mergedAndTrueStudents: [],
    validForm: false,
    menu: false,
    localDate: LocalDate,
    schoolGroups: [{value: 'K12', text: 'K-12'}, {value: 'PSI', text: 'PSI'}],
    timeframes: [{value: 'MERGE_DETAILS_TODAY', text: 'Today'}, {value: 'MERGE_DETAILS_LAST_2_WEEKS', text: 'In Last 2 Weeks'}, {
      value: 'MERGE_DETAILS_LAST_MONTH',
      text: 'In Last Month'
    }],
    timeframe: 'MERGE_DETAILS_TODAY',
    searchLoading: false,
    searchEnabled: false,
    penSearch: null,
    mincodeSearch: null,
    legalSurnameSearch: null,
    legalGivenNameSearch: null,
    legalMiddleNameSearch: null,
    heightValue: '7rem',
    displayYAxis: false,
    mergeChartData: null,
    mergeLabels: null,
  }),
  computed: {},
  watch: {
    timeframe: {
      async handler() {
        await this.$nextTick();
        this.fillMergeDataTable();
      }
    }
  },
  mounted() {
    this.fillMergeDataTable();
    this.fillMergeChartData();
  },
  methods: {
    fillMergeChartData() {
      ApiService.apiAxios.get(CHART_STAT_URLS.MERGE + '?statsType=MERGES_IN_LAST_13_MONTH')
        .then(response => {
          this.mergeLabels = response.data.labels;
          this.mergeChartData = response.data.data;
        })
        .catch(e => {
          this.setFailureAlert('Failed to load merge statistics. Please try again later.');
          console.log(e);
        })
        .finally(() => {
          this.loadingMerge = false;
        });
    },
    fillMergeDataTable() {
      this.loadingDataTable = true;
      ApiService.apiAxios.get(CHART_STAT_URLS.MERGE + `?statsType=${this.timeframe}`)
        .then(response => {
          this.mergedAndTrueStudents = response.data;
        })
        .catch(e => {
          this.setFailureAlert('Failed to load merge details. Please try again later.');
          console.log(e);
        })
        .finally(() => {
          this.loadingDataTable = false;
        });
    },
    clearSearch() {
      this.penSearch = null;
      this.mincodeSearch = null;
      this.legalSurnameSearch = null;
      this.legalGivenNameSearch = null;
      this.legalMiddleNameSearch = null;
    }

  }
};
</script>

