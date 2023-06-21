<template>

  <v-card id="searchResults" elevation="0" tile width="100%" class="px-8">
    <v-row no-gutters justify="space-between" class="sticky" :style="{top: `${stickyInfoPanelHeight}px`}">
      <v-col>
        <v-card-title>
          <span id="numberMatches" class="px-4"><strong>{{ title }}</strong><v-btn
              @click="matchesExpanded=!matchesExpanded" icon><v-icon nudge-bottom="4"
                                                                     color="#003366">{{
              !matchesExpanded ? 'fa-angle-up' : 'fa-angle-down'
            }}</v-icon></v-btn></span>
        </v-card-title>
      </v-col>
      <v-col align-self="center">
        <v-row justify="end" class="mx-3" v-if="isComparisonRequired || isRefreshRequired">
          <CompareDemographicModal :disabled="selectedRecords.length<2 || selectedRecords.length>3"
                                   :selectedRecords.sync="selectedRecords"></CompareDemographicModal>
          <TertiaryButton v-if="isRefreshRequired" id="refreshButton" :disabled="disableRefresh" class="ma-0"
                          icon="mdi-cached"
                          iconStyle="mdi-flip-h" text="Refresh"
                          @click.native="$emit('refresh-match-results')"></TertiaryButton>
        </v-row>
      </v-col>
    </v-row>
    <v-row no-gutters >
      <v-slide-y-transition>
        <v-col key="results" v-if="matchesExpanded" class="pa-0">
          <v-divider></v-divider>
          <v-data-table
              id="penMatchResultsDataTable"
              v-model="selectedRecords"
              :headers="headers"
              hide-default-header
              hide-default-footer
              disable-pagination
              item-key="studentID"
              :items="studentPossibleMatches">
            <template v-slot:item="props">
              <tr :key="props.index"
                  @mouseover="enableMatchOrUnMatch(props.item)"
                  @mouseleave="disableMatchOrUnMatch(props.item)"
                  :class="['resultsTableRow',
                    hoveredOveredRowStudentID === props.item.studentID?'hovered-record-match-unmatch':'' ,
                    props.isSelected?'selected-record':'',
                    isMatchedToStudent(props.item)?'matchedStudentRow':'',
                    grayoutPossibleMatches(props.item) ? 'grayout':'']">
                <td v-for="header in props.headers" :key="header.id" :class="header.id">
                  <div :class="[props.item[header.doubleValue] ? 'value-half-width':'','tableCell']">
                    <span v-if="header.type">
                      <v-checkbox
                              :class="['checkbox', 'pl-3']"
                              color="#606060"
                              :input-value="props.isSelected"
                              dense
                              @change="props.select($event)"></v-checkbox>
                      <v-icon
                              :class="['checkboxIcon', 'pl-3', ]"
                              v-if="header.bottomValue==='icon' && props.item['iconValue']"
                              color="#606060">
                        {{ props.item['iconValue'] }}
                      </v-icon>
                      <span v-else class="bottom-column-item"> </span>
                    </span>
                    <span v-else>
                      <span v-if="header.topValue==='pen'">
                        <a class="pen-link" @click="popStudentDialog(props.item['studentID'])" v-if="isPenLink">
                          <span
                              :class="['top-column-item', 'pen-link', props.item[header.topValue] && demogValuesMatch(header.topValue, props.item[header.topValue])?'font-weight-bold':'']">
                            {{ formatPen(props.item[header.topValue]) }}
                          </span>
                        </a>
                        <span v-else :class="['top-column-item', props.item[header.topValue] && demogValuesMatch(header.topValue, props.item[header.topValue])?'font-weight-bold':'']">
                          {{ formatPen(props.item[header.topValue]) }}
                        </span>
                        <v-tooltip top max-width="40vw" v-if="props.item['memo']">
                          <template v-slot:activator="{ on }">
                            <v-icon class="mx-1" v-on="on">
                              sticky_note_2
                            </v-icon>
                          </template>
                          <span>
                            {{ props.item['memo'] }}
                          </span>
                        </v-tooltip>
                      </span>
                      <span v-else-if="header.topValue==='mincode'"
                            :class="['top-column-item', props.item[header.topValue] && demogValuesMatch(header.topValue, props.item[header.topValue])?'font-weight-bold':'']">
                          {{ formatMincode(props.item[header.topValue]) }}
                      </span>
                      <span v-else-if="header.topValue==='dob'"
                            :class="['top-column-item', props.item[header.topValue] && demogValuesMatch(header.topValue, props.item[header.topValue])?'font-weight-bold':'']">
                          {{ formatDob(props.item[header.topValue], 'uuuu-MM-dd') }}
                      </span>
                      <span v-else
                            :class="['top-column-item', props.item[header.topValue] && demogValuesMatch(header.topValue, props.item[header.topValue])?'font-weight-bold':'']">
                          {{ props.item[header.topValue] }}
                      </span>
                      <span
                          :class="['double-column-item', props.item[header.doubleValue] && demogValuesMatch(header.doubleValue, props.item[header.doubleValue])? 'font-weight-bold':'']">
                        {{ props.item[header.doubleValue] }}
                      </span>
                      <br>
                      <span v-if="!!isMatchUnMatch && header.bottomValue==='button' && hoveredOveredRowStudentID === props.item.studentID">
                        <PrimaryButton :short="true" id="matchUnMatchButton" :text="matchUnMatchButtonText"
                                       :width="'6.5em'"
                                       :disabled="disableMatchUnmatch"
                                       @click.native="$emit('match-unmatch-student', props.item, matchUnMatchButtonText)"></PrimaryButton>
                      </span>
                      <span v-else-if="header.bottomValue==='postalCode'"
                            :class="['bottom-column-item', props.item[header.bottomValue] && demogValuesMatch(header.bottomValue, props.item[header.bottomValue])? 'font-weight-bold':'']">
                        {{ formatPostalCode(props.item[header.bottomValue]) }}
                      </span>

                      <!-- if top and bottom value are the same, do not display the bottom value -->
                      <span v-else :class="['bottom-column-item', props.item[header.bottomValue] && demogValuesMatch(header.bottomValue, props.item[header.bottomValue])? 'font-weight-bold':'']"
                      >{{ props.item[header.bottomValue] !== props.item[header.topValue] ? props.item[header.bottomValue]: '' }}</span>
                    </span>
                  </div>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-col>
      </v-slide-y-transition>
    </v-row>
    <StudentDetailModal
        :studentID="currentStudentID"
        :openDialog="openStudentDialog"
        @closeDialog="closeDialog"
    ></StudentDetailModal>
  </v-card>
