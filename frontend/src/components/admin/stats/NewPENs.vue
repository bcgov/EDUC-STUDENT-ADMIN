<template>
  <v-container
    fluid
    class="full-height px-0"
  >
    <v-form
      id="searchStudentForm"
      ref="studentSearchForm"
      v-model="validForm"
    >
      <v-row>
        <v-col cols="9">
          <BarChartContainer
            v-if="labels && chartData"
            :display-y-axis="displayYAxis"
            :height-value="heightValue"
            :labels="labels"
            :chart-data="chartData"
            title="New PENs by Month"
            data-type="New PENs"
            annual-total
          />
          <spinner v-else/>
        </v-col>
        <v-col cols="3">
          <v-row
            class="d-flex justify-end"
          >
            <v-col style="text-align: -webkit-right">
              <v-select
                id="k12PSIselector"
                v-model="selectedSchoolGroup"
                :items="schoolGroups"
                item-title="text"
                item-value="value"
                variant="solo-filled"
                label="K-12/PSI Filter"
                color="#38598a"
                clearable
              />
            </v-col>
            <v-col>
              <v-select
                id="newPENTimeframe"
                v-model="timeframe"
                :items="timeframes"
                item-title="text"
                item-value="value"
                label="Timeframe"
                variant="solo-filled"
                color="#38598a"
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
                  <v-expansion-panel-title style="border-bottom-left-radius: 4px;border-bottom-right-radius: 4px;color: #FFFFFF;background-color: rgb(0, 51, 102);border-color: rgb(0, 51, 102);">
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
                          variant="solo-filled"
                          maxlength="9"
                          minlength="9"
                          autofocus
                          @keypress="isValidNumber($event)"
                          @keyup.enter="getNewPENs"
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
                          variant="solo-filled"
                          maxlength="8"
                          minlength="8"
                          @keypress="isValidNumber($event)"
                          @keyup.enter="getNewPENs"
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
                          variant="solo-filled"
                          maxlength="255"
                          @keyup.enter="getNewPENs"
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
                          variant="solo-filled"
                          maxlength="255"
                          @keyup.enter="getNewPENs"
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
                          density="compact"
                          filled
                          variant="solo-filled"
                          maxlength="255"
                          @keyup.enter="getNewPENs"
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
                        style="text-align: -webkit-right"
                      >
                        <PrimaryButton
                          id="search-clear"
                          :secondary="true"
                          @click-action="clearSearch"
                          text="Clear"
                        />
                      </v-col>
                      <v-col
                        cols="4"
                        class="ml-2"
                      >
                        <PrimaryButton
                          :disabled="!searchEnabled"
                          :loading="searchLoading"
                          text="Refine"
                          @click-action="getNewPENs"
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
      <v-container
        v-if="searchLoading"
        fluid
        class="fill-height px-0"
      >
        <v-row>
          <v-container
            fluid
            class="full-height"
          >
            <article
              id="match-results-container"
              class="top-banner full-height"
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
            </article>
          </v-container>
        </v-row>
      </v-container>
      <v-container
        v-else
        fluid
        class="fill-height px-0"
      >
        <v-row no-gutters>
          <v-card
            elevation="0"
            height="100%"
            width="100%"
            style="background-color:#d7d7d7;"
          >
            <v-row
              v-if="studentSearchResponse"
              no-gutters
              class="pt-3 mb-n1"
              style="background-color:white;"
            >
              <v-divider class="mx-3"/>
            </v-row>
            <v-row
              v-if="studentSearchResponse"
              id="resultsRow"
              no-gutters
              class="py-2"
              style="background-color:white;"
            >
              <StudentSearchResults
                :search-criteria="currentStudentSearchParams"
                :prep-put="prepRefineFilter"
                :show-compare="false"
                :search-loading="searchLoading"
              />
            </v-row>
          </v-card>
        </v-row>
      </v-container>
    </v-form>
  </v-container>
