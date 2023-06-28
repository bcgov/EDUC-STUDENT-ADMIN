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
              variant="underlined"
              density="compact"
              outlined
              color="#38598a"
              append-icon="mdi-chevron-down"
              :menu-props="{ offsetY: true }"
            />
          </v-col>
        </v-row>
        <v-row
          class="justify-end mt-n3"
          no-gutters
        >
          <v-col
            cols="12"
            no-gutters
          >
            <v-expansion-panels focusable>
              <v-expansion-panel>
                <v-expansion-panel-title
                  style="border-bottom-left-radius: 4px;border-bottom-right-radius: 4px;color: #FFFFFF;background-color: rgb(0, 51, 102);border-color: rgb(0, 51, 102);"
                >
                  <template #actions>
                    <v-icon color="white">
                      $expand
                    </v-icon>
                  </template>
                  Refine Results
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row
                    no-gutters
                    class="mt-4"
                  >
                    <v-col
                      class="mt-2"
                      cols="2"
                    >
                      PEN:
                    </v-col>
                    <v-col
                      cols="4"
                      class="mr-15"
                    >
                      <v-text-field
                        id="pen"
                        v-model="penSearch"
                        density="compact"
                        filled
                        outlined
                        maxlength="9"
                        minlength="9"
                        autofocus
                        @input="[refineHasValues()]"
                      />
                    </v-col>
                  </v-row>
                  <v-row
                    no-gutters
                    class="mt-n4"
                  >
                    <v-col
                      class="mt-2"
                      cols="3"
                    >
                      Mincode:
                    </v-col>
                    <v-col
                      cols="3"
                      class="mr-15"
                    >
                      <v-text-field
                        id="mincode"
                        v-model="mincodeSearch"
                        density="compact"
                        filled
                        outlined
                        maxlength="8"
                        minlength="8"
                        @input="[refineHasValues()]"
                      />
                    </v-col>
                  </v-row>
                  <v-row
                    no-gutters
                    class="mt-n4"
                  >
                    <v-col
                      class="mt-2"
                      cols="4"
                    >
                      Legal Surname:
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        id="legalLastName"
                        v-model="legalSurnameSearch"
                        density="compact"
                        filled
                        outlined
                        maxlength="255"
                        @input="[refineHasValues()]"
                      />
                    </v-col>
                  </v-row>
                  <v-row
                    no-gutters
                    class="mt-n4"
                  >
                    <v-col
                      class="mt-2"
                      cols="4"
                    >
                      Legal Given:
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        id="legalFirstName"
                        v-model="legalGivenNameSearch"
                        density="compact"
                        filled
                        outlined
                        maxlength="255"
                        @input="[refineHasValues()]"
                      />
                    </v-col>
                  </v-row>
                  <v-row
                    no-gutters
                    class="mt-n4"
                  >
                    <v-col
                      class="mt-2"
                      cols="4"
                    >
                      Legal Middle:
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        id="legalMiddleNames"
                        v-model="legalMiddleNameSearch"
                        dense
                        filled
                        outlined
                        maxlength="255"
                        @input="[refineHasValues()]"
                      />
                    </v-col>
                  </v-row>
                  <v-row
                    no-gutters
                    class="justify-end mt-n2"
                  >
                    <v-col
                      cols="4"
                      style="text-align: -webkit-right;"
                    >
                      <PrimaryButton
                        id="search-clear"
                        :secondary="true"
                        :click-action="clearSearch"
                        text="Clear"
                      />
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
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
          :mincode-search="mincodeSearch"
          :legal-given-name-search="legalGivenNameSearch"
          :legal-surname-search="legalSurnameSearch"
          :legal-middle-name-search="legalMiddleNameSearch"
          :pen-search="penSearch"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import {LocalDate} from '@js-joda/core';
import ApiService from '../../../common/apiService';
import alertMixin from '@/mixins/alertMixin';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import BarChartContainer from '@/components/admin/stats/BarChartContainer.vue';
import {CHART_STAT_URLS} from '@/utils/constants/ChartConstants';
import Spinner from '@/components/common/Spinner.vue';
import MergedStudentsDataTable from '@/components/admin/stats/MergedStudentsStatsDataTable.vue';

export default {
  name: 'Merges',
  components: {
    MergedStudentsDataTable,
    Spinner,
    PrimaryButton,
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
    refineHasValues() {
      if (this.penSearch || this.mincodeSearch || this.legalSurnameSearch || this.legalGivenNameSearch || this.legalMiddleNameSearch) {
        this.searchEnabled = true;
        return true;
      } else {
        this.searchEnabled = false;
      }
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

