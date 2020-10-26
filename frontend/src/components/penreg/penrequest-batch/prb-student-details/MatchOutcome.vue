<template>
  <v-alert
      v-if="errorCallingMatchResults"
      dense
      text
      dismissible
      outlined
      transition="scale-transition"
      class="bootstrap-error flex-grow-1 mx-3"
  >
    {{ errorMessage }}
  </v-alert>
  <v-card v-else id="searchResults" elevation="0" tile width="100%">
    <v-row no-gutters justify="space-between" class="sticky">
      <v-col>
        <v-card-title>
          <span id="numberMatches" class="px-4"><strong>{{ studentPossibleMatches.length || 0 }} Matches</strong><v-btn
              @click="matchesExpanded=!matchesExpanded" icon><v-icon nudge-bottom="4"
                                                                     color="#003366">{{ !matchesExpanded ? 'fa-angle-up' : 'fa-angle-down' }}</v-icon></v-btn></span>
        </v-card-title>
      </v-col>
      <v-col align-self="center">
        <v-row justify="end" class="mx-3">
          <TertiaryButton disabled id="compareButton" class="ma-0" text="Compare" icon="mdi-content-copy"
                          @click.native="compare"></TertiaryButton>
          <TertiaryButton id="refreshButton" class="ma-0" iconStyle="mdi-flip-h" text="Refresh" icon="mdi-cached"
                          @click.native="refresh"></TertiaryButton>
        </v-row>
      </v-col>
      <v-progress-linear
          id="loading"
          indeterminate
          color="blue"
          :active="loadingMatchResults"
      ></v-progress-linear>
    </v-row>
    <v-slide-y-transition>
      <v-col key="results" v-if="matchesExpanded" class="pa-0">
        <v-divider></v-divider>
        <v-data-table
            id="dataTable"
            :headers="headers"
            hide-default-header
            hide-default-footer
            item-key="studentID"
            :items="studentPossibleMatches">
          <template v-slot:item="props">
            <tr :class="{'selected-record' : props.isSelected}">
              <td v-for="header in props.headers" :key="header.id" :class="header.id">
                <v-checkbox v-if="header.type" class="pl-3" color="#606060" @change="props.select($event)"></v-checkbox>
                <div v-else class="tableCell">
                  <router-link class="pen-link" to="" v-if="header.topValue==='pen'">
                  <span
                      :class="['top-column-item', 'pen-link', props.item[header.topValue] && demogValuesMatch(header.topValue, props.item[header.topValue])?'font-weight-bold':'']">
                    {{ formatPen(props.item[header.topValue]) }}
                  </span>
                  </router-link>
                  <span v-else-if="header.topValue==='mincode'"
                        :class="['top-column-item', props.item[header.topValue] && demogValuesMatch(header.topValue, formattedMincode(props.item[header.topValue]))?'font-weight-bold':'']">
                  {{ formatMinCode(props.item[header.topValue]) }}
                </span>
                  <span v-else-if="header.topValue==='dob'"
                        :class="['top-column-item', props.item[header.topValue] && demogValuesMatch(header.topValue, formatDob(props.item[header.topValue].toString().replaceAll('-','')))?'font-weight-bold':'']">
                  {{ formatDob(props.item[header.topValue].toString().replaceAll('-', '')) }}
                </span>
                  <span v-else
                        :class="['top-column-item', props.item[header.topValue] && demogValuesMatch(header.topValue, props.item[header.topValue])?'font-weight-bold':'', props.item[header.doubleValue] ? 'top-column-item-double' : '']">
                  {{ props.item[header.topValue] }}
                </span>
                  <span
                      :class="['value-half-width','double-column-item', props.item[header.doubleValue] && demogValuesMatch(header.doubleValue, props.item[header.doubleValue])? 'font-weight-bold':'']">
                  {{ props.item[header.doubleValue] }}
                </span>
                  <br>
                  <span v-if="header.bottomValue==='postalCode'"
                        :class="['bottom-column-item', props.item[header.bottomValue] && demogValuesMatch(header.bottomValue, formatPostalCode(props.item[header.bottomValue]))? 'font-weight-bold':'']">
                  {{ formatPostalCode(props.item[header.bottomValue]) }}
                </span>
                  <span v-else
                        :class="['bottom-column-item', props.item[header.bottomValue] && demogValuesMatch(header.bottomValue, props.item[header.bottomValue])? 'font-weight-bold':'']">
                  {{ props.item[header.bottomValue] }}                   
                </span>
                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-slide-y-transition>

  </v-card>
</template>

<script>
import TertiaryButton from '../../../util/TertiaryButton';
import ApiService from '../../../../common/apiService';
import {Routes} from '../../../../utils/constants';
import {formatPen, formatMinCode, formatDob, formatPostalCode} from '../../../../utils/format';