</template>
<script>
import {LocalDate, LocalDateTime} from '@js-joda/core';
import ApiService from '../../../common/apiService';
import {Routes} from '@/utils/constants';
import {mapActions, mapState} from 'pinia';
import StudentSearchResults from '@/components/penreg/student-search/StudentSearchResults.vue';
import alertMixin from '@/mixins/alertMixin';
import {isValidNumber} from '@/utils/validation';
import BarChartContainer from '@/components/admin/stats/BarChartContainer.vue';
import {CHART_STAT_URLS} from '@/utils/constants/ChartConstants';
import Spinner from '@/components/common/Spinner.vue';
import {studentSearchStore} from '@/store/modules/studentSearch';
import {penRequestBatchStore} from '@/store/modules/penRequestBatch';
import PrimaryButton from '@/components/util/PrimaryButton.vue';

export default {
  name: 'Newpens',
  components: {
    Spinner,
    BarChartContainer,
    StudentSearchResults,
    PrimaryButton
  },
  mixins: [alertMixin],
  props: {
    searchParams: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      validForm: false,
      menu: false,
      localDate: LocalDate,
      schoolGroups: [{value: 'K12', text: 'K-12'}, {value: 'PSI', text: 'PSI'}],
      timeframes: [{value: 'TODAY', text: 'Today'}, {value: '2DAYS', text: 'In the last 2 days'}, {
        value: '1WEEK',
        text: 'In the last week'
      }],
      timeframe: 'TODAY',
      searchLoading: true,
      searchEnabled: false,
      selectedSchoolGroup: null,
      currentStudentSearchParams: {},
      penSearch: null,
      mincodeSearch: null,
      legalSurnameSearch: null,
      legalGivenNameSearch: null,
      legalMiddleNameSearch: null,
      labels: null,
      chartData: null,
      heightValue: '7rem',
      displayYAxis: false
    };
  },
  computed: {
    ...mapState(studentSearchStore, ['pageNumber', 'headerSortParams', 'studentSearchResponse']),
    ...mapState(penRequestBatchStore, ['prbValidationFieldCodes', 'prbValidationIssueTypeCodes']),
    genderCodes() {
      return this.genders ? this.genders.map(a => a.genderCode) : [];
    },
    gradeCodes() {
      return this.gradeCodeObjects ? this.gradeCodeObjects.map(a => a.gradeCode) : [];
    },
    charRules() {
      return [
        v => !(/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u1100-\u11FF\u3040-\u309F\u30A0-\u30FF\u3130-\u318F\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF]/.test(v)) || 'Enter English characters only'
      ];
    }
  },
  watch: {
    studentSearchResponse: {
      async handler() {
        await this.$nextTick();
        document.getElementById('resultsRow')?.scrollIntoView({behavior: 'smooth'});
      }
    },
    timeframe: {
      async handler() {
        await this.$nextTick();
        this.getNewPENs();
      }
    },
    selectedSchoolGroup: {
      async handler() {
        await this.$nextTick();
        this.getNewPENs();
      }
    }
  },
  mounted() {
    this.studentSearchParams = {...this.studentSearchParams};
    this.studentSearchParams.createDate = {};
    this.headerSortParams.currentSort = 'pen';
    this.getNewPENs(true, true);
    this.fillNewPenData();
  },
  methods: {
    ...mapActions(studentSearchStore, ['setPageNumber', 'setSelectedRecords', 'setStudentSearchResponse']),
    isValidNumber,
    clearSearch() {
      this.penSearch = null;
      this.mincodeSearch = null;
      this.legalSurnameSearch = null;
      this.legalGivenNameSearch = null;
      this.legalMiddleNameSearch = null;
      this.getNewPENs(true);
    },
    async refineHasValues() {
      if (this.penSearch || this.mincodeSearch || this.legalSurnameSearch || this.legalGivenNameSearch || this.legalMiddleNameSearch) {
        this.searchEnabled = true;
        return true;
      } else {
        this.searchEnabled = false;
      }
    },
    setTimeframeCriteria() {
      let today = LocalDateTime.now();
      let backMidnight = today.withHour(0).withMinute(0).withSecond(0).withNano(0);
      let yesterday;
      if (this.timeframe === '1WEEK') {
        yesterday = backMidnight.minusWeeks(1);
      } else if (this.timeframe === '2DAYS') {
        yesterday = backMidnight.minusDays(1);
      } else {
        yesterday = backMidnight;
      }
      this.studentSearchParams.createDate.startDate = yesterday;
      this.studentSearchParams.createDate.endDate = today;
    },
    setK12PSICriteria() {
      this.studentSearchParams.mincode = null;
      if (this.selectedSchoolGroup === 'PSI') {
        this.studentSearchParams.mincode = '102';
      } else if (this.selectedSchoolGroup === 'K12') {
        this.studentSearchParams.mincode = {};
        this.studentSearchParams.mincode.notstartswith = '102';
      }
    },
    setSearchCriteria() {
      if (this.studentSearchParams.mincode === null) {
        delete this.studentSearchParams['mincode'];
      }
      delete this.studentSearchParams['pen'];
      delete this.studentSearchParams['legalLastName'];
      delete this.studentSearchParams['legalFirstName'];
      delete this.studentSearchParams['legalMiddleNames'];

      if (this.penSearch) {
        this.studentSearchParams.pen = this.penSearch;
      }
      if (this.mincodeSearch) {
        this.studentSearchParams.mincode = this.mincodeSearch;
      }
      if (this.legalSurnameSearch) {
        this.studentSearchParams.legalLastName = this.legalSurnameSearch;
      }
      if (this.legalGivenNameSearch) {
        this.studentSearchParams.legalFirstName = this.legalGivenNameSearch;
      }
      if (this.legalMiddleNameSearch) {
        this.studentSearchParams.legalMiddleNames = this.legalMiddleNameSearch;
      }
    },
    fillNewPenData() {
      ApiService.apiAxios.get(CHART_STAT_URLS.NEW_PEN)
        .then(response => {
          this.labels = response.data.labels;
          this.chartData = response.data.data;
        })
        .catch(e => {
          this.setFailureAlert('Failed to load new pen statistics. Please try again later.');
          console.log(e);
        })
        .finally(() => {
          this.searchLoading = false;
        });

    },
    getNewPENs(validationRequired = true) {
      this.searchLoading = true;
      this.setSelectedRecords();
      this.setPageNumber(1);
      this.headerSortParams['currentSortAsc'] = true;
      this.setTimeframeCriteria();
      this.setK12PSICriteria();
      this.setSearchCriteria();
      if (validationRequired === false || (this.$refs.studentSearchForm.validate())) {
        const studentSearchKeys = Object.keys(this.studentSearchParams).filter(k => (this.studentSearchParams[k] && this.studentSearchParams[k].length !== 0));
        let refineFilters;
        if (studentSearchKeys?.length > 0) {
          refineFilters = {};
          studentSearchKeys.forEach(element => {
            refineFilters[element] = this.studentSearchParams[element];
          });
        }

        ApiService.apiAxios
          .get(Routes['student'].SEARCH_URL, this.prepRefineFilter(refineFilters))
          .then(response => {
            this.setStudentSearchResponse(response.data);
            this.currentStudentSearchParams = JSON.parse(JSON.stringify(refineFilters));
          })
          .catch(error => {
            if (error?.response?.status === 400) {
              this.setFailureAlert(error?.response?.data?.message);
            } else {
              this.setFailureAlert('An error occurred while loading the new pens. Please try again later.');
            }
            console.error(error.response);
          })
          .finally(() => {
            this.searchLoading = false;
          });
      } else {
        this.searchLoading = false;
      }
    },
    prepRefineFilter(refineFilters) {
      let sort = {};
      sort[this.headerSortParams.currentSort] = this.headerSortParams.currentSortAsc ? 'ASC' : 'DESC';
      return {
        params: {
          pageNumber: this.pageNumber - 1,
          sort: sort,
          searchQueries: refineFilters
        }
      };
    },
  }
};
</script>

