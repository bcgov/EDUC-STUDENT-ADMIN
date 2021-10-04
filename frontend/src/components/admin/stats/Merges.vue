<template>
  <v-container fluid class="full-height px-0">
      <v-row>
        <v-col cols="9"><BarChartContainer :displayYAxis="displayYAxis" :heightValue="heightValue" :labels="labels" :chart-data="chartData" data-type="Merges by Month"></BarChartContainer></v-col>
        <v-col cols="3">
          <v-row no-gutters class="d-flex justify-end">
              <v-col>
                <v-select
                    id="newPENTimeframe"
                    :items="timeframes"
                    v-model="timeframe"
                    dense
                    outlined
                    color="#38598a"
                    append-icon="mdi-chevron-down"
                    :menu-props="{ offsetY: true }"
                ></v-select>
              </v-col>
          </v-row>
          <v-row class="justify-end mt-n3" no-gutters>
            <v-col cols="12" no-gutters>
              <v-expansion-panels focusable>
                <v-expansion-panel>
                  <v-expansion-panel-header style="border-bottom-left-radius: 4px;border-bottom-right-radius: 4px;color: #FFFFFF;background-color: rgb(0, 51, 102);border-color: rgb(0, 51, 102);">
                    <template v-slot:actions>
                      <v-icon color="white">
                        $expand
                      </v-icon>
                    </template>
                    Refine Results
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-row no-gutters class="mt-4">
                      <v-col class="mt-2" cols="2">PEN:</v-col>
                      <v-col cols="4" class="mr-15">
                        <v-text-field
                            dense
                            filled
                            outlined
                            id='pen'
                            v-model="penSearch"
                            @keyup.enter="getNewPENs(true)"
                            maxlength="9"
                            minlength="9"
                            @keypress="isValidNumber($event)"
                            v-on:input="[refineHasValues()]"
                            autofocus>
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters class="mt-n4">
                      <v-col class="mt-2" cols="3">Mincode:</v-col>
                      <v-col cols="3" class="mr-15">
                        <v-text-field
                            dense
                            filled
                            outlined
                            id='mincode'
                            v-model="mincodeSearch"
                            maxlength="8"
                            minlength="8"
                            @keypress="isValidNumber($event)"
                            @keyup.enter="getNewPENs(true)"
                            v-on:input="[refineHasValues()]">
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters class="mt-n4">
                      <v-col class="mt-2" cols="4">Legal Surname:</v-col>
                      <v-col cols="6">
                        <v-text-field dense filled outlined
                                      id='legalLastName'
                                      v-model="legalSurnameSearch"
                                      maxlength="255"
                                      @keyup.enter="getNewPENs(true)"
                                      v-on:input="[refineHasValues()]"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters class="mt-n4">
                      <v-col class="mt-2" cols="4">Legal Given:</v-col>
                      <v-col cols="6">
                        <v-text-field dense filled outlined
                                      id='legalFirstName'
                                      v-model="legalGivenNameSearch"
                                      maxlength="255"
                                      @keyup.enter="getNewPENs(true)"
                                      v-on:input="[refineHasValues()]"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters class="mt-n4">
                      <v-col class="mt-2" cols="4">Legal Middle:</v-col>
                      <v-col cols="6">
                        <v-text-field dense filled outlined
                                      id='legalMiddleNames'
                                      v-model="legalMiddleNameSearch"
                                      maxlength="255"

                                      v-on:input="[refineHasValues()]"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters class="justify-end mt-n2">
                      <v-col cols="4" style="text-align: -webkit-right">
                        <PrimaryButton id="search-clear" :secondary="true" @click.native="clearSearch" text="Clear"></PrimaryButton>
                      </v-col>
                      <v-col cols="4" class="ml-2">
                        <PrimaryButton :disabled="!searchEnabled" :loading="searchLoading"  text="Refine"></PrimaryButton>
                      </v-col>
                    </v-row>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
  </v-container>
</template>
<script>
import {LocalDate, LocalDateTime} from '@js-joda/core';
import ApiService from '../../../common/apiService';
import {Routes} from '@/utils/constants';
import {mapMutations, mapState} from 'vuex';
import StudentSearchResults from '@/components/penreg/student-search/StudentSearchResults';
import alertMixin from '@/mixins/alertMixin';
import PrimaryButton from '@/components/util/PrimaryButton';
import BarChartContainer from '@/components/admin/stats/BarChartContainer';

export default {
  name: 'merges',
  components: {
    PrimaryButton,
    BarChartContainer,
    StudentSearchResults
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
      timeframes: [{value: 'TODAY', text: 'Today'}, {value: '2DAYS', text: 'In the last 2 days'}, {value: '1WEEK', text: 'In the last week'}],
      timeframe: 'TODAY',
      searchLoading: false,
      searchEnabled: false,
      selectedSchoolGroup: '',
      currentStudentSearchParams: {},
      penSearch: null,
      mincodeSearch: null,
      legalSurnameSearch: null,
      legalGivenNameSearch: null,
      legalMiddleNameSearch: null,
      labels: ['January', 'February','March','April','May','June','July','August','September','October','November','December'],
      chartData: [20,50,60,30,34,10,60,80,40,23,21,38],
      heightValue: '7rem',
      displayYAxis: false
    };
  },
  computed: {
  },
  mounted() {
  },
  watch: {
  },
  methods: {
    refineHasValues() {
      if (this.penSearch || this.mincodeSearch || this.legalSurnameSearch || this.legalGivenNameSearch || this.legalMiddleNameSearch) {
        this.searchEnabled = true;
        return true;
      } else {
        this.searchEnabled = false;
      }
    },
    setTimeframeCriteria(){
      let today = LocalDateTime.now();
      let backMidnight = today.withHour(0).withMinute(0).withSecond(0).withNano(0);
      let yesterday;
      if(this.timeframe === '1WEEK'){
        yesterday = backMidnight.minusWeeks(1);
      }else if(this.timeframe === '2DAYS'){
        yesterday = backMidnight.minusDays(1);
      }else{
        yesterday = backMidnight;
      }
      this.studentSearchParams.createDate.startDate = yesterday;
      this.studentSearchParams.createDate.endDate = today;
    },

  }
};
</script>