export default {
  name: 'MatchOutcome.vue',
  components: {
    TertiaryButton: TertiaryButton
  },
  props: {
    prbStudent: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      matchesExpanded: true,
      headers: [
        {id: 'table-checkbox', type: 'select', sortable: false},
        {
          topText: 'Mincode',
          bottomText: 'Local ID',
          align: 'start',
          sortable: false,
          topValue: 'mincode',
          bottomValue: 'localID'
        },
        {
          topText: 'Legal Surname',
          bottomText: 'Usual Surname',
          topValue: 'legalLastName',
          bottomValue: 'usualLastName',
          sortable: false
        },
        {
          topText: 'Legal Given',
          bottomText: 'Usual Given',
          topValue: 'legalFirstName',
          bottomValue: 'usualFirstName',
          sortable: false
        },
        {
          topText: 'Legal Middle',
          bottomText: 'Usual Middle',
          topValue: 'legalMiddleNames',
          bottomValue: 'usualMiddleNames',
          sortable: false
        },
        {
          topText: 'DC',
          doubleText: 'Gen',
          bottomText: 'Postal Code',
          topValue: 'dc',
          doubleValue: 'genderCode',
          bottomValue: 'postalCode',
          sortable: false
        },
        {topText: 'Birth Date', bottomText: 'Grade', topValue: 'dob', bottomValue: 'gradeCode', sortable: false},
        {topText: 'Sugg. PEN', bottomText: '', topValue: 'pen', bottomValue: '', sortable: false},
      ],
      studentPossibleMatches: [],
      loadingMatchResults: false,
      errorCallingMatchResults: false,
      errorMessage: 'There was an error in retrieving the data. Try refreshing the page, or leaving this request and returning to it after viewing another.'
    };
  },
  mounted() {
    this.getMatchOutcomeResults();
  },
  methods: {

    compare() {
      //TODO
    },
    demogValuesMatch(valueType, value) {
      switch (valueType) {
        case 'mincode':
          return this.prbStudent.minCode === value;
        case 'pen':
          if (this.prbStudent.assignedPEN) {
            return this.prbStudent.assignedPEN === value;
          } else {
            return this.prbStudent.bestMatchPEN === value;
          }
        default:
          return this.prbStudent[valueType] === value;
      }
    }, formatPen, formatDob, formatMinCode, formatPostalCode,

    getMatchOutcomeResults() {
      this.loadingMatchResults = true;
      const params = {
        params: {
          id: this.prbStudent.penRequestBatchID,
          studentId: this.prbStudent.penRequestBatchStudentID
        }
      };
      ApiService.apiAxios.get(Routes.penRequestBatch.MATCH_OUTCOME_URL, params)
          .then((response) => {
            this.errorCallingMatchResults = false;
            this.studentPossibleMatches = response.data;
          }).catch((error) => {
        this.errorCallingMatchResults = true;
        console.log(error);
      })
          .finally(() => {
            this.loadingMatchResults = false;
          });
    },
    refresh() {
      this.matchesExpanded = true;
      this.getMatchOutcomeResults();
    },
  }
};
</script>

<style scoped>
#searchResults {
  background-color: #F2F2F2;
  z-index: 0;
}

.double-column-item {
  float: right;
}

.top-column-item {
  float: left;
}

.top-column-item-double {
  float: none;
  width: 2.7em;
  display: inline-block;
}

.bottom-column-item {
  float: left;
  min-height: 1.5em;
}

#dataTable {
  background-color: #F2F2F2;
}

#dataTable /deep/ table tr.selected-record {
  background-color: #E1F5FE
}

#dataTable /deep/ table tbody tr:not(.selected-record):hover {
  background-color: inherit
}

#dataTable /deep/ tbody tr td:nth-child(1) {
  width: 3%;
}

#dataTable /deep/ tbody tr td:nth-child(2) {
  width: 10%;
}

#dataTable /deep/ tbody tr td:nth-child(3),
#dataTable /deep/ tbody tr td:nth-child(4) {
  width: 18%;
}

#dataTable /deep/ tbody tr td:nth-child(5) {
  width: 19%;
}

#dataTable /deep/ tbody tr td:nth-child(6) {
  width: 9.5%;
}

#dataTable /deep/ tbody tr td:nth-child(7) {
  width: 9.5%;
}

.pen-link {
  text-decoration: underline;
}

.value-half-width {
  display: contents;
}

.sticky {
  position: sticky;
  top: 16rem;
  z-index: 6;
  background-color: #F2F2F2;
}

.table-checkbox /deep/ .v-input__slot, .v-input--checkbox {
  padding-top: 0;
}

#loading {
  z-index: 6;
}
</style>