</template>

<script>

import CompareDemographicModal from './CompareDemographicsCommon.vue';
import TertiaryButton from '../util/TertiaryButton.vue';
import StudentDetailModal from '../penreg/student/StudentDetailModal.vue';
import {formatDob, formatMincode, formatPen, formatPostalCode} from '@/utils/format';
import {mapState} from 'pinia';
import PrimaryButton from '@/components/util/PrimaryButton.vue';
import {appStore} from '@/store/modules/app';

export default {
  name: 'PenMatchResultsTable',
  components: {
    CompareDemographicModal,
    PrimaryButton,
    TertiaryButton,
    StudentDetailModal
  },
  props: {
    student: {
      type: Object,
      required: true
    },
    possibleMatch: {
      type: Array,
      required: true
    },
    isComparisonRequired: {
      type: Boolean,
      required: true
    },
    isRefreshRequired: {
      type: Boolean,
      required: true
    },
    isPenLink: {
      type: Boolean,
      required: true
    },
    isMatchUnMatch: {
      type: Boolean,
      required: true
    },
    disableMatchUnmatch: {
      type: Boolean,
      default: false
    },
    disableRefresh: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      required: true
    },
    showMatchButton: {
      type: Function,
      required: true
    },
    showUnmatchButton: {
      type: Function,
      required: true
    },
    grayoutPossibleMatches: {
      type: Function,
      required: true
    },
  },
  data() {
    return {
      currentStudentID: null,
      openStudentDialog: false,
      matchesExpanded: true,
      headers: [
        {
          id: 'table-checkbox',
          type: 'select',
          sortable: false,
          bottomValue: 'icon'
        },
        {
          topText: 'Mincode',
          bottomText: 'Local ID',
          align: 'start',
          sortable: false,
          topValue: 'mincode',
          bottomValue: 'localID',
          topTooltip: 'Mincode',
          bottomTooltip: 'Local ID'
        },
        {
          topText: 'Legal Surname',
          bottomText: 'Usual Surname',
          topValue: 'legalLastName',
          bottomValue: 'usualLastName',
          sortable: false,
          topTooltip: 'Legal Surname',
          bottomTooltip: 'Usual Surname'
        },
        {
          topText: 'Legal Given',
          bottomText: 'Usual Given',
          topValue: 'legalFirstName',
          bottomValue: 'usualFirstName',
          sortable: false,
          topTooltip: 'Legal Given',
          bottomTooltip: 'Usual Given'
        },
        {
          topText: 'Legal Middle',
          bottomText: 'Usual Middle',
          topValue: 'legalMiddleNames',
          bottomValue: 'usualMiddleNames',
          sortable: false,
          topTooltip: 'Legal Middle',
          bottomTooltip: 'Usual Middle'
        },
        {
          topText: 'DC',
          doubleText: 'Gen',
          bottomText: 'Postal Code',
          topValue: 'demogCode',
          doubleValue: 'genderCode',
          bottomValue: 'postalCode',
          sortable: false,
          topTooltip: 'Demographic Code',
          bottomTooltip: 'Postal Code',
          doubleTooltip: 'Gender'
        },
        {topText: 'Birth Date', bottomText: 'Grade', topValue: 'dob', bottomValue: 'gradeCode', sortable: false, topTooltip: 'Birth Date', bottomTooltip: 'Grade Code'},
        {topText: 'Sugg. PEN', bottomText: '', topValue: 'pen', bottomValue: 'button', sortable: false, topTooltip: 'Suggested PEN'},
      ],
      studentPossibleMatches: [],
      loadingMatchResults: false,
      errorCallingMatchResults: false,
      errorMessage: 'There was an error in retrieving the data. Try refreshing the page, or leaving this request and returning to it after viewing another.',
      isMatchUnMatchEnabled: false,
      selectedRecords: [],
      hoveredOveredRowStudentID: null,
      matchUnMatchButtonText: null,
    };
  },
  mounted() {
    this.studentPossibleMatches = this.possibleMatch;
  },
  watch: {
    possibleMatch(newValue) {
      this.studentPossibleMatches = newValue;
    },
  },
  computed: {
    ...mapState(appStore, ['stickyInfoPanelHeight']),
    isMatchedToStudent(){
      return item => !!item?.matchedToStudent;
    },
  },
  methods: {
    popStudentDialog(studentID) {
      this.currentStudentID = studentID;
      this.openStudentDialog = true;
    },
    closeDialog() {
      this.openStudentDialog = false;
    },
    demogValuesMatch(valueType, value) {
      switch (valueType) {
      case 'postalCode':
        return this.student?.postalCode?.replace(' ', '')?.toLowerCase() === value?.replace(' ', '')?.toLowerCase(); // match without space
      case 'dob':
        return this.student?.dob?.replace(/\D/g, '') === value?.replace(/\D/g, ''); // match birth date without - or /
      case 'mincode':
        return this.student?.mincode?.replace(/\s/g, '') === value?.replace(/\s/g, '');
      case 'pen':
        if (this.student.assignedPEN) {
          return this.student?.assignedPEN?.replace(/\s/g, '') === value?.replace(/\s/g, '');
        } else {
          return this.student?.bestMatchPEN?.replace(/\s/g, '') === value?.replace(/\s/g, '');
        }
      default:
        return this.student[valueType]?.toLowerCase() === value?.toLowerCase();
      }
    },
    formatPen,
    formatMincode,
    formatPostalCode,
    formatDob,
    enableMatchOrUnMatch(matchedStudent) {
      if (this.student && matchedStudent) {
        if (this.showMatchButton(matchedStudent)) {
          this.hoveredOveredRowStudentID = matchedStudent.studentID;
          this.matchUnMatchButtonText = 'Match';
        } else if (this.showUnmatchButton(matchedStudent)) {
          this.hoveredOveredRowStudentID = matchedStudent.studentID;
          this.matchUnMatchButtonText = 'Unmatch';
        }
      }
    },
    disableMatchOrUnMatch() {
      this.hoveredOveredRowStudentID = null;
      this.matchUnMatchButtonText = '';
    },
  }
};
</script>

<style scoped>

#searchResults {
  background-color: #F2F2F2;
  z-index: 0;
}

.bottom-column-item {
  float: left;
  min-height: 1.75rem;
}

#penMatchResultsDataTable {
  background-color: #F2F2F2;
}


#penMatchResultsDataTable /deep/ table tbody tr:not(.selected-record):hover {
  background-color: inherit;
}

.double-column-item {
  float: right;
}

.top-column-item {
  float: left;
  min-height: 1rem;
}

.value-half-width {
  width: 3.9rem;
}

.v-data-table /deep/ tr td:nth-child(1) {
  width: 6%;
}
.v-data-table /deep/ tr td:nth-child(3),
.v-data-table /deep/ tr td:nth-child(4) {
  width: 17%;
}
.v-data-table /deep/ tr td:nth-child(5) {
  width: 17%;
}
.v-data-table /deep/ tr td:nth-child(6) {
  width: 11%;
}
.v-data-table /deep/ tr td:nth-child(2),
.v-data-table /deep/ tr td:nth-child(7) {
  width: 10%;
}

.v-data-table /deep/ tr td:nth-child(8) {
  width: 12%;
}

.pen-link {
  text-decoration: underline;
}

.sticky {
  position: sticky;
  z-index: 6;
  background-color: #F2F2F2;
}

.hovered-record-match-unmatch {
  background-color: #dff4fd !important;
}

.grayout {
  opacity: 0.5;
}

.matchedStudentRow {
  background-color: #E0EFD9 !important;
}
.resultsTableRow {
  height: 4.5rem; /*is effectively a 'min-height' with the way height on tables works*/
}
.resultsTableRow > td {
  border-bottom: thin solid rgba(0, 0, 0, 0.12)
}
.v-input--checkbox {
  margin-top: 0;
}
.checkbox {
  width: 100%;
  min-height: 1.7rem;
}
.checkbox /deep/ .v-messages {
  display: none;
}
.checkbox /deep/ .v-input__slot {
  margin-bottom: 0;
  padding-top: 0;
}
.checkboxIcon {
  min-height: 1rem;
}
.tableCell {
  padding-top: .3rem;
}
</style>
